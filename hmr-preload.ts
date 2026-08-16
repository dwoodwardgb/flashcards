interface WatchFileDelta {
  add: string[]
  remove: string[]
}

interface BrowserHmrFileEvent {
  filePath: string
  event: 'add' | 'change' | 'unlink'
}

interface BrowserHmrChannel {
  url: string
  onFileEvents(handler: (events: BrowserHmrFileEvent[]) => Promise<unknown[]>): () => void
  updateWatchedFiles(delta: WatchFileDelta): void
  close(): void
}

interface BunHmrRuntime {
  createBrowserHmrChannel(): Promise<BrowserHmrChannel>
  emitServerReady(): void
}

declare global {
  var __remixNodeHmr: BunHmrRuntime | undefined
  namespace NodeJS {
    interface Process {
      send?(message: unknown): boolean
    }
  }
}

const browserHmrChannelRequestTimeoutMs = 5_000

let browserEventUrl: string | undefined
let browserHmrChannelId = 0
let browserHmrChannelRequestId = 0
let pendingBrowserHmrChannelRequests = new Map<
  number,
  { resolve: (url: string | undefined) => void; timer: ReturnType<typeof setTimeout> }
>()
let browserHmrChannels = new Map<
  number,
  { handleFileEvents(events: BrowserHmrFileEvent[]): Promise<unknown[]> }
>()

process.on('message', (message) => {
  if (!isRecord(message)) return
  if (message.type === 'node-hmr:parent:browser-hmr-channel' && typeof message.requestId === 'number') {
    let request = pendingBrowserHmrChannelRequests.get(message.requestId)
    if (request === undefined) return
    clearTimeout(request.timer)
    pendingBrowserHmrChannelRequests.delete(message.requestId)
    request.resolve(typeof message.url === 'string' ? message.url : undefined)
    return
  }
  if (
    message.type === 'node-hmr:parent:browser-hmr-file-events' &&
    typeof message.requestId === 'number' &&
    Array.isArray(message.events)
  ) {
    handleBrowserHmrFileEvents(message.requestId, message.events as BrowserHmrFileEvent[])
  }
})

globalThis.__remixNodeHmr = {
  async createBrowserHmrChannel() {
    browserEventUrl ??= await requestBrowserHmrChannelUrl()
    if (browserEventUrl === undefined) {
      throw new Error('Browser HMR is disabled for this bun HMR runtime')
    }

    let id = browserHmrChannelId++
    let watchedFiles = new Set<string>()
    let handlers = new Set<(events: BrowserHmrFileEvent[]) => Promise<unknown[]>>()
    let closed = false

    browserHmrChannels.set(id, {
      async handleFileEvents(events) {
        let eventGroups = await Promise.all([...handlers].map((handler) => handler(events)))
        return eventGroups.flat()
      },
    })

    function updateWatchedFiles(delta: WatchFileDelta) {
      if (closed) return
      for (let file of delta.add) watchedFiles.add(file)
      for (let file of delta.remove) watchedFiles.delete(file)
      process.send?.({
        id,
        delta,
        type: 'node-hmr:child:browser-hmr-watch-files-changed',
      })
    }

    return {
      close() {
        if (closed) return
        closed = true
        browserHmrChannels.delete(id)
        handlers.clear()
        let remove = [...watchedFiles]
        watchedFiles.clear()
        process.send?.({
          id,
          delta: { add: [], remove },
          type: 'node-hmr:child:browser-hmr-watch-files-changed',
        })
      },
      onFileEvents(handler) {
        if (closed) return () => {}
        handlers.add(handler)
        return () => {
          handlers.delete(handler)
        }
      },
      updateWatchedFiles,
      url: browserEventUrl,
    }
  },
  emitServerReady() {
    process.send?.({ type: 'node-hmr:child:server-ready' })
  },
}

function requestBrowserHmrChannelUrl() {
  return new Promise<string | undefined>((resolve) => {
    let requestId = browserHmrChannelRequestId++
    let timer = setTimeout(() => {
      pendingBrowserHmrChannelRequests.delete(requestId)
      resolve(undefined)
    }, browserHmrChannelRequestTimeoutMs)
    pendingBrowserHmrChannelRequests.set(requestId, { resolve, timer })
    if (!process.send?.({ requestId, type: 'node-hmr:child:browser-hmr-channel-requested' })) {
      clearTimeout(timer)
      pendingBrowserHmrChannelRequests.delete(requestId)
      resolve(undefined)
    }
  })
}

function handleBrowserHmrFileEvents(requestId: number, events: BrowserHmrFileEvent[]) {
  Promise.all([...browserHmrChannels.values()].map((channel) => channel.handleFileEvents(events)))
    .then((eventGroups) => {
      process.send?.({
        events: eventGroups.flat(),
        requestId,
        type: 'node-hmr:child:browser-hmr-file-events-handled',
      })
    })
    .catch((error) => {
      process.send?.({
        error: error instanceof Error ? error.message : String(error),
        events: [],
        requestId,
        type: 'node-hmr:child:browser-hmr-file-events-handled',
      })
    })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
