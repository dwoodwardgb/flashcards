// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

const isProd = process.env.APP_ENV === "prod";

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      WEB_VITALS: envField.boolean({
        context: "server",
        access: "public",
        default: isProd ? true : false,
      }),
    },
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },

  output: "server",

  adapter: node({
    mode: "standalone",
    experimentalDisableStreaming: true,
  }),
});
