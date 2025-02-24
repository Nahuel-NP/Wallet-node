import { prisma } from "../../../config/prismaClient";
import { TransferDto } from "../../../domain/dtos/transactions/transfer.dto";
import { UserEntity } from "../../../domain/entities/user.entity";
import { CustomError } from "../../../domain/errors/custom.error";

export class TransferService {
  async makeTransfer(trasnferDto: TransferDto, user: UserEntity) {
    const { cvuOrAlias, amount } = trasnferDto;
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

    if (!destinationWallet) {
      throw CustomError.notFound("Destination wallet not found");
    }
    if (destinationWallet.userId === user.id) {
      throw CustomError.forbiden("You can't transfer to yourself");
    }
    if (destinationWallet.user.isActive === false) {
      throw CustomError.forbiden("Destination user is not active");
    }
    return { trasnferDto, destinationWallet,amount };
  }
}
