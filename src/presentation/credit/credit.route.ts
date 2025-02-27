import { Router } from "express";
import { CreditController } from "./credit.controller";
import { CreditService } from "./credit.service";

export class CreditRoutes {
  static get routes(): Router {
    const router = Router();
    const creditService = new CreditService();
    const creditController = new CreditController(creditService);
    router.post("/", creditController.makeCredit);
    return router;
  }
}
