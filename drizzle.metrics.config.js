// @ts-check
import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./dbs.config.js";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/metrics/schema.ts",
  out: dbConfig.metrics.migrations,
  dbCredentials: {
    url: dbConfig.metrics.path,
  },
});
