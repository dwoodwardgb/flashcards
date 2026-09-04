// TODO: move to src
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

declare global {
  var __shutdownHooks: Array<() => void | Promise<void>> | undefined;
}

const DB_PATH =
  process.env.VITALS_DB_PATH ?? path.join(process.cwd(), "vitals.db");

export const db = new DatabaseSync(DB_PATH);

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

let dbClosed = false;

globalThis.__shutdownHooks ??= [];
globalThis.__shutdownHooks.push(async () => {
  if (dbClosed) return;
  dbClosed = true;
  db.close();
  console.log("Vitals DB closed");
});
