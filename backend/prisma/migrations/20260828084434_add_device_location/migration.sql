/*
  Warnings:

  - Added the required column `location` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "location" TEXT NOT NULL;
