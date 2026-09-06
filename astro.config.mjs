// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      WEB_VITALS: envField.boolean({
        context: "server",
        access: "secret",
      }),
      METRICS_DB_URL: envField.string({ context: "server", access: "secret" }),
    },
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: "server",
  adapter: node({
    mode: "standalone",
    // NOTE: if you want this to be true, you have to set Content-Encoding: none on all responses that might stream
    // because of how Fly.io proxy chunks and compresses responses. See https://fly.io/docs/reference/content-encoding/
    experimentalDisableStreaming: true,
  }),
});
