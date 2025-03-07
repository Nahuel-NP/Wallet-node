import { prisma } from "../../config/prismaClient";
import { PaginationDto } from "../../domain/dtos/shared/pagination.dto";
import { TransactionEntity } from "../../domain/entities/transaction.entity";
import { UserEntity } from "../../domain/entities/user.entity";
import { CustomError } from "../../domain/errors/custom.error";

export class TransactionService {
  constructor() {}

  public async getTransactions(user: UserEntity, paginationDto: PaginationDto) {
    const userFromDB = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });
    if (!userFromDB) throw CustomError.notFound("User not found");
    if (!userFromDB.isActive)
      throw CustomError.unauthorized("User is not active");

    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: userFromDB.id,
      },
    });
    if (!wallet) throw CustomError.notFound("Wallet not found");

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
      },
      skip: (paginationDto.page - 1) * paginationDto.limit,
      take: paginationDto.limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        operations: {
          select: {
            amount: true,
            operationType: true,
          },
        },
      },
    });

    const totalTransactions = await prisma.transaction.count({
      where: {
        walletId: wallet.id,
      },
    });
    console.log(transactions);
    return {
      transactions: transactions.map((transaction) =>
        TransactionEntity.fromObject(transaction)
      ),
      meta: {
        page: paginationDto.page,
        limit: paginationDto.limit,
        totalCurrentPage: transactions.length,
        totalItems: totalTransactions,
        totalPages: Math.ceil(totalTransactions / paginationDto.limit),
      },
    };
  }
}
