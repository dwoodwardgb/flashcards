import env from '#start/env'
import textToSpeech, { TextToSpeechClient } from '@google-cloud/text-to-speech'

export default class TtsClientProvider {
  #client?: TextToSpeechClient = undefined
  get client() {
    return (this.#client ??= new textToSpeech.TextToSpeechClient({
      keyFilename: env.get('TTS_GAPI_KEY') ?? undefined,
    }))
  }

  constructor() {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    if (this.#client) {
      await this.#client.close()
    }
  }
}
