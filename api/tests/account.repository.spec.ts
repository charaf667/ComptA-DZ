import accountRepo from '../src/repositories/account.repository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('AccountRepository.upsertCoreAccount', () => {
  const tenantId = '00000000-0000-0000-0000-000000000111';

  it('should create account if not exists then return same id on second call', async () => {
    const id1 = await accountRepo.upsertCoreAccount(tenantId, '701', 'Ventes', 7);
    const id2 = await accountRepo.upsertCoreAccount(tenantId, '701', 'Ventes', 7);

    expect(id1).toBe(id2);

    const row = await prisma.account.findUnique({ where: { id: id1 } });
    expect(row?.code).toBe('701');
    expect(row?.tenantId).toBe(tenantId);
  });
});
