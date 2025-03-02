import { Router } from "express";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";

export class TransactionRoutes {
  static get routes(): Router {
    const router = Router();
    const transactionService = new TransactionService();
    const transactionController = new TransactionController(transactionService);
    router.get("/", transactionController.getTransactions);
    return router;
  }
}
