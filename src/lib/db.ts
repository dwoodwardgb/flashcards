import { DatabaseSync } from "node:sqlite";
import { METRICS_DB_URL } from "astro:env/server";

declare global {
  var __shutdownHooks: Array<() => void | Promise<void>> | undefined;
}

export const db = new DatabaseSync(METRICS_DB_URL);

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS web_vitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    delta REAL NOT NULL,
    rating TEXT,
    navigation_type TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
`);

export const insertVital = db.prepare(`
  INSERT INTO web_vitals (id, name, value, delta, rating, navigation_type)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const listVitals = db.prepare(`
  SELECT name, value, delta, rating, navigation_type, created_at
  FROM web_vitals
  ORDER BY created_at DESC
`);

// TODO: insert HMR hook, etc

let dbClosed = false;
globalThis.__shutdownHooks ??= [];
globalThis.__shutdownHooks.push(() => {
  if (dbClosed) return;
  dbClosed = true;
  db.close();
  console.log("Vitals DB closed");
});
