// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

const defaultEnvVarsByAppMode = {
  development: {
    WEB_VITALS: false,
  },
  production: {
    WEB_VITALS: true,
  },
  test: {
    WEB_VITALS: false,
  },
};

// @ts-ignore
const defaultEnvVars = defaultEnvVarsByAppMode[process.env.APP_MODE];
if (!defaultEnvVars) {
  throw new Error(`Bad APP_MODE: ${process.env.APP_MODE}`);
}

// https://astro.build/config
export default defineConfig({
  env: {
    schema: {
      WEB_VITALS: envField.boolean({
        context: "server",
        access: "secret",
        default: defaultEnvVars.WEB_VITALS,
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
