import type { Cookie } from 'remix/cookie'
import type { Database } from 'remix/data-table'
import { csrf } from 'remix/middleware/csrf'
import { formData } from 'remix/middleware/form-data'
import { session } from 'remix/middleware/session'
import { staticFiles } from 'remix/middleware/static'
import { createRouter, type MiddlewareContext } from 'remix/router'
import type { SessionStorage } from 'remix/session'

import authController from './actions/auth/controller.tsx'
import authLoginController from './actions/auth/login/controller.tsx'
import authRegisterController from './actions/auth/register/controller.tsx'
import controller from './actions/controller.tsx'
import { db } from './data/database.ts'
import { loadAuth } from './middleware/auth.ts'
import { loadDatabase } from './middleware/database.ts'
import { render } from './middleware/render.tsx'
import { sessionCookie, sessionStorage } from './middleware/session.ts'
import { routes } from './routes.ts'

type AppContext = MiddlewareContext<
  [
    ReturnType<typeof render>,
    ReturnType<typeof session>,
    ReturnType<typeof loadDatabase>,
    ReturnType<typeof loadAuth>,
  ]
>

declare module 'remix/router' {
  interface RouterTypes {
    context: AppContext
  }
}

export interface AppRouterOptions {
  db?: Database
  sessionCookie?: Cookie
  sessionStorage?: SessionStorage
}

export function createAppRouter(options: AppRouterOptions = {}) {
  let router = createRouter<AppContext>({
    middleware: [
      staticFiles('./public', { index: false }),
      formData(),
      session(options.sessionCookie ?? sessionCookie, options.sessionStorage ?? sessionStorage),
      csrf(),
      loadDatabase(options.db ?? db),
      loadAuth(),
      render(),
    ],
  })

  router.map(routes, controller)
  router.map(routes.auth, authController)
  router.map(routes.auth.login, authLoginController)
  router.map(routes.auth.register, authRegisterController)

  return router
}

export const router = createAppRouter()
