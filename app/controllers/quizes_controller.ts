import type { HttpContext } from '@adonisjs/core/http'
// import seedrandom from 'seedrandom'
import { randomInt } from 'node:crypto'
import Word from '#models/word'
import { createQuizValidator, quizValidator } from '#validators/quiz_validator'
import { Exception } from '@adonisjs/core/exceptions'

type Quiz = {
  from: string[]
  to: string[]
  words: string | number[]
  seed: string
  index: number
}

function serializeQuizToQueryString(quiz: Quiz) {
  const query = new URLSearchParams()

  // TODO: bitsets?
  quiz.from.forEach((f) => {
    query.set('from[]', f)
  })
  quiz.to.forEach((f) => {
    query.set('to[]', f)
  })
  query.set('seed', quiz.seed)
  query.set('index', quiz.index.toString())
  if (Array.isArray(quiz.words)) {
    // TODO: bitsets?
    quiz.words.forEach((w) => {
      query.set('words[]', w.toString())
    })
  } else {
    // else it should be "ALL"
    query.set('words', quiz.words)
  }

  return query.toString()
}

export default class QuizesController {
  async create(ctx: HttpContext) {
    const body = await createQuizValidator.validate(ctx.request.body())

    let allWords
    try {
      allWords = await Word.query().select().exec()
    } catch (e) {
      ctx.logger.error(e, 'error loading words')
      throw new Exception('error loading words', { status: 500 })
    }

    const allAreSelected = allWords.every((w) => {
      return body.words.includes(w.id)
    })

    const quiz: Quiz = {
      from: body.from,
      to: body.to,
      words: allAreSelected ? 'ALL' : body.words,
      seed: randomInt(0, 900000000).toString(),
      index: 0,
    }
    ctx.response.redirect(`/quizes?${serializeQuizToQueryString(quiz)}`, false, 302)
  }

  async show(ctx: HttpContext) {
    // TOOD: see if we can get away without #all
    const quiz = await quizValidator.validate(ctx.request.all())

    return ctx.view.render('pages/quiz', { dump: JSON.stringify(quiz, null, 4) })
  }
}
