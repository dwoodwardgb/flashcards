import vine from '@vinejs/vine'

export const createQuizValidator = vine.compile(
  vine.object({
    // TODO: enforce enums etc
    from: vine.array(vine.string()),
    // TODO: enforce enums etc
    to: vine.array(vine.string()),
    words: vine.array(vine.number().positive()),
  })
)

export const quizValidator = vine.compile(
  vine.object({
    // TODO: enforce enums etc
    from: vine.array(vine.string()),
    // TODO: enforce enums etc
    to: vine.array(vine.string()),
    words: vine.unionOfTypes([vine.string(), vine.array(vine.number().positive())]),
    seed: vine.string().minLength(1),
    index: vine.number().positive(),
    traditional: vine.string().trim().toLowerCase().optional(),
    pinyin: vine.string().trim().toLowerCase().optional(),
    english: vine.string().trim().toLowerCase().optional(),
  })
)
