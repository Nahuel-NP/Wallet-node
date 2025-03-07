import { prisma } from "../../../config/prismaClient";
import { TransferDto } from "../../../domain/dtos/transactions/transfer.dto";
import { UserEntity } from "../../../domain/entities/user.entity";
import { CustomError } from "../../../domain/errors/custom.error";
import { PrismaTx } from "../../../config/types/tx.type";
import { Transaction, Wallet } from "@prisma/client";
import {
  SECURY_LOG_ACTION,
  STATUS,
} from "../../../config/constants/transaction.constant";
import { TransactionEntity } from "../../../domain/entities/transaction.entity";

export class TransferService {
  async makeTransfer(trasnferDto: TransferDto, user: UserEntity,ipAddress: string, userAgent: string) {
    const { cvuOrAlias, amount } = trasnferDto;

    // get origin wallet
    const originWallet = await this.getWalletByUser(user.id);

    if (Number(originWallet.balance) < amount) {
      throw CustomError.badRequest("Insufficient balance");
    }

    // get destination wallet
    const destinationWallet = await this.getWalletFromCvuOrAlias(cvuOrAlias);

    if (!destinationWallet) {
      throw CustomError.notFound("Destination wallet not found");
    }

    if (destinationWallet.userId === user.id) {
      throw CustomError.forbiden("You can't transfer to yourself");
    }

    if (destinationWallet.user.isActive === false) {
      throw CustomError.forbiden("Destination user is not active");
    }
    // init transaction with pending state
    const transaction = await this.initTransaction({
      transactionId: crypto.randomUUID(),
      transactionType: "transfer",
      amount: amount,
      walletId: originWallet.id,
    });

    
    if (!transaction) {
      throw CustomError.internalServer("Transaction not created");
    }
    const transactionEntity = TransactionEntity.fromObject(transaction);

    // process transfer in background
    this.processTransfer({
      amount,
      originWallet,
      destinationWallet,
      transaction,
      user,
      ipAddress,
      userAgent,
    });

    // return transaction with pending state
    return transactionEntity;
  }

  private async processTransfer(options: {
    amount: number;
    originWallet: Wallet;
    destinationWallet: Wallet;
    transaction: Transaction;
    user: UserEntity;
    ipAddress: string;
    userAgent: string;
  }) {
    const { amount, originWallet, destinationWallet, transaction, user,ipAddress,userAgent } =
      options;

    try {
      await prisma.$transaction(async (ctx) => {
        // update wallets
        const [updatedFromWallet, updatedToWallet] = await Promise.all([
          this.decreaseAmountWallet(ctx, user.id, originWallet, amount),
          this.increaseAmountWallet(ctx, destinationWallet, amount),
        ]);
        if (!updatedFromWallet || !updatedToWallet) {
          throw CustomError.internalServer("Wallet not updated");
        }
        // create operations
        const debitOperation = await this.createOperation(ctx, {
          transactionId: transaction.id,
          amount: amount,
          type: "debit",
        });

        const creditOperation = await this.createOperation(ctx, {
          transactionId: transaction.id,
          amount: amount,
          type: "credit",
        });

        // update transaction
        const updatedTransaction = await ctx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: STATUS.COMPLETED,
            operations: {
              connect: [{ id: debitOperation.id }, { id: creditOperation.id }],
            },
          },
        });

        // create security log
        await ctx.securityLog.create({
          data: {
            userId: user.id,
            action: SECURY_LOG_ACTION.TRANSFER,
            ipAddress,
            userAgent
          },
        });

        return { success: true, transactionId: updatedTransaction.id };
      });
    } catch (error) {
      console.log(error);
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "failed" },
      });

      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: SECURY_LOG_ACTION.TRANSFER_FAILED,
          ipAddress: "TODO",
          userAgent: "TODO",
        },
      });

      throw new Error(`Error en la transferencia: ${error}`);
    }
  }

  private async initTransaction(transactionOption: {
    transactionId: string;
    transactionType: string;
    amount: number;
    walletId: string;
  }) {
    const transacion = await prisma.transaction.create({
      data: {
        status: STATUS.PENDING,
        transactionId: transactionOption.transactionId,
        amount: transactionOption.amount,
        transactionType: transactionOption.transactionType,
        walletId: transactionOption.walletId,
      },
    });

    return transacion;
  }

  private async createOperation(
    ctx: PrismaTx,
    operationOptions: {
      transactionId: string;
      amount: number;
      type: string;
    }
  ) {
    const operation = await ctx.operation.create({
      data: {
        transactionId: operationOptions.transactionId,
        amount: operationOptions.amount,
        operationType: operationOptions.type,
      },
    });
    return operation;
  }

  private async increaseAmountWallet(
    tx: PrismaTx,
    destinationWallet: Wallet,
    amount: number
  ) {
    const updatedWallet = await tx.wallet.update({
      where: {
        id: destinationWallet.id,
        version: destinationWallet.version,
      },
      data: {
        balance: {
          increment: amount,
        },
        version: {
          increment: 1,
        },
      },
    });
    return updatedWallet;
  }

  private async decreaseAmountWallet(
    tx: PrismaTx,
    user_id: string,
    originWallet: Wallet,
    amount: number
  ) {
    const wallet = await tx.wallet.update({
      where: {
        userId: user_id,
        version: originWallet.version,
      },
      data: {
        balance: {
          decrement: amount,
        },
        version: { increment: 1 },
      },
    });
    return wallet;
  }

  private async getWalletByUser(id: string) {
    const originWallet = await prisma.wallet.findFirst({
      where: {
        userId: id,
      },
    });

    if (!originWallet) {
      throw CustomError.notFound("Origin wallet not found");
    }
    return originWallet;
  }

  private async getWalletFromCvuOrAlias(cvuOrAlias: string) {
    const destinationWallet = await prisma.wallet.findFirst({
      where: {
        OR: [
          {
            cvu: cvuOrAlias,
          },
          {
            alias: cvuOrAlias,
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return destinationWallet;
  }
}
