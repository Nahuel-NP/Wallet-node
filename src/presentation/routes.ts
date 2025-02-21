import { Request, Response, Router } from "express";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.get('/api',(req:Request,res:Response)=>{
      res.json({
        msg:'Hola mundo'
      })
    })

    return router;
  }
}
