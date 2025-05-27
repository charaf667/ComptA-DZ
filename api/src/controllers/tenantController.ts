import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import bcrypt from 'bcrypt';

/**
 * Créer un nouveau tenant avec un utilisateur admin
 */
export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nomTenant, nomAdmin, emailAdmin, passwordAdmin } = req.body;

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: emailAdmin },
    });

    if (existingUser) {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
      return;
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordAdmin, salt);

    // Créer le tenant et l'utilisateur admin dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer le tenant
      const tenant = await tx.tenant.create({
        data: {
          nom: nomTenant
        }
      });

      // Créer l'utilisateur admin
      const admin = await tx.user.create({
        data: {
          nom: nomAdmin,
          email: emailAdmin,
          password: hashedPassword,
          role: 'ADMIN',
          tenant: { connect: { id: tenant.id } }
        }
      });

      return { tenant, admin };
    });

    res.status(201).json({
      message: 'Entreprise créée avec succès',
      tenant: {
        id: result.tenant.id,
        nom: result.tenant.nom
      },
      admin: {
        id: result.admin.id,
        nom: result.admin.nom,
        email: result.admin.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du tenant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Récupérer les informations du tenant actuel
 */
export const getTenantInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenant },
      select: {
        id: true,
        nom: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            factures: true
          }
        }
      }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Tenant non trouvé' });
      return;
    }

    res.json(tenant);
  } catch (error) {
    console.error('Erreur lors de la récupération du tenant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
