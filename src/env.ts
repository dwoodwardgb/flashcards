import { Type, type Static } from "typebox";
import { Value } from "typebox/value";

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal("development"),
    Type.Literal("test"),
    Type.Literal("production"),
  ]),
  HOST: Type.String({ default: "127.0.0.1" }),
  PORT: Type.Integer({ minimum: 1, maximum: 65535, default: 3000 }),
  LOG_LEVEL: Type.Union(
    [
      Type.Literal("fatal"),
      Type.Literal("error"),
      Type.Literal("warn"),
      Type.Literal("info"),
      Type.Literal("debug"),
      Type.Literal("trace"),
    ],
    { default: "info" },
  ),
  PRETTY_LOGS: Type.Boolean(),
  WEB_VITALS: Type.Boolean(),
  DB_URL: Type.String(),
  METRICS_DB_URL: Type.String(),
  AUDIO_FILES_DIR: Type.String(),
  TTS_GAPI_KEY_URL: Type.String(),
  USE_VITE_DEV_SERVER: Type.Boolean(),
  INCLUDE_ERROR_MESSAGES_IN_RESPONSES: Type.Boolean(),
});

export type Env = Static<typeof EnvSchema>;

export function loadEnv(input: NodeJS.ProcessEnv): Env {
  return Value.Decode(EnvSchema, input);
}

export const env = loadEnv(process.env);
