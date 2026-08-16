import type { Database } from 'remix/data-table'
import { createContextKey, type Middleware } from 'remix/router'

import { db } from '../data/database.ts'

export const databaseContext = createContextKey<Database>()

export function loadDatabase(
  database: Database = db,
): Middleware<{ key: typeof databaseContext; value: Database }> {
  return async (context, next) => {
    context.set(databaseContext, database)
    return next()
  }
}
