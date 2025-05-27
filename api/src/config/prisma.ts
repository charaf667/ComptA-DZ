import { PrismaClient } from '@prisma/client';

/**
 * Instance singleton du client Prisma
 * Utilisé pour se connecter à la base de données PostgreSQL
 */
const prisma = new PrismaClient();

export default prisma;
