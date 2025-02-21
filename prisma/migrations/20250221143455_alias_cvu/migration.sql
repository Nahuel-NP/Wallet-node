/*
  Warnings:

  - Added the required column `alias` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cvu` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "cvu" INTEGER NOT NULL;
