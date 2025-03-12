import { Router } from "express";
import { WithdrawalController } from "./withdrawal.controller";
import { WithdrawalService } from "./withdrawal.service";

export class WithdrawalRoutes {
  static get routes(): Router {
    const router = Router();
    const withdrawalService = new WithdrawalService();
    const withdrawalController = new WithdrawalController(withdrawalService);
    router.get("/", withdrawalController.withdrawalMoney);
    return router;
  }
}
