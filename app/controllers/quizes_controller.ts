import type { HttpContext } from '@adonisjs/core/http'
import seedrandom from 'seedrandom'
import { randomInt } from 'node:crypto'
import Word from '#models/word'
import { createQuizValidator, quizValidator } from '#validators/quiz_validator'
import { Exception } from '@adonisjs/core/exceptions'
import logger from '@adonisjs/core/services/logger'

type QuizPageState = {
  from: string[]
  to: string[]
  words: string | number[]
  seed: string
  index: number
  traditional?: string
  pinyin?: string
  english?: string
}

function serializeQuizToQueryString(quiz: QuizPageState) {
  let parts = []

  // TODO: bitsets?
  quiz.from.forEach((f) => {
    parts.push(`from[]=${f}`)
  })
  quiz.to.forEach((f) => {
    parts.push(`to[]=${f}`)
  })
  parts.push(`seed=${quiz.seed}`)
  parts.push(`index=${quiz.index}`)
  if (Array.isArray(quiz.words)) {
    // TODO: bitsets?
    quiz.words.forEach((w) => {
      parts.push(`words[]=${w}`)
    })
  } else {
    // else it should be "ALL"
    parts.push(`words=${quiz.words}`)
  }
  if (quiz.traditional) {
    parts.push(`traditional=${quiz.traditional}`)
  }
  if (quiz.pinyin) {
    parts.push(`pinyin=${quiz.pinyin}`)
  }
  if (quiz.english) {
    parts.push(`english=${quiz.english}`)
  }

  return encodeURI(parts.join('&'))
}

function getSortedArrayFromRandomSeed<T>(seed: string, arr: T[]) {
  const newArr = [...arr]
  const rng = seedrandom(seed)
  newArr.sort((_a, _b) => {
    if (rng() > 0.5) {
      return 1
    } else {
      return -1
    }
  })
  return newArr
}

function validateIndex<T>(index: number, arr: T[]) {
  if (index < 0 || index >= arr.length) {
    throw new Exception(`Index out of bounds (${index}) for words array size: ${arr.length}`, {
      status: 422,
    })
  }
}

async function getWordsForQuizStep(quiz: QuizPageState): Promise<{
  word: Word
  isLastWord: boolean
}> {
  // quiz.words is an array of word ids, lookup that way
  if (Array.isArray(quiz.words)) {
    validateIndex(quiz.index, quiz.words)
    const sortedWordIds = getSortedArrayFromRandomSeed(quiz.seed, quiz.words)
    try {
      const found = await Word.query().select().where('id', sortedWordIds[quiz.index])
      if (found.length === 0) {
        throw new Exception(`Missing words for id ${sortedWordIds[quiz.index]}`, {
          status: 404,
        })
      } else if (found.length > 1) {
        logger.error(`Found ${found.length} words for id: ${quiz.index}`)
        throw new Exception('Something went wrong.', {
          status: 500,
        })
      }
      return { word: found[0], isLastWord: sortedWordIds.length - 1 === quiz.index }
    } catch (e) {
      logger.error(e, 'error loading words')
      throw new Exception('error loading words', { status: 500 })
    }
  } else {
    // quiz contains all words, look them up first from the DB
    try {
      const words = await Word.query().select().exec()
      validateIndex(quiz.index, words)
      const sortedWords = getSortedArrayFromRandomSeed(quiz.seed, words)
      return {
        word: sortedWords[quiz.index],
        isLastWord: sortedWords.length - 1 === quiz.index,
      }
    } catch (e) {
      logger.error(e, 'error loading words')
      throw new Exception('error loading words', { status: 500 })
    }
  }
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

    const quiz: QuizPageState = {
      from: body.from,
      to: body.to,
      words: allAreSelected ? 'ALL' : body.words,
      seed: randomInt(0, 900000000).toString(),
      index: 0,
    }
    ctx.response.redirect(`/quizes?${serializeQuizToQueryString(quiz)}`, false, 302)
  }

  async show(ctx: HttpContext) {
    const quiz = await quizValidator.validate(ctx.request.all())

    const { word } = await getWordsForQuizStep(quiz)

    return ctx.view.render('pages/quiz', { quiz, word })
  }

  async update(ctx: HttpContext) {
    const quiz = await quizValidator.validate(ctx.request.all())
    const { word, isLastWord } = await getWordsForQuizStep(quiz)

    // 1. validate answer
    for (let key of quiz.to) {
      const expected = (word as any)[key]
      const actual = (quiz as any)[key]
      // TODO: compare without accents when comparing pinyin
      if (actual?.trim().toLowerCase() !== expected?.trim().toLowerCase()) {
        ctx.session.flash('notification', { type: 'error', message: 'Incorrect!' })
        return ctx.response.redirect(`/quizes?${serializeQuizToQueryString(quiz)}`, false, 302)
      }
    }

    // 2. now that we've passed, check if we're at the end
    if (isLastWord) {
      ctx.session.flash('notification', { type: 'success', message: 'Quiz complete!' })
      return ctx.response.redirect('/', false, 302)
    }

    // 3. otherwise, go to the next step
    quiz.index += 1
    ctx.session.flash('notification', { type: 'success', message: 'Good job!' })

    return ctx.response.redirect(`/quizes?${serializeQuizToQueryString(quiz)}`, false, 302)
  }
}
