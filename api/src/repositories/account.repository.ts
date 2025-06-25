import prisma from '../config/prisma';
import { TypeCompte, CategorieCompte } from '@prisma/client';

export class AccountRepository {
  /**
   * Retourne l'UUID du compte (Account.id) pour un code donné dans le contexte d'un tenant.
   * @param tenantId ID du tenant
   * @param code Code comptable (ex: "7011")
   */
  async findIdByCode(tenantId: string, code: string): Promise<string | null> {
    const account = await prisma.account.findFirst({
      where: {
        tenantId,
        code,
      },
      select: { id: true },
    });
    return account?.id ?? null;
  }

  /**
   * Crée le compte de base s'il n'existe pas (utile pour seeds dynamiques ou mode dev).
   * @returns l'UUID du compte.
   */
  async upsertCoreAccount(
    tenantId: string,
    code: string,
    label: string,
    classe: number,
    type: TypeCompte = TypeCompte.DEBIT,
    category: CategorieCompte = CategorieCompte.DETAIL,
    isActive: boolean = true,
  ): Promise<string> {
    const existing = await prisma.account.findFirst({ where: { tenantId, code }, select: { id: true } });
    if (existing) return existing.id;

    const newAccount = await prisma.account.create({
      data: {
        tenantId,
        code,
        label,
        classe,
        type,
        category,
        isActive,
      },
      select: { id: true },
    });
    return newAccount.id;
  }
}

export default new AccountRepository();
