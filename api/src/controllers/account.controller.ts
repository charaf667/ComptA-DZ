import { Response, Request, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { validationResult } from 'express-validator';
import prisma from '../config/prisma';
import { TypeCompte, CategorieCompte } from '@prisma/client';

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { parse } from 'csv-parse';

export const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.match(/\.csv$/)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers CSV sont autorisés'));
    }
  }
});

export const AccountController = {
  // Créer un nouveau compte
  async createAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Erreur de validation', errors: errors.array() });
      }

      const { code, label, classe, type, category, parentCode } = req.body;
      const tenantId = req.tenant?.id;
      
      // Vérifier si le tenant existe
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });
      
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant introuvable. Veuillez vous connecter avec un compte valide.' });
      }

      // Vérifier si le code existe déjà pour cette entreprise
      const existingAccount = await prisma.account.findFirst({
        where: { code, tenantId }
      });
      if (existingAccount) {
        return res.status(400).json({ message: 'Un compte avec ce code existe déjà.' });
      }

      // Validation stricte des enums
      // Support des entrées en minuscules ET majuscules
      const upperType = type?.toUpperCase();
      if (!upperType || !['DEBIT', 'CREDIT'].includes(upperType)) {
        return res.status(400).json({ message: "Le type de compte doit être 'debit' ou 'credit'." });
      }
      
      let accountType: TypeCompte = upperType === 'DEBIT' ? TypeCompte.DEBIT : TypeCompte.CREDIT;
      let accountCategory: CategorieCompte = CategorieCompte.DETAIL;
      
      if (category) {
        const upperCategory = category.toUpperCase();
        if (!['DETAIL', 'COLLECTIF'].includes(upperCategory)) {
          return res.status(400).json({ message: "La catégorie doit être 'detail' ou 'collectif'." });
        }
        accountCategory = upperCategory === 'COLLECTIF' ? CategorieCompte.COLLECTIF : CategorieCompte.DETAIL;
      }

      // Vérifier si le compte parent existe si parentCode est fourni
      let parentId = undefined;
      if (parentCode && parentCode.trim() !== '') {
        const parentAccount = await prisma.account.findFirst({
          where: { code: parentCode, tenantId }
        });
        if (!parentAccount) {
          return res.status(404).json({ message: 'Le compte parent spécifié est introuvable.' });
        }
        parentId = parentAccount.id;
      }

      try {
        // Créer le nouveau compte
        const newAccount = await prisma.account.create({
          data: {
            code,
            label,
            classe,
            type: accountType,
            category: accountCategory,
            isActive: true,
            tenant: { connect: { id: tenantId } },
            ...(parentId ? { parent: { connect: { id: parentId } } } : {})
          }
        });

        res.status(201).json({
          message: 'Compte créé avec succès.',
          account: newAccount
        });
      } catch (createError: any) {
        // Gestion spécifique des erreurs Prisma
        if (createError.code === 'P2025') { // Record not found for relation
          return res.status(404).json({ 
            message: 'Erreur de création du compte: relation non trouvée',
            detail: 'Vérifiez que votre compte utilisateur est associé à une entreprise valide.'
          });
        }
        throw createError; // Re-throw pour la gestion globale
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      res.status(500).json({ 
        message: 'Erreur serveur lors de la création du compte.', 
        detail: error.message || 'Erreur inconnue'
      });
    }
  },

  // Récupérer tous les comptes d'une entreprise
  async getAccounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenant?.id;
      
      const accounts = await prisma.account.findMany({
        where: { tenantId },
        orderBy: { code: 'asc' },
        include: {
          children: {
            select: {
              id: true,
              code: true,
              label: true,
              type: true
            }
          }
        }
      });

      res.json(accounts);
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des comptes' });
    }
  },

  // Récupérer un compte par son ID
  async getAccountById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      const account = await prisma.account.findFirst({
        where: { 
          id,
          tenantId 
        },
        include: {
          children: true
        }
      });
      
      if (!account) {
        return res.status(404).json({ message: 'Compte non trouvé' });
      }

      res.json(account);
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération du compte' });
    }
  },

  // Mettre à jour un compte
  async updateAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;
      const updates = req.body;

      // Ne pas permettre la modification du code
      if (updates.code) {
        return res.status(400).json({ message: "La modification du code de compte n'est pas autorisée." });
      }

      // Préparer les données de mise à jour
      const updateData: any = {};
      if (updates.label) updateData.label = updates.label;
      if (updates.classe) updateData.classe = updates.classe;
      if (updates.type) {
        if (!['DEBIT', 'CREDIT'].includes(updates.type.toUpperCase())) {
          return res.status(400).json({ message: "Le type de compte doit être 'DEBIT' ou 'CREDIT'." });
        }
        updateData.type = updates.type.toUpperCase() === 'DEBIT' ? TypeCompte.DEBIT : TypeCompte.CREDIT;
      }
      if (updates.category) {
        if (!['DETAIL', 'COLLECTIF'].includes(updates.category.toUpperCase())) {
          return res.status(400).json({ message: "La catégorie doit être 'DETAIL' ou 'COLLECTIF'." });
        }
        updateData.category = updates.category.toUpperCase() === 'COLLECTIF' ? CategorieCompte.COLLECTIF : CategorieCompte.DETAIL;
      }
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

      // Gestion du changement de parent
      if (typeof updates.parentCode !== 'undefined') {
        if (updates.parentCode === null || updates.parentCode === '') {
          updateData.parent = { disconnect: true };
        } else {
          const parentAccount = await prisma.account.findFirst({
            where: { code: updates.parentCode, tenantId }
          });
          if (!parentAccount) {
            return res.status(404).json({ message: 'Le compte parent spécifié est introuvable.' });
          }
          // Empêcher qu'un compte soit son propre parent
          const currentAccount = await prisma.account.findFirst({ where: { id, tenantId } });
          if (!currentAccount) {
            return res.status(404).json({ message: 'Compte non trouvé.' });
          }
          if (parentAccount.id === id) {
            return res.status(400).json({ message: 'Un compte ne peut pas être parent de lui-même.' });
          }
          // Empêcher les cycles : vérifier que le parent n'est pas un descendant du compte
          const isDescendant = async (childId: string, targetId: string): Promise<boolean> => {
            const children = await prisma.account.findMany({ where: { parentId: childId, tenantId } });
            for (const child of children) {
              if (child.id === targetId) return true;
              if (await isDescendant(child.id, targetId)) return true;
            }
            return false;
          };
          if (await isDescendant(id, parentAccount.id)) {
            return res.status(400).json({ message: 'Impossible de définir un descendant comme parent (cycle interdit).' });
          }
          updateData.parent = { connect: { id: parentAccount.id } };
        }
      }

      // Vérifier que le compte existe avant la mise à jour
      const existingAccount = await prisma.account.findFirst({
        where: { id, tenantId }
      });
      
      if (!existingAccount) {
        return res.status(404).json({ message: 'Compte non trouvé.' });
      }
      
      // Mise à jour du compte avec update au lieu de updateMany pour supporter les relations
      try {
        await prisma.account.update({
          where: { id },
          data: updateData
        });
      } catch (updateError) {
        console.error('Erreur détaillée lors de la mise à jour:', updateError);
        return res.status(400).json({ 
          message: 'Erreur lors de la mise à jour du compte', 
          detail: updateError instanceof Error ? updateError.message : 'Erreur inconnue'
        });
      }

      // Récupérer le compte mis à jour
      const account = await prisma.account.findFirst({ where: { id, tenantId } });
      res.json({
        message: 'Compte mis à jour avec succès.',
        account
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du compte.' });
    }
  },

  // Supprimer un compte
  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      // Vérifier si le compte a des écritures associées
      // À implémenter : vérifier s'il y a des écritures liées à ce compte
      
      // Vérifier si le compte a des sous-comptes
      const childrenCount = await prisma.account.count({
        where: { 
          parentId: id,
          tenantId 
        }
      });
      
      if (childrenCount > 0) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer un compte qui a des sous-comptes' 
        });
      }

      // Vérifier que le compte existe avant la suppression
      const existingAccount = await prisma.account.findFirst({
        where: { 
          id,
          tenantId 
        }
      });
      
      if (!existingAccount) {
        return res.status(404).json({ message: 'Compte non trouvé' });
      }
      
      // Supprimer le compte avec delete au lieu de deleteMany
      try {
        await prisma.account.delete({
          where: { id }
        });
      } catch (deleteError) {
        console.error('Erreur détaillée lors de la suppression:', deleteError);
        return res.status(400).json({ 
          message: 'Erreur lors de la suppression du compte', 
          detail: deleteError instanceof Error ? deleteError.message : 'Erreur inconnue'
        });
      }

      res.json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte' });
    }
  },

  // Importer un plan comptable par défaut
  async importDefaultChartOfAccounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenant?.id;
      
      // Vérifier si l'entreprise a déjà des comptes
      const existingAccounts = await prisma.account.count({
        where: { tenantId }
      });
      
      if (existingAccounts > 0) {
        return res.status(400).json({ 
          message: 'Un plan comptable existe déjà pour cette entreprise' 
        });
      }

      // Charger le plan comptable par défaut
      const defaultAccounts = [
        // Classe 1 - Capitaux propres
        { code: '101', label: 'Capital social', classe: 1, type: TypeCompte.CREDIT, category: CategorieCompte.COLLECTIF },
        { code: '106', label: 'Réserves', classe: 1, type: TypeCompte.CREDIT, category: CategorieCompte.COLLECTIF },
        { code: '120', label: 'Résultat de l\'exercice', classe: 1, type: TypeCompte.CREDIT, category: CategorieCompte.DETAIL },
        
        // Classe 2 - Immobilisations
        { code: '211', label: 'Terrains', classe: 2, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '213', label: 'Constructions', classe: 2, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '218', label: 'Matériel informatique', classe: 2, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '281', label: 'Amortissements', classe: 2, type: TypeCompte.CREDIT, category: CategorieCompte.DETAIL },
        
        // Classe 3 - Stocks
        { code: '301', label: 'Matières premières', classe: 3, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '355', label: 'Produits finis', classe: 3, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '371', label: 'Marchandises', classe: 3, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        
        // Classe 4 - Tiers
        { code: '401', label: 'Fournisseurs', classe: 4, type: TypeCompte.CREDIT, category: CategorieCompte.COLLECTIF },
        { code: '411', label: 'Clients', classe: 4, type: TypeCompte.DEBIT, category: CategorieCompte.COLLECTIF },
        { code: '421', label: 'Personnel', classe: 4, type: TypeCompte.DEBIT, category: CategorieCompte.COLLECTIF },
        { code: '445', label: 'TVA à payer', classe: 4, type: TypeCompte.CREDIT, category: CategorieCompte.DETAIL },
        
        // Classe 5 - Financiers
        { code: '512', label: 'Banques', classe: 5, type: TypeCompte.DEBIT, category: CategorieCompte.COLLECTIF },
        { code: '530', label: 'Caisse', classe: 5, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '164', label: 'Emprunts', classe: 5, type: TypeCompte.CREDIT, category: CategorieCompte.COLLECTIF },
        
        // Classe 6 - Charges
        { code: '601', label: 'Achats', classe: 6, type: TypeCompte.DEBIT, category: CategorieCompte.COLLECTIF },
        { code: '6061', label: 'Électricité', classe: 6, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '6132', label: 'Loyers', classe: 6, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '6262', label: 'Télécommunications', classe: 6, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        { code: '641', label: 'Rémunérations du personnel', classe: 6, type: TypeCompte.DEBIT, category: CategorieCompte.COLLECTIF },
        { code: '681', label: 'Dotations aux amortissements', classe: 6, type: TypeCompte.DEBIT, category: CategorieCompte.DETAIL },
        
        // Classe 7 - Produits
        { code: '701', label: 'Ventes de marchandises', classe: 7, type: TypeCompte.CREDIT, category: CategorieCompte.COLLECTIF },
        { code: '706', label: 'Prestations de services', classe: 7, type: TypeCompte.CREDIT, category: CategorieCompte.COLLECTIF },
        { code: '765', label: 'Produits financiers', classe: 7, type: TypeCompte.CREDIT, category: CategorieCompte.DETAIL }
      ];

      // Insérer les comptes un par un (pour gérer les relations parent/enfant correctement)
      for (const account of defaultAccounts) {
        await prisma.account.create({
          data: {
            code: account.code,
            label: account.label,
            classe: account.classe,
            type: account.type,
            category: account.category,
            isActive: true,
            tenant: { connect: { id: tenantId } }
          }
        });
      }

      res.status(201).json({
        message: 'Plan comptable importé avec succès',
        count: defaultAccounts.length
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'import du plan comptable:', error);
      res.status(500).json({ 
        message: 'Erreur serveur lors de l\'import du plan comptable',
        error: error.message 
      });
    }
  },

  // Importer un plan comptable depuis un CSV
  async importChartOfAccountsFromCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier CSV n\'a été téléchargé.' });
      }
      const tenantId = req.tenant?.id;
      // Vérifier si l'entreprise a déjà des comptes
      const existingAccounts = await prisma.account.count({ where: { tenantId } });
      if (existingAccounts > 0) {
        // UX-friendly: refuse si plan existant
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Un plan comptable existe déjà pour cette entreprise.' });
      }
      // Lecture et parsing du CSV
      const accounts = [];
      const parser = fs.createReadStream(req.file.path)
        .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }));
      for await (const record of parser) {
        // Validation minimale (code, label, classe, type, category)
        if (!record.code || !record.label || !record.classe || !record.type || !record.category) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: `Ligne invalide dans le CSV: ${JSON.stringify(record)}` });
        }
        accounts.push(record);
      }
      fs.unlinkSync(req.file.path);
      // Insertion en base
      for (const account of accounts) {
        await prisma.account.create({
          data: {
            code: account.code,
            label: account.label,
            classe: parseInt(account.classe, 10),
            type: account.type.toUpperCase(),
            category: account.category.toUpperCase(),
            isActive: true,
            tenant: { connect: { id: tenantId } }
          }
        });
      }
      res.status(201).json({ message: 'Plan comptable importé depuis CSV avec succès', count: accounts.length });
    } catch (error: any) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Erreur lors de l\'import CSV:', error);
      res.status(500).json({ message: 'Erreur serveur lors de l\'import CSV', error: error.message });
    }
  }
};
