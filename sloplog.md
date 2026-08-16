Done. The bun-native HMR supervisor is built and fully verified:
New files
- hmr.ts (~330 lines) — parent supervisor: Bun.serve proxy with createHmrReadyFetch (readiness gate + request retry), SSE browser channel on :44101/hmr, chokidar file watching, child spawn/restart via Bun.spawn with IPC.
- hmr-preload.ts (~150 lines) — child preload installing globalThis.__remixNodeHmr (channel + server-ready) over bun IPC, so stock remix/node-hmr/runtime and remix/assets HMR work unchanged.
Wiring — server.ts re-emits server-ready (re-fires after every hot swap), app/assets.ts restores the hmr channel + uiHmr() loader, hmr script back in package.json, chokidar added.
How parity works: bun --hot replaces the node-only register hook — it hot-swaps modules in-process (verified earlier: stable PID, import.meta.hot.data persistence, transparent Bun.serve rebinding). The parent handles everything bun can't: browser event channel, stable proxy, crash restarts.
Verified end-to-end:
- Home serves through the proxy; server:update reaches SSE clients after a server hot swap
- Browser-only file edit → browser:update with incremental JS updates; component edit → both browser:update + server:update
- HMR client module connects via EventSource to the channel
- Child crash → auto-restart on next file change; clean SIGINT shutdown (5s SIGKILL fallback)
- dev, start, test, typecheck all still pass
One bug found while building: chokidar's recursive native watcher on the project root silently broke bun's IPC channel — fixed by watching root non-recursively (depth: 0) + app/ recursively.
