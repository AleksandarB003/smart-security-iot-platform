/*
  Warnings:

  - A unique constraint covering the columns `[sessionToken]` on the table `Device` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "sessionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "sessionToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Device_sessionToken_key" ON "Device"("sessionToken");
