import { Router } from "express";
import { AuthRoutes } from "./auth/auth.route";
import { TransferRoutes } from "./transactions/transfer/transfer.route";
import { CreditRoutes } from "./transactions/credit/credit.route";


export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/transactions/transfer", TransferRoutes.routes);
    router.use("/api/transactions/credit", CreditRoutes.routes);

    return router;
  }
}
