/*
  Warnings:

  - A unique constraint covering the columns `[cvu]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Wallet_cvu_key" ON "Wallet"("cvu");
