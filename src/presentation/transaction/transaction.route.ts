import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import { AuthMiddlaware } from "../middlewares/auth.midleware";

export class TransactionRoutes {
  static get routes(): Router {
    const router = Router();
    const transactionService = new TransactionService();
    const transactionController = new TransactionController(transactionService);
    router.get(
      "/",
      [AuthMiddlaware.validateJWT],
      transactionController.getTransactions
    );
    return router;
  }
}
