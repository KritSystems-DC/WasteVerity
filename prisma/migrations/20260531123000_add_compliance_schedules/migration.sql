-- AlterTable
ALTER TABLE "ComplianceRecord" ADD COLUMN "scheduleId" TEXT;

-- CreateTable
CREATE TABLE "ComplianceSchedule" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "nextDueAt" TIMESTAMP(3) NOT NULL,
    "lastCompletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplianceRecord_scheduleId_idx" ON "ComplianceRecord"("scheduleId");

-- CreateIndex
CREATE INDEX "ComplianceSchedule_businessId_idx" ON "ComplianceSchedule"("businessId");

-- CreateIndex
CREATE INDEX "ComplianceSchedule_templateId_idx" ON "ComplianceSchedule"("templateId");

-- CreateIndex
CREATE INDEX "ComplianceSchedule_category_idx" ON "ComplianceSchedule"("category");

-- CreateIndex
CREATE INDEX "ComplianceSchedule_nextDueAt_idx" ON "ComplianceSchedule"("nextDueAt");

-- CreateIndex
CREATE INDEX "ComplianceSchedule_isActive_idx" ON "ComplianceSchedule"("isActive");

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ComplianceSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceSchedule" ADD CONSTRAINT "ComplianceSchedule_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
