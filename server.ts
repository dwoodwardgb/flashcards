import { router } from './app/router.ts'

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100
const hmrProxyPort = process.env.HMR_PROXY_PORT
  ? Number.parseInt(process.env.HMR_PROXY_PORT, 10)
  : null

const server = Bun.serve({
  port,
  fetch: async (request) => {
    try {
      return await router.fetch(request)
    } catch (error) {
      if (!(request.signal.aborted && error === request.signal.reason)) {
        console.error(error)
      }
      return new Response('Internal Server Error', { status: 500 })
    }
  },
})

if (process.env.REMIX_NODE_HMR) {
  import('remix/node-hmr/runtime').then((nodeHmr) => nodeHmr.emitServerReady())
}

console.log(`Server listening on http://localhost:${hmrProxyPort ?? server.port}`)

process.on('SIGINT', () => server.stop(true))
process.on('SIGTERM', () => server.stop(true))
