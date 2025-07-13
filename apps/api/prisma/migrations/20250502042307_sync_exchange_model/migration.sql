/*
  Warnings:

  - You are about to drop the column `requesterOfferedServiceId` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Exchange" DROP CONSTRAINT "Exchange_requesterOfferedServiceId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Exchange_providerId_idx";

-- DropIndex
DROP INDEX "Exchange_providerServiceId_idx";

-- DropIndex
DROP INDEX "Exchange_requesterId_idx";

-- DropIndex
DROP INDEX "Exchange_requesterOfferedServiceId_idx";

-- DropIndex
DROP INDEX "Exchange_requesterServiceId_idx";

-- DropIndex
DROP INDEX "Exchange_status_idx";

-- AlterTable
ALTER TABLE "Exchange" DROP COLUMN "requesterOfferedServiceId",
ADD COLUMN     "requestedDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "hashedPassword";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";
