import { Request, Response } from "express";
import { CreditService } from "./credit.service";
import { CustomError } from "../../domain/errors/custom.error";

export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  private handleErrors = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.send(error.message).json({ error: error.message })
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  makeCredit = (req: Request, res: Response) => {
    this.creditService
      .getCredit()
      .then((credit) => res.json(credit))
      .catch((error) => this.handleErrors(error, res));
  };
}
