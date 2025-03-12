import { Request, Response } from "express";
import { WithdrawalService } from "./withdrawal.service";

export class WithdrawalController {
  constructor(private withdrawalService: WithdrawalService) {}

  withdrawalMoney = (req: Request, res: Response) => {
    this.withdrawalService
      .withdrawal()
      .then((withdrawal) => res.json(withdrawal));
  };
}
