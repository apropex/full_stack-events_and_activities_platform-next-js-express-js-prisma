-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "EventApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "approveStatus" "EventApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'OFFLINE';
