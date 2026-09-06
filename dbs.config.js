// @ts-check
import { loadEnv } from "vite";

const mode = process.env.NODE_ENV || "development";
const env = loadEnv(mode, process.cwd(), "");

export const dbConfig = {
  main: {
    path: env.DB_URL ?? process.env.URL,
    migrations: "./drizzle/main",
  },
  metrics: {
    path: env.METRICS_DB_URL ?? process.env.ANALYTICS_DB_PATH,
    migrations: "./drizzle/metrics",
  },
};
