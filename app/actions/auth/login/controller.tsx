import { completeAuth, createCredentialsAuthProvider, verifyCredentials } from 'remix/auth'
import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import { Auth } from 'remix/middleware/auth'
import { getCsrfToken } from 'remix/middleware/csrf'
import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'
import { Session } from 'remix/session'

import { verifyPassword } from '../../../data/passwords.ts'
import { findUserByUsername } from '../../../data/users.ts'
import { databaseContext } from '../../../middleware/database.ts'
import { routes } from '../../../routes.ts'
import { CredentialsForm } from '../credentials-form.tsx'

let credentialsSchema = f.object({
  username: f.field(s.defaulted(s.string(), '')),
  password: f.field(s.defaulted(s.string(), '')),
})

let passwordProvider = createCredentialsAuthProvider({
  parse(context) {
    return s.parse(credentialsSchema, context.get(FormData))
  },
  async verify({ username, password }, context) {
    let db = context.get(databaseContext)
    if (!db) return null

    let user = await findUserByUsername(db, username)
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return null
    }
    return user
  },
})

export default createController(routes.auth.login, {
  actions: {
    index(context) {
      let auth = context.get(Auth)
      let session = context.get(Session)
      let error = session.get('error')

      return context.render(
        <CredentialsForm
          title="Log in"
          submitLabel="Log in"
          csrfToken={getCsrfToken(context)}
          user={auth.ok ? auth.identity : null}
          error={typeof error === 'string' ? error : undefined}
          alternate={{
            text: "Don't have an account?",
            href: routes.auth.register.index.href(),
            label: 'Register',
          }}
        />,
      )
    },
    async action(context) {
      let user = await verifyCredentials(passwordProvider, context)

      if (user == null) {
        let session = context.get(Session)
        session.flash('error', 'Invalid username or password.')
        return redirect(routes.auth.login.index.href(), 303)
      }

      let session = completeAuth(context)
      session.set('auth', { userId: user.id })

      return redirect(routes.home.href(), 303)
    },
  },
})
