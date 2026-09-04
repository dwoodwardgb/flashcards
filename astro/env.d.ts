/// <reference types="astro/client" />

import type { AppContext } from "../src/context.ts";

// Type-only imports from the host app — erased at build time, so the Astro
// bundle never includes Fastify code. Runtime values arrive as `locals`
// injected by the host's Astro handler (see src/app.ts).
declare namespace App {
  interface Locals {
    ctx: AppContext;
  }
}
