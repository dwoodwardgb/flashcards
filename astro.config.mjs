// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  srcDir: "./astro",
  outDir: "./astro/dist",
  output: "server",
  adapter: node({ mode: "middleware" }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
