import * as path from 'node:path'
import { watch } from 'chokidar'
import { createFetchProxy } from 'remix/fetch-proxy'
import { createHmrReadyFetch } from 'remix/node-hmr'

const hmrProxyPort = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100
const hmrEventPort = process.env.HMR_PORT
  ? Number.parseInt(process.env.HMR_PORT, 10)
  : hmrProxyPort + 1
const appPort = process.env.APP_PORT ? Number.parseInt(process.env.APP_PORT, 10) : hmrEventPort + 1

const cwd = process.cwd()
const entryPath = path.resolve(cwd, 'server.ts')
const preloadPath = path.resolve(import.meta.dir, 'hmr-preload.ts')
const browserHmrPathname = '/hmr'
const browserHmrChannelUrl = `http://127.0.0.1:${hmrEventPort}${browserHmrPathname}`

const encoder = new TextEncoder()
const sseClients = new Set<ReadableStreamDefaultController<Uint8Array>>()

const eventServer = Bun.serve({
  port: hmrEventPort,
  fetch(request) {
    let requestUrl = new URL(request.url)
    if (request.method === 'OPTIONS' && requestUrl.pathname === browserHmrPathname) {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }
    if (request.method !== 'GET' || requestUrl.pathname !== browserHmrPathname) {
      return new Response('Not Found', { status: 404 })
    }
    let streamController: ReadableStreamDefaultController<Uint8Array> | undefined
    let stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller
        sseClients.add(controller)
        controller.enqueue(encoder.encode(': connected\n\n'))
      },
      cancel() {
        if (streamController !== undefined) sseClients.delete(streamController)
      },
    })
    return new Response(stream, { headers: eventStreamHeaders() })
  },
})

function broadcastSseEvent(payload: Record<string, unknown>) {
  let encoded = encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
  for (let client of sseClients) {
    try {
      client.enqueue(encoded)
    } catch {
      sseClients.delete(client)
    }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Access-Control-Allow-Origin': '*',
  }
}

function eventStreamHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream; charset=utf-8',
    'X-Accel-Buffering': 'no',
  }
}

let child: ReturnType<typeof Bun.spawn> | undefined
let childReady = false
let generation = 0
let readyWaiters: (() => void)[] = []
let waitingForRestart = false
let stopping = false

const runner = {
  get generation() {
    return generation
  },
  ready() {
    if (childReady) return Promise.resolve()
    return new Promise<void>((resolve) => {
      readyWaiters.push(resolve)
    })
  },
  async close() {
    if (child) {
      child.kill()
      await child.exited.catch(() => {})
    }
  },
}

function spawnChild() {
  childReady = false
  waitingForRestart = false
  child = Bun.spawn({
    cmd: [
      process.execPath,
      '--hot',
      '--conditions=node-hmr',
      '--preload',
      preloadPath,
      entryPath,
    ],
    cwd,
    env: {
      ...process.env,
      PORT: String(appPort),
      HMR_PROXY_PORT: String(hmrProxyPort),
      REMIX_NODE_HMR: '1',
    },
    stdio: ['inherit', 'inherit', 'inherit'],
    ipc(message) {
      handleChildMessage(message)
    },
  })
  child.exited.then(handleChildExit)
}

function handleChildExit(code: number) {
  if (stopping) return
  childReady = false
  waitingForRestart = true
  console.log(
    `Failed running ${path.relative(cwd, entryPath)} (exit ${code}). Waiting for file changes before restarting...`,
  )
}

function markServerReady() {
  generation++
  childReady = true
  let waiters = readyWaiters
  readyWaiters = []
  for (let waiter of waiters) waiter()
  broadcastSseEvent({ type: 'server:update' })
}

function handleChildMessage(message: unknown) {
  if (!isRecord(message)) return
  switch (message.type) {
    case 'node-hmr:child:server-ready':
      markServerReady()
      break
    case 'node-hmr:child:browser-hmr-channel-requested':
      if (typeof message.requestId === 'number') {
        child?.send({
          requestId: message.requestId,
          type: 'node-hmr:parent:browser-hmr-channel',
          url: browserHmrChannelUrl,
        })
      }
      break
    case 'node-hmr:child:browser-hmr-watch-files-changed':
      if (typeof message.id === 'number' && isWatchFileDelta(message.delta)) {
        updateBrowserWatchedFiles(message.id, message.delta)
      }
      break
    case 'node-hmr:child:browser-hmr-file-events-handled':
      if (typeof message.requestId === 'number' && Array.isArray(message.events)) {
        resolveFileEventsRequest(message.requestId, message.events, message.error)
      }
      break
    case 'node-hmr:child:browser-event-emitted':
      if (isRecord(message.payload)) broadcastSseEvent(message.payload)
      break
  }
}

