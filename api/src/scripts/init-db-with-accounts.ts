import { PrismaClient, Role, TypeCompte, CategorieCompte } from '@prisma/client';
import accountRepo from '../repositories/account.repository';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Script d'initialisation complet de la base de données ComptaDZ
 * Crée un tenant par défaut, un utilisateur administrateur, et le plan comptable par défaut.
 */
export async function initializeDatabase() {
  console.log('Début de l\'initialisation complète de la base de données...');
  
  try {
    // 1. Vérifier si un tenant existe déjà
    const existingTenant = await prisma.tenant.findFirst();
    
    let tenant;
    if (existingTenant) {
      console.log(`Un tenant existe déjà avec l'ID: ${existingTenant.id} et le nom: ${existingTenant.nom}`);
      tenant = existingTenant;
    } else {
      // 2. Créer un tenant par défaut
      console.log('Création du tenant par défaut...');
      tenant = await prisma.tenant.create({
        data: {
          nom: 'Entreprise ComptaDZ',
          createdAt: new Date()
        }
      });
      console.log(`Tenant créé avec l'ID: ${tenant.id}`);
    }
    
    // 3. Vérifier si un utilisateur admin existe déjà pour ce tenant
    const existingAdmin = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        role: Role.ADMIN
      }
    });
    
    if (!existingAdmin) {
      // Créer un utilisateur admin
      console.log('Création de l\'utilisateur administrateur...');
      const hashedPassword = await hash('Admin@123', 10); // Mot de passe par défaut
      
      const adminUser = await prisma.user.create({
        data: {
          nom: 'Administrateur',
          email: 'admin@comptadz.com',
          password: hashedPassword,
          role: Role.ADMIN,
          tenantId: tenant.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`Utilisateur administrateur créé avec l'ID: ${adminUser.id}`);
      console.log(`Email: admin@comptadz.com | Mot de passe: Admin@123`);
    } else {
      console.log(`Un utilisateur administrateur existe déjà avec l'ID: ${existingAdmin.id}`);
    }
    
    // 4. Vérifier si des comptes existent déjà pour ce tenant
    const existingAccounts = await prisma.account.count({
      where: { tenantId: tenant.id }
    });
    
    if (existingAccounts > 0) {
      console.log(`${existingAccounts} comptes existent déjà pour ce tenant. Aucun compte ne sera créé.`);
    } else {
      console.log('Création du plan comptable par défaut...');
      
      // Plan comptable par défaut (version simplifiée)
      const defaultAccounts = [
        // Classe 1 - Capitaux propres
        { code: '101', label: 'Capital social', classe: 1, type: TypeCompte.CREDIT, category: CategorieCompte.DETAIL },
        { code: '106', label: 'Réserves', classe: 1, type: TypeCompte.CREDIT, category: CategorieCompte.DETAIL },
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

      // Insérer les comptes un par un
      for (const account of defaultAccounts) {
        await accountRepo.upsertCoreAccount(
          tenant.id,
          account.code,
          account.label,
          account.classe,
          account.type,
          account.category,
          true
        );
      }
      
      console.log(`${defaultAccounts.length} comptes ont été créés pour le tenant.`);
    }
    
    console.log('Initialisation de la base de données terminée avec succès!');
    return tenant;
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script d'exécution
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Script terminé avec succès.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur fatale lors de l\'initialisation:', error);
      process.exit(1);
    });
} else {
  // Exporter la fonction pour pouvoir l'utiliser ailleurs
  module.exports = { initializeDatabase };
}
