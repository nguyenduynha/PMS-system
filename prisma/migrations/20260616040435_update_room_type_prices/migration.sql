/*
  Warnings:

  - You are about to drop the column `price_per_night` on the `room_types` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_night` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "room_types" DROP COLUMN "price_per_night",
ADD COLUMN     "day_price" DECIMAL(65,30) NOT NULL DEFAULT 400000,
ADD COLUMN     "hourly_price" DECIMAL(65,30) NOT NULL DEFAULT 80000,
ADD COLUMN     "night_price" DECIMAL(65,30) NOT NULL DEFAULT 300000;

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "price_per_night";
