import { Router } from "express";
import { Server } from "./presentation/server";
import { envs } from "./config/envs";

function main() {
  const server = new Server({
    port: envs.PORT,
    routes: Router(),
  });

  server.start();
}

main();
