// @ts-check
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";
import { dbConfig } from "./dbs.config.js";

async function runMigrations() {
  console.log("⏳ Running deployment migrations...");

  const mainClient = new DatabaseSync(dbConfig.main.path);
  migrate(drizzle({ client: mainClient }), {
    migrationsFolder: dbConfig.main.migrations,
  });
  mainClient.close();

  const analyticsClient = new DatabaseSync(dbConfig.metrics.path);
  migrate(drizzle({ client: analyticsClient }), {
    migrationsFolder: dbConfig.metrics.migrations,
  });
  analyticsClient.close();

  console.log("✅ Migrations complete.");
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
