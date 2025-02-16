import { Router } from "express";
import { Server } from "./presentation/server";

function main() {
  const server = new Server({
    port: 3000,
    routes: Router(),
  });

  server.start();
}

main();
