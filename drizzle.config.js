// @ts-check
import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./dbs.config.js";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/main/schema.ts",
  out: dbConfig.main.migrations,
  dbCredentials: {
    url: dbConfig.main.path,
  },
});
