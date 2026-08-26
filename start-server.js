process.env.ASTRO_NODE_AUTOSTART = "disabled";

// TODO: logging

import { startServer } from "./dist/server/entry.mjs";
import { db } from "./src/lib/db";

const server = startServer();

const handleShutdown = () => {
  console.log("Received shutdown signal, closing server...");
  db.close();
  server.server.stop(() => {
    console.log("Server closed cleanly.");
    process.exit(0);
  });
};

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);
