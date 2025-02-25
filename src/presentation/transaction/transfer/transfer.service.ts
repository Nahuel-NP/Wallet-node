import { prisma } from "../../../config/prismaClient";
import { TransferDto } from "../../../domain/dtos/transactions/transfer.dto";
import { UserEntity } from "../../../domain/entities/user.entity";
import { CustomError } from "../../../domain/errors/custom.error";
import { PrismaTx } from "../../../config/types/tx.type";
import { Wallet } from "@prisma/client";

export class TransferService {
  async makeTransfer(trasnferDto: TransferDto, user: UserEntity) {
    const { cvuOrAlias, amount } = trasnferDto;

    try {
      await prisma.$transaction(async (tx) => {
        const originWallet = await this.getWalletByUser(tx, user.id);

        if (Number(originWallet.balance) < amount) {
          throw CustomError.badRequest("Insufficient balance");
        }

        const destinationWallet = await this.getWalletFromCvuOrAlias(
          tx,
          cvuOrAlias
        );

        if (!destinationWallet) {
          throw CustomError.notFound("Destination wallet not found");
        }
        if (destinationWallet.userId === user.id) {
          throw CustomError.forbiden("You can't transfer to yourself");
        }
        if (destinationWallet.user.isActive === false) {
          throw CustomError.forbiden("Destination user is not active");
        }

        const [updatedFromWallet, updatedToWallet] = await Promise.all([
          this.decreaseAmountWallet(tx, user.id, originWallet, amount),
          this.increaseAmountWallet(tx, destinationWallet, amount),
        ]);

        // TODO:create operations
        
      });
    } catch (error) {
      console.log(error);
    }
  }

  private async createOperation() {
    // create operation
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

  private async getWalletByUser(tx: PrismaTx, id: string) {
    const originWallet = await tx.wallet.findFirst({
      where: {
        userId: id,
      },
    });

    if (!originWallet) {
      throw CustomError.notFound("Origin wallet not found");
    }
    return originWallet;
  }

  private async getWalletFromCvuOrAlias(tx: PrismaTx, cvuOrAlias: string) {
    const destinationWallet = await tx.wallet.findFirst({
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
