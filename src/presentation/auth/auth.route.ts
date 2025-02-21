import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();
    const authService = new AuthService();
    const authController = new AuthController(authService);
    router.post("/login", authController.login);
    router.post("/register", authController.register);

    return router;
  }
}
