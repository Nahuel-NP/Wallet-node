import { Router } from "express";
import { AuthRoutes } from "./auth/auth.route";
import { TransferRoute } from "./transaction/transfer/transfer.route";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes);
    router.use("/api/transfer", TransferRoute.routes);

    return router;
  }
}
