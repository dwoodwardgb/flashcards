# Flashcards Agent Guide

This app was scaffolded with `remix new`. Use these conventions when continuing to build it out.

## Commands

```sh
bun i
SESSION_SECRET=dev-secret bun run dev
SESSION_SECRET=dev-secret bun run hmr
bun run start
bun run test
bun run typecheck
bun run db:seed <username> <password>
```

Run everything through Bun. `dev` serves the app router's fetch handler directly through `Bun.serve` with `bun --watch` restarts (see `server.ts`). `hmr` runs the bun-native HMR supervisor in `hmr.ts`: it spawns the child server with `bun --hot` for in-process module updates, hosts the browser HMR event channel, proxies the public port with request retry across restarts, and restarts the child after crashes. `hmr-preload.ts` installs the `remix/node-hmr/runtime`-compatible channel in the child process.

`SESSION_SECRET` is required outside tests (`app/middleware/session.ts` fails fast without it). `db:seed` creates a user in the local database for development.

Note: `test` runs `remix test`, whose server-test runner executes in Node workers — not Bun. `bun test` (the Bun builtin) does not run these tests. Runtime-specific code paths (`bun:sqlite`, `Bun.password`) must keep the Node fallbacks in `app/data/sqlite.ts` and `app/data/passwords.ts`.

## Building Features

Refer to ./.agents/skills/remix/SKILL.md

## Starter Layout

- `app/actions/controller.tsx` owns the top-level route actions
- `app/actions/home-page.tsx` and `app/actions/document.tsx` render the route-owned starter UI
- `app/actions/auth/` owns the `auth` route map: logout in `controller.tsx`, plus `login/` and `register/` form-route controllers and their shared `credentials-form.tsx`
- `app/actions/public/` contains the browser runtime entry and interactive prompt button
- `app/data/` owns persistence: `schema.ts` (tables), `database.ts` (sqlite + automatic migrations), `sqlite.ts` (runtime-adaptive client), `users.ts` (queries), `passwords.ts` (hashing)
- `app/middleware/` owns request lifecycle: `session.ts`, `database.ts`, `auth.ts`, and the request-scoped `render.tsx`
- `app/ui/` contains shared cross-route UI (`header.tsx` with the auth indicator)
- `app/routes.ts` defines the shared route contract used by server and browser modules for type-safe hrefs
- `app/router.ts` wires middleware and routes to route handlers; `createAppRouter()` accepts db/session overrides for tests
- `app/assets.ts` owns the server-side asset pipeline used by the asset route and renderer
- `db/` contains SQL migrations (`db/migrations/`), the local database file (gitignored), and the `seed-users.ts` script
- Root `public/` contains static files served unchanged from the app root

## Route Ownership

- Start from `app/routes.ts` and map each route to the narrowest owner on disk.
- Put top-level route actions in `app/actions/controller.tsx`.
- Add `app/actions/<route-key>/controller.tsx` for nested route maps that need their own actions or middleware.
- Keep route-owned page modules next to the route that owns them.
- Move shared UI to `app/ui/`, not `app/actions/`.

## Build-Out Notes

- This starter intentionally begins small; add directories like `app/data/` and `test/` only when you need them.
- Prefer putting code in the narrowest owner before introducing shared modules.
- Avoid generic dumping-ground directories like `app/lib/` or `app/components/`.
