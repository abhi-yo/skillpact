/*
  Warnings:

  - You are about to drop the column `isSwap` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `providerHours` on the `Exchange` table. All the data in the column will be lost.
  - You are about to drop the column `requesterHours` on the `Exchange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exchange" DROP COLUMN "isSwap",
DROP COLUMN "providerHours",
DROP COLUMN "requesterHours";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3);
