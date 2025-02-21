import { Router } from "express";
import { AuthRoutes } from "./auth/auth.route";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes);

    return router;
  }
}
