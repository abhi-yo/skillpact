/*
  Warnings:

  - You are about to drop the column `latitude` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Location` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "coordinates" geometry;

-- CreateIndex
CREATE INDEX "Location_coordinates_idx" ON "Location" USING GIST ("coordinates");
