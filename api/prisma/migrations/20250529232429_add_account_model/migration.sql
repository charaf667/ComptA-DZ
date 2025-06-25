/*
  Warnings:

  - You are about to drop the `PlanComptable` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeCompte" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "CategorieCompte" AS ENUM ('DETAIL', 'COLLECTIF');

-- DropForeignKey
ALTER TABLE "PlanComptable" DROP CONSTRAINT "PlanComptable_tenantId_fkey";

-- DropTable
DROP TABLE "PlanComptable";

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "classe" INTEGER NOT NULL,
    "type" "TypeCompte" NOT NULL,
    "category" "CategorieCompte" NOT NULL DEFAULT 'DETAIL',
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modifiePar" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_classe_tenantId_idx" ON "accounts"("classe", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_code_tenantId_key" ON "accounts"("code", "tenantId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
