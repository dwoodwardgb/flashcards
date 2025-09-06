import vine from '@vinejs/vine'

export const updateWordValidator = vine.compile(
  vine.object({
    id: vine.number().positive(),
    traditional: vine.string().trim(),
    pinyin: vine.string().trim(),
    english: vine.string().trim(),
  })
)

export const wordIdValidator = vine.compile(
  vine.object({
    id: vine
      .number()
      // .parse(parseInt as any)
      .positive(),
  })
)

export const createWordValidator = vine.compile(
  vine.object({
    traditional: vine.string().trim(),
    pinyin: vine.string().trim(),
    english: vine.string().trim(),
  })
)
