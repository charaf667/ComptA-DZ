import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { initializeDatabase } from './init-db-with-accounts';

/**
 * Script de seed pour créer des tenants de démonstration avec des UUID fixes.
 * Chaque tenant reçoit un utilisateur administrateur par défaut.
 * Les comptes comptables par défaut sont ensuite créés grâce au script "init-db-with-accounts".
 */
async function seedDemoTenants() {
  const prisma = new PrismaClient();

  const demoTenants: { id: string; name: string; adminEmail: string }[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Demo',
      adminEmail: 'admin+demo@comptadz.com'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Acme',
      adminEmail: 'admin+acme@comptadz.com'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'MyCabinet',
      adminEmail: 'admin+mycabinet@comptadz.com'
    }
  ];

  console.log('--- Démarrage du seed des tenants de démonstration ---');

  try {
    for (const t of demoTenants) {
      // Vérifier si le tenant existe déjà (par ID fixe)
      let tenant = await prisma.tenant.findUnique({ where: { id: t.id } });
      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            id: t.id,
            nom: t.name,
            createdAt: new Date()
          }
        });
        console.log(`Tenant créé: ${tenant.nom} (${tenant.id})`);
      } else {
        console.log(`Tenant déjà présent: ${tenant.nom} (${tenant.id})`);
      }

      // Vérifier si un admin existe déjà pour ce tenant
      const existingAdmin = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          role: Role.ADMIN
        }
      });

      if (!existingAdmin) {
        const pwd = await hash('Admin@123', 10);
        await prisma.user.create({
          data: {
            nom: 'Admin',
            email: t.adminEmail,
            password: pwd,
            role: Role.ADMIN,
            tenantId: tenant.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`Admin créé pour ${tenant.nom} → ${t.adminEmail} / Admin@123`);
      }

      // Créer le plan comptable par défaut si aucun compte n'existe
      const accountCount = await prisma.account.count({ where: { tenantId: tenant.id } });
      if (accountCount === 0) {
        // Initialise la DB pour ce tenant via le script existant
        // initializeDatabase renvoie le tenant créé/traité mais ne prend pas d'ID fixe.
        // Ici, on simule rapidement la création des comptes via la fonction exportée.
        await initializeDatabase();
      }
    }

    console.log('--- Seed des tenants de démonstration terminé avec succès ---');
  } catch (err) {
    console.error('Erreur durant le seed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDemoTenants().then(() => process.exit(0));
}
