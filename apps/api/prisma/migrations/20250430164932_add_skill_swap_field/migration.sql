/*
  Warnings:

  - You are about to drop the column `requestedDate` on the `Exchange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exchange" DROP COLUMN "requestedDate",
ADD COLUMN     "requesterOfferedServiceId" TEXT;

-- CreateIndex
CREATE INDEX "Exchange_requesterId_idx" ON "Exchange"("requesterId");

-- CreateIndex
CREATE INDEX "Exchange_providerId_idx" ON "Exchange"("providerId");

-- CreateIndex
CREATE INDEX "Exchange_requesterServiceId_idx" ON "Exchange"("requesterServiceId");

-- CreateIndex
CREATE INDEX "Exchange_providerServiceId_idx" ON "Exchange"("providerServiceId");

-- CreateIndex
CREATE INDEX "Exchange_requesterOfferedServiceId_idx" ON "Exchange"("requesterOfferedServiceId");

-- CreateIndex
CREATE INDEX "Exchange_status_idx" ON "Exchange"("status");

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_requesterOfferedServiceId_fkey" FOREIGN KEY ("requesterOfferedServiceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
