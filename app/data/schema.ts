import { column as c, table, type TableRow } from 'remix/data-table'

export const users = table({
  name: 'users',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    username: c.text().notNull().unique(),
    password_hash: c.text().notNull(),
    created_at: c.integer().notNull().defaultSql('unixepoch()'),
  },
})

export type User = TableRow<typeof users>
