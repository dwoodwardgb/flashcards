import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'words'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('pronunciation_url').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pronunciation_url')
    })
  }
}
