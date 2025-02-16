import express, { Router } from "express";
import { Server as ServerI } from "http";

interface Options {
  port?: number;
  routes: Router;
}
export class Server {
  public readonly app = express();
  private readonly port: number = 3000;
  private readonly router: Router;
  private serverListener?: ServerI;

  constructor(options: Options) {
    this.port = options.port || this.port;
    this.router = options.routes;
  }

  start() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.router);

    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  close() {
    this.serverListener?.close();
  }
}
