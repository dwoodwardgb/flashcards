import type { Env } from "./env.ts";

export interface AppContext {
  env: Env;
  close(): Promise<void> | void;
}

export function createAppContext(env: Env): AppContext {
  return {
    env,
    close() {},
  };
}
