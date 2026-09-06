import gracefulShutdown from "http-graceful-shutdown";

import { startServer } from "./dist/server/entry.mjs";

const server = startServer();

gracefulShutdown(server.server.server, {
  signals: "SIGINT SIGTERM",
  timeout: 10_000,
  onShutdown: async (signal) => {
    console.log(`Cleanup initiated by ${signal}`);
    const shutdownPromises = [];
    for (const hook of globalThis.__shutdownHooks) {
      const res = hook();
      if (res instanceof Promise) {
        shutdownPromises.push(res);
      }
    }
    await Promise.allSettled(shutdownPromises);
  },
  finally: () => {
    console.log("Server gracefully shut down.");
  },
});
