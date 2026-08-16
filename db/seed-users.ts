// Seeds a user for local development. Migrations run automatically on import.
//
//   bun run db:seed <username> <password>
//   SEED_USERNAME=... SEED_PASSWORD=... bun run db:seed
import { db } from '../app/data/database.ts'
import { createUser, findUserByUsername } from '../app/data/users.ts'

let username = process.argv[2] ?? process.env.SEED_USERNAME
let password = process.argv[3] ?? process.env.SEED_PASSWORD

if (!username || !password) {
  console.error('Usage: bun run db:seed <username> <password>')
  process.exit(1)
}

let existing = await findUserByUsername(db, username)
if (existing) {
  console.log(`User "${username}" already exists, skipping.`)
  process.exit(0)
}

await createUser(db, { username, password })
console.log(`Created user "${username}".`)
