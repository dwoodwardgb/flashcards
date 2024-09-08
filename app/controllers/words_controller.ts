import type { HttpContext } from '@adonisjs/core/http'
import Word from '#models/word'
import {
  updateWordValidator,
  deleteWordValidator,
  createWordValidator,
} from '#validators/word_validator'
import { Exception } from '@adonisjs/core/exceptions'

export default class WordsController {
  async create(ctx: HttpContext) {
    const body = await createWordValidator.validate(ctx.request.body())
    try {
      const word = new Word()
      word.traditional = body.traditional
      word.pinyin = body.pinyin
      word.english = body.english
      await word.save()
    } catch (e) {
      ctx.logger.error(e, 'error saving word')
      throw new Exception('error saving word', { status: 500 })
    }

    ctx.response.redirect('/', false, 302)
  }

  async edit(ctx: HttpContext) {
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

    ctx.session.flash('notification', { type: 'success', message: 'Word edited.' })
    ctx.response.redirect('/', false, 302)
  }

  async delete(ctx: HttpContext) {
    const body = await deleteWordValidator.validate(ctx.request.body())

    try {
      await Word.query().delete().where('id', body.id).exec()
    } catch (e) {
      ctx.logger.error(e, 'error deleting word')
      throw new Exception('error deleting word', { status: 500 })
    }

    ctx.session.flash('notification', { type: 'success', message: 'Word removed.' })
    ctx.response.redirect('/', false, 302)
  }
}
