import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Word extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare traditional: string | null

  @column()
  declare pinyin: string | null

  @column()
  declare english: string | null

  @column()
  declare pronunciation_url: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
