// TODO: move to fastify
import { defineMiddleware } from "astro:middleware";

declare global {
  namespace App {
    interface Locals {
      isDark: boolean;
    }
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.isDark =
    context.request.headers.get("Sec-CH-Prefers-Color-Scheme") === "dark";

  const response = await next();

  response.headers.set("Accept-CH", "Sec-CH-Prefers-Color-Scheme");

  return response;
});
