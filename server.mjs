import { startServer } from "./dist/server/entry.mjs";

const server = startServer();

const handleShutdown = () => {
  console.log("Received shutdown signal, closing server...");
  server.server.stop(() => {
    console.log("Server closed cleanly.");
    process.exit(0);
  });
};

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);