const browserWatchedFileRefCounts = new Map<number, Map<string, number>>()
const browserWatchedFiles = new Set<string>()
const fileEventRequests = new Map<
  number,
  { resolve: (events: unknown[]) => void; timer: ReturnType<typeof setTimeout> }
>()
let fileEventRequestId = 0
const browserHmrRequestTimeoutMs = 1_000

function updateBrowserWatchedFiles(id: number, delta: WatchFileDelta) {
  let refCounts = browserWatchedFileRefCounts.get(id)
  if (refCounts === undefined) {
    refCounts = new Map()
    browserWatchedFileRefCounts.set(id, refCounts)
  }
  for (let file of delta.add) {
    refCounts.set(file, (refCounts.get(file) ?? 0) + 1)
    browserWatchedFiles.add(file)
  }
  for (let file of delta.remove) {
    let count = refCounts.get(file)
    if (count === undefined) continue
    if (count <= 1) {
      refCounts.delete(file)
      browserWatchedFiles.delete(file)
    } else {
      refCounts.set(file, count - 1)
    }
  }
  if (refCounts.size === 0) browserWatchedFileRefCounts.delete(id)
}

function requestBrowserHmrEvents(events: BrowserHmrFileEvent[]) {
  if (child === undefined) return
  let requestId = fileEventRequestId++
  new Promise<unknown[]>((resolve) => {
    let timer = setTimeout(() => {
      fileEventRequests.delete(requestId)
      resolve([])
    }, browserHmrRequestTimeoutMs)
    fileEventRequests.set(requestId, { resolve, timer })
    if (!child?.send({ events, requestId, type: 'node-hmr:parent:browser-hmr-file-events' })) {
      clearTimeout(timer)
      fileEventRequests.delete(requestId)
      resolve([])
    }
  }).then(handleBrowserHmrEvents)
}

function resolveFileEventsRequest(requestId: number, events: unknown[], error?: unknown) {
  let request = fileEventRequests.get(requestId)
  if (request === undefined) return
  clearTimeout(request.timer)
  fileEventRequests.delete(requestId)
  if (error !== undefined) {
    console.warn(`Browser HMR runtime failed: ${String(error)}`)
  }
  request.resolve(events)
}

function handleBrowserHmrEvents(events: unknown[]) {
  for (let event of events) {
    if (!isRecord(event)) continue
    if (event.type === 'reload') {
      broadcastSseEvent({ type: 'browser:reload' })
      continue
    }
    if (event.type === 'update') {
      broadcastSseEvent({
        type: 'browser:update',
        timestamp: event.timestamp,
        updates: event.updates,
      })
    }
  }
}

const appDir = path.resolve(cwd, 'app')
const watchOptions = {
  awaitWriteFinish: {
    pollInterval: 10,
    stabilityThreshold: 10,
  },
  ignoreInitial: true,
  ignored: ['**/.git/**', '**/node_modules/**', '**/public/**', '**/db/**', '**/tmp/**'],
}

const rootWatcher = watch(cwd, { ...watchOptions, depth: 0 })
const appWatcher = watch(appDir, watchOptions)

rootWatcher.on('all', (event, changedPath) => {
  handleWatchEvent(event, path.resolve(cwd, changedPath))
})

appWatcher.on('all', (event, changedPath) => {
  handleWatchEvent(event, path.resolve(appDir, changedPath))
})

function handleWatchEvent(event: string, filePath: string) {
  if (event !== 'add' && event !== 'change' && event !== 'unlink') return
  if (waitingForRestart) {
    spawnChild()
    return
  }
  if (!browserWatchedFiles.has(filePath)) return
  requestBrowserHmrEvents([{ filePath, event }])
}

const proxyFetch = createFetchProxy(`http://127.0.0.1:${appPort}`, {
  xForwardedHeaders: true,
})

const hmrReadyFetch = createHmrReadyFetch(runner, proxyFetch)

const publicServer = Bun.serve({
  port: hmrProxyPort,
  fetch: hmrReadyFetch,
})

console.log(`Dev server listening on http://localhost:${hmrProxyPort}`)

async function shutdown() {
  if (stopping) return
  stopping = true
  if (child) {
    child.kill()
    await Promise.race([child.exited, sleep(5_000).then(() => child?.kill('SIGKILL'))]).catch(
      () => {},
    )
    await child.exited.catch(() => {})
  }
  await Promise.all([rootWatcher.close(), appWatcher.close()])
  publicServer.stop(true)
  eventServer.stop(true)
  process.exit(0)
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

spawnChild()

interface WatchFileDelta {
  add: string[]
  remove: string[]
}

interface BrowserHmrFileEvent {
  filePath: string
  event: 'add' | 'change' | 'unlink'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isWatchFileDelta(value: unknown): value is WatchFileDelta {
  return (
    isRecord(value) &&
    Array.isArray(value.add) &&
    value.add.every((item) => typeof item === 'string') &&
    Array.isArray(value.remove) &&
    value.remove.every((item) => typeof item === 'string')
  )
}
