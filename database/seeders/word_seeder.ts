import Word from '#models/word'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Word.createMany([
      { traditional: '我', pinyin: 'wǒ', english: 'I' },
      { traditional: '你', pinyin: 'nǐ', english: 'you' },
      { traditional: '再', pinyin: 'zài', english: 'again' },
      { traditional: '見', pinyin: 'jiàn', english: 'meet' },
      { traditional: '好', pinyin: 'hǎo', english: 'good' },
      { traditional: '魚', pinyin: 'yú', english: 'fish' },
      { traditional: '牛', pinyin: 'niú', english: 'cow' },
      { traditional: '肉', pinyin: 'roù', english: 'meat' },
      { traditional: '雞', pinyin: 'jī', english: 'chicken' },
      { traditional: '一', pinyin: 'yī', english: 'one' },
      { traditional: '二', pinyin: 'èr', english: 'two' },
      { traditional: '三', pinyin: 'san', english: 'three' },
      { traditional: '四', pinyin: 'sì', english: 'four' },
      { traditional: '五', pinyin: 'wǔ', english: 'five' },
      { traditional: '六', pinyin: 'liù', english: 'six' },
      { traditional: '七', pinyin: 'qī', english: 'seven' },
      { traditional: '八', pinyin: 'bā', english: 'eight' },
      { traditional: '九', pinyin: 'jiǔ', english: 'nine' },
      { traditional: '十', pinyin: 'shí', english: 'ten' },
      { traditional: '零', pinyin: 'líng', english: 'zero' },
      { traditional: '百', pinyin: 'bǎi', english: 'hundred' },
      { traditional: '元', pinyin: 'yuán', english: 'Yuan' },
      { traditional: '邀請', pinyin: 'yāoqǐng', english: 'invite' },
      { traditional: '說', pinyin: 'shuō', english: 'Say' },
      { traditional: '姐', pinyin: 'Jiě', english: 'sister' },
      { traditional: '弟', pinyin: 'dì', english: 'brother' },
      { traditional: '禱告', pinyin: 'dǎogào', english: 'Pray' },
      { traditional: '想', pinyin: 'xiǎng', english: 'Want' },
      { traditional: '上', pinyin: 'shàng', english: 'up' },
      { traditional: '樓上', pinyin: 'lóushàng', english: 'upstairs' },
    ])
  }
}
