-- AlterTable
ALTER TABLE "Exchange" ADD COLUMN     "isSwap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providerHours" DOUBLE PRECISION,
ADD COLUMN     "requesterHours" DOUBLE PRECISION;
