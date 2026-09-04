import Fastify from "fastify";
import assert from "node:assert/strict";
import fastifyStatic from "@fastify/static";
import underPressure from "@fastify/under-pressure";
import middie from "@fastify/middie";
import path from "path";
import { fileURLToPath } from "url";
import {
  TypeBoxValidatorCompiler,
  type TypeBoxTypeProvider,
} from "@fastify/type-provider-typebox";
import { createServer as createViteServer } from "vite";

import type { AppContext } from "./context.ts";
import ctxPlugin from "./plugins/contextPlugin.ts";
import { env } from "./env.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp(ctx: AppContext) {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: env.PRETTY_LOGS
        ? {
            target: "pino-pretty",
            options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" },
          }
        : undefined,
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  app.setValidatorCompiler(TypeBoxValidatorCompiler);

  await app.register(ctxPlugin, { ctx });

  await app.register(middie);

  const ASTRO_LOCALS = { ctx };

  let devAstroHandler: (
    req: any,
    res: any,
    next: (err?: Error) => void,
  ) => Promise<void>;

  await app.register(underPressure, {
    maxEventLoopDelay: 1500,
    maxEventLoopUtilization: 0.95,
    maxHeapUsedBytes: 400 * 1024 * 1024,
    maxRssBytes: 475 * 1024 * 1024,
    retryAfter: 5,
    healthCheckInterval: 5000,
    pressureHandler: async (request, reply) => {
      if (env.USE_VITE_DEV_SERVER) {
        assert.ok(devAstroHandler);
        reply.hijack();
        request.raw.url = "/503"; // Ask Astro to render 503.astro
        await devAstroHandler(request.raw, reply.raw, () => {
          reply.raw.statusCode = 503;
          reply.raw.end("503 Service Unavailable");
        });
      } else {
        // In production, fastifyStatic serves the lightweight prerendered file from dist/client/
        return reply.code(503).sendFile("503.html");
      }
    },
  });

  if (env.USE_VITE_DEV_SERVER) {
    const viteServer = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // prevents Vite from sending default html fallback
    });

    // astro middleware
    app.use(viteServer.middlewares);

    // astro helper, also used by under-pressure and the global 500 error handler
    devAstroHandler = async (req, res, next) => {
      const { handler } = await viteServer.ssrLoadModule("virtual:astro:ssr");
      return handler(req, res, next, ASTRO_LOCALS);
    };

    // astro ssr handler
    app.all("*", async (request, reply) => {
      assert.ok(devAstroHandler);
      reply.hijack(); // tell Fastify that we are taking over raw response writing

      try {
        await devAstroHandler(request.raw, reply.raw, async (error?: Error) => {
          if (error) {
            // Astro encountered an internal error.
            viteServer.ssrFixStacktrace(error);

            // Rewrite the URL to force Astro to render our 500.astro page
            request.raw.url = "/500";
            await devAstroHandler(request.raw, reply.raw, () => {
              // Absolute fallback if 500.astro is missing or broken
              reply.raw.statusCode = 500;
              reply.raw.end("500 Server Error (And 500.astro is missing)");
            });
          } else {
            // The request fell through Vite and Astro.
            // Usually, Astro handles 404s natively, but if it bails, we force it:
            request.raw.url = "/404";
            await devAstroHandler(request.raw, reply.raw, () => {
              reply.raw.statusCode = 404;
              reply.raw.end("404 Not Found (And 404.astro is missing)");
            });
          }
        });
      } catch (error: any) {
        if (error instanceof Error) {
          viteServer.ssrFixStacktrace(error);
        }

        // Force Astro to render 500.astro for outer try/catch errors
        request.raw.url = "/500";
        await devAstroHandler(request.raw, reply.raw, () => {
          reply.raw.statusCode = 500;
          reply.raw.end("500 Server Error");
        });
      }
    });
  } else {
    // TODO: replace with in memory file server
    await app.register(fastifyStatic, {
      root: path.join(__dirname, "../astro/dist/client"),
      prefix: "/",
      wildcard: true,
    });

    // @ts-ignore
    const { handler } = await import("../astro/dist/server/entry.mjs");
    app.use((req, res, next) => handler(req, res, next, ASTRO_LOCALS));
  }

  // Fastify Error Handler
  app.setErrorHandler(async (error: any, request, reply) => {
    app.log.error(error);

    const acceptsHtml = request.headers.accept?.includes("text/html");

    if (!acceptsHtml) {
      // Return json
      return reply.code(500).send({
        success: false,
        error: "Internal Server Error",
        message: env.INCLUDE_ERROR_MESSAGES_IN_RESPONSES
          ? error.message
          : "An unexpected error occurred",
        statusCode: 500,
      });
    }

    // Otherwise, render the Astro HTML 500 page
    if (env.USE_VITE_DEV_SERVER) {
      assert.ok(devAstroHandler);
      reply.hijack();
      request.raw.url = "/500";
      await devAstroHandler(request.raw, reply.raw, () => {
        // error from astro trying to render 500.astro page, yikes
        reply.raw.statusCode = 500;
        reply.raw.end("500 Server Error, and astro failed to render 500.html");
      });
    } else {
      return reply.code(500).sendFile("500.html");
    }
  });

  return app;
}
