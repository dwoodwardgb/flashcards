import type { HttpContext } from '@adonisjs/core/http'
import Word from '#models/word'
import {
  updateWordValidator,
  wordIdValidator,
  createWordValidator,
} from '#validators/word_validator'
import { Exception } from '@adonisjs/core/exceptions'
import fs from 'node:fs/promises'
import path from 'node:path'
import env from '#start/env'
import TtsClientProvider from '#providers/tts_client_provider'
import { inject } from '@adonisjs/core'

@inject()
export default class WordsController {
  constructor(public tts: TtsClientProvider) {}

  async create(ctx: HttpContext) {
    const body = await createWordValidator.validate(ctx.request.body())
    const word = new Word()
    word.traditional = body.traditional
    word.pinyin = body.pinyin
    word.english = body.english
    try {
      await word.save()
    } catch (e) {
      ctx.logger.error(e, 'error saving word')
      throw new Exception('error saving word', { status: 500 })
    }

    if (ctx.request.qs().htmx) {
      return ctx.view.render('components/word_table_row', { word })
    } else {
      ctx.response.redirect('/', false, 302)
    }
  }

  async update(ctx: HttpContext) {
    const body = await updateWordValidator.validate(ctx.request.body())

    let affectedRows = 0
    try {
      affectedRows = (
        await Word.query()
          .update('traditional', body.traditional)
          .update('pinyin', body.pinyin)
          .update('english', body.english)
          .where('id', body.id)
          .exec()
      )[0]
    } catch (e) {
      ctx.logger.error(e, 'error updating word')
      throw new Exception('error updating word', { status: 500 })
    }

    if (affectedRows !== 1) {
      throw new Exception('Could not find word', { status: 404 })
    }

    if (ctx.request.method() === 'PATCH') {
      ctx.response.header('x-flash', JSON.stringify({ type: 'success', message: 'Word saved.' }))
      return ctx.view.render('components/word_table_row', { word: body })
    } else {
      ctx.session.flash('notification', { type: 'success', message: 'Word saved.' })
      ctx.response.redirect('/', false, 302)
    }
  }

  async delete(ctx: HttpContext) {
    const body = await wordIdValidator.validate(ctx.request.all())

    try {
      await Word.query().delete().where('id', body.id).exec()
    } catch (e) {
      ctx.logger.error(e, 'error deleting word')
      throw new Exception('error deleting word', { status: 500 })
    }

    if (ctx.request.method() === 'DELETE') {
      ctx.response.header('x-flash', JSON.stringify({ type: 'success', message: 'Word removed.' }))
      ctx.response.status(200).send('')
    } else {
      ctx.session.flash('notification', { type: 'success', message: 'Word removed.' })
      ctx.response.redirect('/', false, 302)
    }
  }

  async fetchAudio(ctx: HttpContext) {
    const body = await wordIdValidator.validate(ctx.request.params())
    let words
    try {
      words = await Word.query().select().where('id', body.id).exec()
    } catch (e) {
      ctx.logger.error(e, 'error deleting word')
      throw new Exception('error deleting word', { status: 500 })
    }

    if (words.length > 1) {
      throw new Exception('Too many words for id', { status: 404 })
    } else if (words.length === 0) {
      throw new Exception('Could not find word', { status: 404 })
    }

    const word = words[0]
    if (!word.pronunciation_url) {
      const [response] = await this.tts.client.synthesizeSpeech({
        input: { text: word.traditional },
        voice: {
          languageCode: 'cmn-CN',
          name: 'cmn-CN-Standard-B',
          ssmlGender: 'MALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
        },
      })
      const fileUrl = path.join(
        env.get('AUDIO_FILES_DIR'),
        `${word.id.toString().padStart(7, '0')}.mp3`
      )
      await fs.mkdir(env.get('AUDIO_FILES_DIR'), { recursive: true })
      await fs.writeFile(fileUrl, response.audioContent as any, 'binary')
      word.pronunciation_url = fileUrl
      const affectedRows = (
        await Word.query()
          .update('pronunciation_url', word.pronunciation_url)
          .where('id', body.id)
          .exec()
      )[0]

      if (affectedRows !== 1) {
        throw new Exception('Error updating word with audio', { status: 500 })
      }

      // ctx.response.header('x-flash', JSON.stringify({ type: 'success', message: 'Word saved.' }))
      return ctx.view.render('components/word_audio_player', { word })
    }
  }
}
