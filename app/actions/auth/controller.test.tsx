import * as assert from 'remix/assert'
import { createSqliteDatabase } from 'remix/data-table/sqlite'
import { loadMigrations } from 'remix/data-table/migrations/node'
import { createMemorySessionStorage } from 'remix/session-storage/memory'
import { describe, it } from 'remix/test'

import { openSqlite } from '../../data/sqlite.ts'
import { createAppRouter } from '../../router.ts'
import { routes } from '../../routes.ts'

async function createTestRouter() {
  let db = createSqliteDatabase(await openSqlite(':memory:'))
  await db.migrate(await loadMigrations('./db/migrations'))

  return createAppRouter({
    db,
    sessionStorage: createMemorySessionStorage(),
  })
}

type TestRouter = Awaited<ReturnType<typeof createTestRouter>>

/** Reads the combined Cookie header value from a response's Set-Cookie headers. */
function cookiesFrom(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((setCookie) => setCookie.split(';')[0])
    .join('; ')
}

/** GETs a page and returns its HTML plus the session cookie and CSRF token it issued. */
async function getPage(router: TestRouter, href: string, cookie?: string) {
  let response = await router.fetch(
    new Request(`http://localhost${href}`, {
      headers: cookie ? { Cookie: cookie } : {},
    }),
  )
  let html = await response.text()
  let token = html.match(/name="_csrf" value="([^"]+)"/)?.[1]

  return {
    html,
    token,
    cookie: [cookie, cookiesFrom(response)].filter(Boolean).join('; '),
  }
}

function postForm(href: string, cookie: string, fields: Record<string, string>) {
  let body = new FormData()
  for (let [name, value] of Object.entries(fields)) {
    body.set(name, value)
  }

  return new Request(`http://localhost${href}`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body,
  })
}

describe('auth', () => {
  it('shows login and register links in the header when logged out', async () => {
    let router = await createTestRouter()
    let { html } = await getPage(router, routes.home.href())

    assert.match(html, /Log in/)
    assert.match(html, /Register/)
    assert.ok(!html.includes('Signed in as'))
  })

  it('registers a new user and shows them as signed in', async () => {
    let router = await createTestRouter()
    let page = await getPage(router, routes.auth.register.index.href())

    let response = await router.fetch(
      postForm(routes.auth.register.action.href(), page.cookie, {
        _csrf: page.token!,
        username: 'ada',
        password: 'correct horse battery staple',
      }),
    )

    assert.equal(response.status, 303)
    assert.equal(response.headers.get('Location'), routes.home.href())

    let home = await getPage(router, routes.home.href(), cookiesFrom(response))
    assert.match(home.html, /Signed in as <strong[^>]*>ada<\/strong>/)
  })

  it('rejects a short password with a 400 and a field error', async () => {
    let router = await createTestRouter()
    let page = await getPage(router, routes.auth.register.index.href())

    let response = await router.fetch(
      postForm(routes.auth.register.action.href(), page.cookie, {
        _csrf: page.token!,
        username: 'ada',
        password: 'short',
      }),
    )

    assert.equal(response.status, 400)
    assert.match(await response.text(), /Expected at least 8 characters/)
  })

  it('rejects a duplicate username with a 409', async () => {
    let router = await createTestRouter()

    for (let attempt = 0; attempt < 2; attempt++) {
      let page = await getPage(router, routes.auth.register.index.href())
      let response = await router.fetch(
        postForm(routes.auth.register.action.href(), page.cookie, {
          _csrf: page.token!,
          username: 'ada',
          password: 'correct horse battery staple',
        }),
      )

      if (attempt === 0) {
        assert.equal(response.status, 303)
      } else {
        assert.equal(response.status, 409)
        assert.match(await response.text(), /Username is taken/)
      }
    }
  })

  it('rejects bad credentials and shows an error on the login page', async () => {
    let router = await createTestRouter()

    let register = await getPage(router, routes.auth.register.index.href())
    await router.fetch(
      postForm(routes.auth.register.action.href(), register.cookie, {
        _csrf: register.token!,
        username: 'ada',
        password: 'correct horse battery staple',
      }),
    )

    let login = await getPage(router, routes.auth.login.index.href())
    let response = await router.fetch(
      postForm(routes.auth.login.action.href(), login.cookie, {
        _csrf: login.token!,
        username: 'ada',
        password: 'wrong password',
      }),
    )

    assert.equal(response.status, 303)
    assert.equal(response.headers.get('Location'), routes.auth.login.index.href())

    let retry = await getPage(router, routes.auth.login.index.href(), cookiesFrom(response))
    assert.match(retry.html, /Invalid username or password/)
  })

  it('logs in with valid credentials and logs out again', async () => {
    let router = await createTestRouter()

    let register = await getPage(router, routes.auth.register.index.href())
    await router.fetch(
      postForm(routes.auth.register.action.href(), register.cookie, {
        _csrf: register.token!,
        username: 'ada',
        password: 'correct horse battery staple',
      }),
    )

    let login = await getPage(router, routes.auth.login.index.href())
    let loginResponse = await router.fetch(
      postForm(routes.auth.login.action.href(), login.cookie, {
        _csrf: login.token!,
        username: 'ada',
        password: 'correct horse battery staple',
      }),
    )

    assert.equal(loginResponse.status, 303)
    assert.equal(loginResponse.headers.get('Location'), routes.home.href())

    let sessionCookie = cookiesFrom(loginResponse)
    let home = await getPage(router, routes.home.href(), sessionCookie)
    assert.match(home.html, /Signed in as/)

    let logoutResponse = await router.fetch(
      postForm(routes.auth.logout.href(), sessionCookie, { _csrf: home.token! }),
    )

    assert.equal(logoutResponse.status, 303)
    assert.equal(logoutResponse.headers.get('Location'), routes.home.href())

    let loggedOut = await getPage(router, routes.home.href(), cookiesFrom(logoutResponse))
    assert.match(loggedOut.html, /Log in/)
    assert.ok(!loggedOut.html.includes('Signed in as'))
  })

  it('rejects form posts without a CSRF token', async () => {
    let router = await createTestRouter()
    let page = await getPage(router, routes.auth.login.index.href())

    let response = await router.fetch(
      postForm(routes.auth.login.action.href(), page.cookie, {
        username: 'ada',
        password: 'correct horse battery staple',
      }),
    )

    assert.equal(response.status, 403)
  })
})
