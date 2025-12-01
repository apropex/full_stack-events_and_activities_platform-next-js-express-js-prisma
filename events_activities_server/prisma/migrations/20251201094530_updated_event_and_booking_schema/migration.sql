/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "paymentStatus",
DROP COLUMN "transactionId",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "trxId" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "totalBooked" INTEGER NOT NULL DEFAULT 0;
