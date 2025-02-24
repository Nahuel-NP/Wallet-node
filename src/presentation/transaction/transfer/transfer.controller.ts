import { Request, Response } from "express";
import { TransferService } from "./transfer.service";
import { TransferDto } from "../../../domain/dtos/transactions/transfer.dto";
import { CustomError } from "../../../domain/errors/custom.error";

export class TransferController {
  constructor(private TransferService: TransferService) {}

  handleErrors = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  transfer = (req: Request, res: Response) => {
    const { cvuOrAlias, amount, user } = req.body;
    const [error, transferDto] = TransferDto.create({ cvuOrAlias, amount });

    if (error) return res.status(400).json({ error });

    this.TransferService.makeTransfer(transferDto!,user)
      .then((transfer) => {
        res.json(transfer);
      })
      .catch((error) => this.handleErrors(error, res));
  };
}
