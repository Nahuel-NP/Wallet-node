import { Transaction, Wallet } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { CreateCreditDto } from "../../domain/dtos/credit/createCredit.dto";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  STATUS,
  TRANSACTION_TYPE,
} from "../../config/constants/transaction.constant";

export class CreditService {
  async getCredit(userToCredit: UserEntity, createCreditDto: CreateCreditDto) {
    const user = await prisma.user.findUnique({
      where: {
        id: userToCredit.id,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.isActive) {
      throw new Error("User is not active");
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: userToCredit.id,
      },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const transaction = await this.initTransaction(
      wallet,
      createCreditDto.amount
    );

    return transaction;
  }

  private async initTransaction(
    wallet: Wallet,
    amount: number
  ): Promise<Transaction> {
    const transcationId = crypto.randomUUID();
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        walletId: wallet.id,
        transactionType: TRANSACTION_TYPE.DEPOSIT,
        transactionId: transcationId,
        status: STATUS.PENDING,
      },
    });

    return transaction;
  }
}
