import { Request, Response } from "express";
import { CustomError } from "../../domain/errors/custom.error";
import { TransactionService } from "./transaction.service";
import { PaginationDto } from "../../domain/dtos/shared/pagination.dto";

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  private handleErrors(error: unknown, res: Response) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }

  getTransactions = (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const [paginationError, paginationDto] = PaginationDto.create(
      +page,
      +limit
    );

    if (paginationError)
      return res.status(400).json({ error: paginationError });

    const { user } = req.body;

    this.transactionService
      .getTransactions(user, paginationDto!)
      .then((transactions) => res.json(transactions ))
      .catch((error) => this.handleErrors(error, res));
  };
}
