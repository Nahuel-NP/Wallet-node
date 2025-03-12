import { Request, Response } from "express";
import { WithdrawalService } from "./withdrawal.service";
import { WithdrawalDto } from "../../../domain/dtos/withdrawal/withdrawal.dto";

export class WithdrawalController {
  constructor(private withdrawalService: WithdrawalService) {}

  withdrawalMoney = (req: Request, res: Response) => {
    const { user, amount } = req.body;
    const [error, withdrawalDto] = WithdrawalDto.create({
      amount,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string) || req.ip || "Unknown";

    const userAgent = req.headers["user-agent"] || "Unknown";

    this.withdrawalService
      .withdrawal(user, withdrawalDto!, ipAddress, userAgent)
      .then((withdrawal) => res.json(withdrawal));
  };
}
