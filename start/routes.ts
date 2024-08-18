/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import Word from '#models/word'
import router from '@adonisjs/core/services/router'
const WordsController = () => import('#controllers/words_controller')

router.get('/', async function get(ctx) {
  let words: Word[] | undefined

  try {
    words = await Word.query().select().exec()
  } catch (e) {
    ctx.logger.error(e, 'error loading words')
    ctx.response.status(500)
    ctx.response.header('Content-Type', 'text/plain')
    return 'Internal server error'
  }

  return ctx.view.render('pages/home', { words })
})

router.post('/words/create', [WordsController, 'create'])
router.post('/words/edit', [WordsController, 'edit'])
router.post('/words/delete', [WordsController, 'delete'])
