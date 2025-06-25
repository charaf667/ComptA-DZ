import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000111';

beforeAll(async () => {
  // Reset tables dépendantes
  await prisma.$executeRaw`TRUNCATE TABLE "accounts" CASCADE`;
  // Upsert tenant de test pour satisfaire la FK accounts. 
  await prisma.tenant.upsert({
    where: { id: TEST_TENANT_ID },
    update: {},
    create: {
      id: TEST_TENANT_ID,
      nom: 'Tenant de test',
      createdAt: new Date(),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
