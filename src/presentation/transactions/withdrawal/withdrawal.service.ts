import { Transaction, User, Wallet } from "@prisma/client";
import { prisma } from "../../../config/prismaClient";
import { WithdrawalDto } from "../../../domain/dtos/withdrawal/withdrawal.dto";
import { UserEntity } from "../../../domain/entities/user.entity";
import { TransactionEntity } from "../../../domain/entities/transaction.entity";
import {
  OPERATION_TYPE,
  SECURY_LOG_ACTION,
  STATUS,
  TRANSACTION_TYPE,
} from "../../../config/constants/transaction.constant";

export class WithdrawalService {
  async withdrawal(
    userToWithdraw: UserEntity,
    withdrawalDto: WithdrawalDto,
    ipAddress: string,
    userAgent: string
  ) {
    const user = await prisma.user.findUnique({
      where: {
        id: userToWithdraw.id,
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
        userId: userToWithdraw.id,
      },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const transaction = await this.initTransaction(
      wallet,
      withdrawalDto.amount
    );

    this.processWithdrawal(transaction, user, ipAddress, userAgent);
    const transactionEntity = TransactionEntity.fromObject(transaction);
    return transactionEntity;
  }

  private async initTransaction(wallet: Wallet, amount: number) {
    const transactioId = crypto.randomUUID();
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        receiverWalletId: wallet.id,
        transactionType: TRANSACTION_TYPE.WITHDRAW,
        transactionId: transactioId,
        status: STATUS.PENDING,
      },
    });

    return transaction;
  }

  private async processWithdrawal(
    transaction: Transaction,
    user: User,
    ipAddress: string,
    userAgent: string
  ) {
    try {
      await prisma.$transaction(async (ctx) => {
        await ctx.wallet.update({
          where: {
            id: transaction.receiverWalletId!,
          },
          data: {
            balance: { decrement: transaction.amount },
          },
        });

        const operation = await ctx.operation.create({
          data: {
            amount: transaction.amount,
            operationType: OPERATION_TYPE.DEBIT,
            transactionId: transaction.id,
          },
        });

        await ctx.transaction.update({
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

        await ctx.securityLog.create({
          data: {
            action: SECURY_LOG_ACTION.WITHDRAWAL,
            ipAddress: ipAddress,
            userAgent: userAgent,
            userId: user.id,
          },
        });
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
          action: SECURY_LOG_ACTION.WITHDRAWAL_FAILED,
          ipAddress: ipAddress,
          userAgent: userAgent,
          userId: user.id,
        },
      });
    }
  }
}
