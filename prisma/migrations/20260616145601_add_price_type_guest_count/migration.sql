-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "guest_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "price_type" VARCHAR(20) NOT NULL DEFAULT 'night';
