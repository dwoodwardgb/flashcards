import type { Database } from 'remix/data-table'

import { hashPassword } from './passwords.ts'
import { users, type User } from './schema.ts'

export function findUserByUsername(db: Database, username: string): Promise<User | null> {
  return db.findOne(users, { where: { username } })
}

export async function createUser(
  db: Database,
  input: { username: string; password: string },
): Promise<User> {
  let password_hash = await hashPassword(input.password)
  return db.create(users, { username: input.username, password_hash }, { returnRow: true })
}
