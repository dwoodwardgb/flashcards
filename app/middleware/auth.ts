import { auth, createSessionAuthScheme } from 'remix/middleware/auth'

import { users } from '../data/schema.ts'
import { databaseContext } from './database.ts'

export interface AuthIdentity {
  id: number
  username: string
}

export function loadAuth() {
  return auth({
    schemes: [
      createSessionAuthScheme<AuthIdentity, { userId: number }>({
        read(session) {
          let value = session.get('auth')
          if (typeof value !== 'object' || value == null) return null
          return value as { userId: number }
        },
        async verify(value, context) {
          if (typeof value?.userId !== 'number') return null
          let db = context.get(databaseContext)
          if (!db) return null
          let user = await db.find(users, value.userId)
          if (!user) return null
          return { id: user.id, username: user.username }
        },
        invalidate(session) {
          session.unset('auth')
        },
      }),
    ],
  })
}
