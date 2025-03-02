import { Router } from "express";
import { TransferController } from "./transfer.controller";
import { TransferService } from "./transfer.service";
import { AuthMiddlaware } from "../../middlewares/auth.midleware";

export class TransferRoutes {
  static get routes(): Router {
    const router = Router();
    const transferService = new TransferService();
    const transferController = new TransferController(transferService);
    router.post("/", [AuthMiddlaware.validateJWT], transferController.transfer);
    return router;
  }
}
