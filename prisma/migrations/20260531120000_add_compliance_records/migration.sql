-- CreateTable
CREATE TABLE "ComplianceRecord" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "completedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceRecord_businessId_idx" ON "ComplianceRecord"("businessId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_templateId_idx" ON "ComplianceRecord"("templateId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_category_idx" ON "ComplianceRecord"("category");

-- CreateIndex
CREATE INDEX "ComplianceRecord_createdAt_idx" ON "ComplianceRecord"("createdAt");

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
