import type { HttpContext } from '@adonisjs/core/http'
import Word from '#models/word'
import {
  updateWordValidator,
  deleteWordValidator,
  createWordValidator,
} from '#validators/word_validator'

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
      ctx.response.status(500)
      ctx.response.header('Content-Type', 'text/plain')
      return 'Internal server error'
    }

    ctx.response.redirect('/', false, 302)
  }

  async edit(ctx: HttpContext) {
    const body = await updateWordValidator.validate(ctx.request.body())

    try {
      const [affectedRows] = await Word.query()
        .update('traditional', body.traditional)
        .update('pinyin', body.pinyin)
        .update('english', body.english)
        .where('id', body.id)
        .exec()

      if (affectedRows === 0) {
        ctx.response.status(404)
        ctx.response.header('Content-Type', 'text/plain')
        return 'Unknown word'
      }
    } catch (e) {
      ctx.logger.error(e, 'error updating word')
      ctx.response.status(500)
      ctx.response.header('Content-Type', 'text/plain')
      return 'Internal server error'
    }

    ctx.response.redirect('/', false, 302)
  }

  async delete(ctx: HttpContext) {
    const body = await deleteWordValidator.validate(ctx.request.body())

    try {
      await Word.query().delete().where('id', body.id).exec()
    } catch (e) {
      ctx.logger.error(e, 'error deleting word')
      ctx.response.status(500)
      ctx.response.header('Content-Type', 'text/plain')
      return 'Internal server error'
    }

    ctx.response.redirect('/', false, 302)
  }
}
