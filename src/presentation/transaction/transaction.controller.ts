import { Request, Response } from "express";
import { CustomError } from "../../domain/errors/custom.error";
import { TransactionService } from "./transaction.service";

export class TransactionController {
  constructor(private transactionService:TransactionService) {}

  private handleErrors(error: unknown, res: Response) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }

  getTransactions = (req: Request, res: Response) => {
    this.transactionService
      .getTransactions()
      .then((transactions) => res.json({transactions}))
      .catch((error) => this.handleErrors(error, res));
  };
}
