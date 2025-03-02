import { Request, Response } from "express";
import { CreditService } from "./credit.service";
import { CustomError } from "../../../domain/errors/custom.error";
import { CreateCreditDto } from "../../../domain/dtos/credit/createCredit.dto";


export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  private handleErrors = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.send(error.message).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  makeCredit = (req: Request, res: Response) => {
    const { user, amount } = req.body;
    const [error, createCreditDto] = CreateCreditDto.create({
      amount,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    this.creditService
      .deposit(user, createCreditDto!)
      .then((credit) => res.json(credit))
      .catch((error) => this.handleErrors(error, res));
  };
}
