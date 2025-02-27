import { Router } from "express";

export class CreditRoutes {
  static get routes(): Router {
    const router = Router();

    router.post("/", (req, res) => {
      res.json("get credit");
    });
    return router;
  }
}
