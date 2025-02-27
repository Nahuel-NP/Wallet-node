import { Router } from "express";
import { AuthRoutes } from "./auth/auth.route";
import { TransferRoutes } from "./transaction/transfer/transfer.route";
import { CreditRoutes } from "./credit/credit.route";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/transfer", TransferRoutes.routes);
    router.use("/api/credit", CreditRoutes.routes);

    return router;
  }
}
