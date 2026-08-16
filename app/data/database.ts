import { createSqliteDatabase } from 'remix/data-table/sqlite'
import { loadMigrations } from 'remix/data-table/migrations/node'

import { openSqlite } from './sqlite.ts'

let sqlite = await openSqlite('./db/app.sqlite')

export let db = createSqliteDatabase(sqlite)

let migrations = await loadMigrations('./db/migrations')
await db.migrate(migrations)
