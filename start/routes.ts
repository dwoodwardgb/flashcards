/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import Word from '#models/word'
import { Exception } from '@adonisjs/core/exceptions'
import router from '@adonisjs/core/services/router'
const WordsController = () => import('#controllers/words_controller')
const QuizesController = () => import('#controllers/quizes_controller')

router.get('/', async function get(ctx) {
  let words: Word[] | undefined

  try {
    words = await Word.query().select().exec()
  } catch (e) {
    ctx.logger.error(e, 'error loading words')
    throw new Exception('error loading words', { status: 500 })
  }

  return ctx.view.render('pages/home', { words })
})

router.post('/words/update', [WordsController, 'update'])
router.patch('/words/:id', [WordsController, 'update'])
router.post('/words/delete', [WordsController, 'delete'])
router.delete('/words/:id', [WordsController, 'delete'])
router.post('/words', [WordsController, 'create'])

router.get('/quizes', [QuizesController, 'show'])
router.post('/quizes/create', [QuizesController, 'create'])
router.post('/quizes', [QuizesController, 'update'])
