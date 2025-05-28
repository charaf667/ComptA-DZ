"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
/**
 * Instance singleton du client Prisma
 * Utilisé pour se connecter à la base de données PostgreSQL
 */
const prisma = new client_1.PrismaClient();
exports.default = prisma;
