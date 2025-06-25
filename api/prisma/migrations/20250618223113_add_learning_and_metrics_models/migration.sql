-- CreateTable
CREATE TABLE "learning_patterns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" TIMESTAMP(3) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_performance_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "totalSuggestions" INTEGER NOT NULL DEFAULT 0,
    "acceptedSuggestions" INTEGER NOT NULL DEFAULT 0,
    "rejectedSuggestions" INTEGER NOT NULL DEFAULT 0,
    "averageDecisionTimeMs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "explanationsData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_patterns_tenantId_accountId_idx" ON "learning_patterns"("tenantId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_patterns_tenantId_pattern_accountId_key" ON "learning_patterns"("tenantId", "pattern", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_performance_metrics_tenantId_key" ON "tenant_performance_metrics"("tenantId");

-- AddForeignKey
ALTER TABLE "learning_patterns" ADD CONSTRAINT "learning_patterns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_patterns" ADD CONSTRAINT "learning_patterns_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_performance_metrics" ADD CONSTRAINT "tenant_performance_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
