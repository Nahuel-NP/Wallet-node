import { Transaction, User, Wallet } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { CreateCreditDto } from "../../domain/dtos/credit/createCredit.dto";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  OPERATION_TYPE,
  SECURY_LOG_ACTION,
  STATUS,
  TRANSACTION_TYPE,
} from "../../config/constants/transaction.constant";
import { TransactionEntity } from "../../domain/entities/transaction.entity";

export class CreditService {
  async deposit(userToCredit: UserEntity, createCreditDto: CreateCreditDto) {
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

    // proces accredit
    this.processDeposit(transaction, user);

    const transactionEntity = TransactionEntity.fromObject(transaction);
    return transactionEntity;
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

  private async processDeposit(transaction: Transaction, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        
        await tx.wallet.update({
          where: {
            id: transaction.walletId,
          },
          data: {
            balance: { increment: transaction.amount },
          },
        });

        const operation = await tx.operation.create({
          data: {
            amount: transaction.amount,
            operationType: OPERATION_TYPE.CREDIT,
            transactionId: transaction.id,
          },
        });

        await tx.transaction.update({
          where: {
            transactionId: transaction.transactionId,
          },
          data: {
            status: STATUS.COMPLETED,
            operations: {
              connect: { id: operation.id },
            },
          },
        });
      });
      await prisma.securityLog.create({
        data: {
          action: SECURY_LOG_ACTION.DEPOSIT,
          ipAddress: "TODO",
          userAgent: "TODO",
          userId: user.id,
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      prisma.transaction.update({
        where: {
          transactionId: transaction.transactionId,
        },
        data: {
          status: STATUS.REJECTED,
        },
      });

      prisma.securityLog.create({
        data: {
          action: SECURY_LOG_ACTION.DEPOSIT_FAILED,
          ipAddress: "TODO",
          userAgent: "TODO",
          userId: user.id,
        },
      });
    }
  }
}
