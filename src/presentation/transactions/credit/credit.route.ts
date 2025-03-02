import { Router } from "express";
import { CreditController } from "./credit.controller";
import { CreditService } from "./credit.service";
import { AuthMiddlaware } from "../../middlewares/auth.midleware";


export class CreditRoutes {
  static get routes(): Router {
    const router = Router();
    const creditService = new CreditService();
    const creditController = new CreditController(creditService);
    router.post("/", [AuthMiddlaware.validateJWT], creditController.makeCredit);
    return router;
  }
}
