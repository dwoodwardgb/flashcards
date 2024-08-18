import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'words'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('traditional').index()
      table.text('pinyin').index()
      table.text('english').index()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
