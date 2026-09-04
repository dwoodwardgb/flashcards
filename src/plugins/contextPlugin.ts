import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { type AppContext } from "../context.ts";

declare module "fastify" {
  interface FastifyInstance {
    ctx: AppContext;
  }
}

export interface ContextPluginOptions {
  ctx: AppContext;
}

export default fp<ContextPluginOptions>(function contextPlugin(
  app: FastifyInstance,
  opts: ContextPluginOptions,
) {
  app.decorate("ctx", opts.ctx);

  app.addHook("onClose", () => {
    return opts.ctx.close();
  });
});
