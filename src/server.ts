import gracefulShutdown from "http-graceful-shutdown";

import { createApp } from "./app.ts";
import { env } from "./env.ts";
import { createAppContext } from "./context.ts";

const app = await createApp(createAppContext(env));
await app.listen({ host: env.HOST, port: env.PORT });

gracefulShutdown(app.server, {
  timeout: 10_000,
  onShutdown: () => {
    return app.close();
  },
  finally: (signal) => {
    console.log(`graceful shutdown complete (${signal ?? "unknown signal"})`);
  },
});
