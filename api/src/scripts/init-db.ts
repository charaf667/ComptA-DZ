import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Script d'initialisation de la base de données ComptaDZ
 * Crée un tenant par défaut, un utilisateur administrateur, et optionnellement les comptes par défaut.
 */
async function initializeDatabase() {
  console.log('Début de l\'initialisation de la base de données...');
  
  try {
    // 1. Vérifier si un tenant existe déjà
    const existingTenant = await prisma.tenant.findFirst();
    
    if (existingTenant) {
      console.log(`Un tenant existe déjà avec l'ID: ${existingTenant.id} et le nom: ${existingTenant.nom}`);
      return existingTenant;
    }
    
    // 2. Créer un tenant par défaut
    console.log('Création du tenant par défaut...');
    const defaultTenant = await prisma.tenant.create({
      data: {
        nom: 'Entreprise ComptaDZ',
        createdAt: new Date()
      }
    });
    console.log(`Tenant créé avec l'ID: ${defaultTenant.id}`);
    
    // 3. Créer un utilisateur admin
    console.log('Création de l\'utilisateur administrateur...');
    const hashedPassword = await hash('Admin@123', 10); // Mot de passe par défaut
    
    const adminUser = await prisma.user.create({
      data: {
        nom: 'Administrateur',
        email: 'admin@comptadz.com',
        password: hashedPassword,
        role: Role.ADMIN,
        tenantId: defaultTenant.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log(`Utilisateur administrateur créé avec l'ID: ${adminUser.id}`);
    console.log(`Email: admin@comptadz.com | Mot de passe: Admin@123`);
    
    console.log('Initialisation de la base de données terminée avec succès!');
    return defaultTenant;
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si lancé directement
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur fatale lors de l\'initialisation:', error);
      process.exit(1);
    });
} else {
  // Exporter la fonction pour pouvoir l'utiliser ailleurs
  module.exports = { initializeDatabase };
}
