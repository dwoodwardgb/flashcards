import { completeAuth } from 'remix/auth'
import * as s from 'remix/data-schema'
import type { Issue } from 'remix/data-schema'
import { minLength } from 'remix/data-schema/checks'
import * as f from 'remix/data-schema/form-data'
import { Auth } from 'remix/middleware/auth'
import { getCsrfToken } from 'remix/middleware/csrf'
import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'

import { createUser, findUserByUsername } from '../../../data/users.ts'
import { databaseContext } from '../../../middleware/database.ts'
import { routes } from '../../../routes.ts'
import { CredentialsForm } from '../credentials-form.tsx'

let registerSchema = f.object({
  username: f.field(s.string().pipe(minLength(1))),
  password: f.field(s.string().pipe(minLength(8))),
})

export default createController(routes.auth.register, {
  actions: {
    index(context) {
      let auth = context.get(Auth)

      return context.render(
        <CredentialsForm
          title="Register"
          submitLabel="Create account"
          csrfToken={getCsrfToken(context)}
          user={auth.ok ? auth.identity : null}
          alternate={{
            text: 'Already have an account?',
            href: routes.auth.login.index.href(),
            label: 'Log in',
          }}
        />,
      )
    },
    async action(context) {
      let parsed = s.parseSafe(registerSchema, context.get(FormData))
      if (!parsed.success) {
        return context.render(
          <CredentialsForm
            title="Register"
            submitLabel="Create account"
            csrfToken={getCsrfToken(context)}
            user={null}
            fieldErrors={fieldErrors(parsed.issues)}
            alternate={{
              text: 'Already have an account?',
              href: routes.auth.login.index.href(),
              label: 'Log in',
            }}
          />,
          { status: 400 },
        )
      }

      let db = context.get(databaseContext)
      let existing = await findUserByUsername(db, parsed.value.username)
      if (existing) {
        return context.render(
          <CredentialsForm
            title="Register"
            submitLabel="Create account"
            csrfToken={getCsrfToken(context)}
            user={null}
            fieldErrors={{ username: 'Username is taken.' }}
            alternate={{
              text: 'Already have an account?',
              href: routes.auth.login.index.href(),
              label: 'Log in',
            }}
          />,
          { status: 409 },
        )
      }

      let user = await createUser(db, parsed.value)

      let session = completeAuth(context)
      session.set('auth', { userId: user.id })

      return redirect(routes.home.href(), 303)
    },
  },
})

function fieldErrors(issues: readonly Issue[]): {
  username?: string
  password?: string
} {
  let errors: { username?: string; password?: string } = {}

  for (let issue of issues) {
    let first = issue.path?.[0]
    let key = typeof first === 'object' && first != null ? first.key : first
    if ((key === 'username' || key === 'password') && errors[key] == null) {
      errors[key] = issue.message
    }
  }

  return errors
}
