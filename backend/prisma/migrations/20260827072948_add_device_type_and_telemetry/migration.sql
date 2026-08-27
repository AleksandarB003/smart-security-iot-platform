/*
  Warnings:

  - Added the required column `type` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOTION', 'DOOR', 'SMOKE', 'CAMERA', 'GLASS_BREAK');

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "armed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "batteryLevel" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "type" "DeviceType" NOT NULL;
