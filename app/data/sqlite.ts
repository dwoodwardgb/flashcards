import type { SqliteDatabaseClient } from 'remix/data-table/sqlite'

/**
 * Opens a SQLite client with the native runtime binding: `bun:sqlite` on Bun,
 * `node:sqlite` on Node (the `remix test` runner executes server tests in Node).
 */
export async function openSqlite(filename: string): Promise<SqliteDatabaseClient> {
  let client: SqliteDatabaseClient

  if (typeof process.versions.bun === 'string') {
    let { Database } = await import('bun:sqlite')
    client = new Database(filename)
  } else {
    let { DatabaseSync } = await import('node:sqlite')
    client = new DatabaseSync(filename)
  }

  client.exec('pragma foreign_keys = on')
  client.exec('pragma busy_timeout = 5000')

  return client
}
