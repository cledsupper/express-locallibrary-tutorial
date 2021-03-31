var express = require('express')
var router = express.Router()

// Módulos dos controladores
var authorController = require('../controllers/authorController')
var bookController = require('../controllers/bookController')
var bookInstanceController = require('../controllers/bookInstanceController')
var genreController = require('../controllers/genreController')

// ROTAS DE BOOK
router.get('/', bookController.index)
router.get('/books', bookController.book_list)
// rotas do tipo '/object/action' devem preceder as rotas '/object/[id]/action'
router.get('/book/create', bookController.book_create_get)
router.post('/book/create', bookController.book_create_post)
router.get('/book/:id', bookController.book_detail)
router.get('/book/:id/update', bookController.book_update_get)
router.post('/book/:id/update', bookController.book_update_post)
router.get('/book/:id/delete', bookController.book_delete_get)
router.post('/book/:id/delete', bookController.book_delete_post)

// ROTAS DE AUTHOR
router.get('/authors', authorController.author_list)
router.get('/author/create', authorController.author_create_get)
router.post('/author/create', authorController.author_create_post)
router.get('/author/:id', authorController.author_detail)
router.get('/author/:id/update', authorController.author_update_get)
router.post('/author/:id/update', authorController.author_update_post)
router.get('/author/:id/delete', authorController.author_delete_get)
router.post('/author/:id/delete', authorController.author_delete_post)

// ROTAS DE GENRE
router.get('/genres', genreController.genre_list)
router.get('/genre/create', genreController.genre_create_get)
router.post('/genre/create', genreController.genre_create_post)
router.get('/genre/:id', genreController.genre_detail)
router.get('/genre/:id/update', genreController.genre_update_get)
router.post('/genre/:id/update', genreController.genre_update_post)
router.get('/genre/:id/delete', genreController.genre_delete_get)
router.post('/genre/:id/delete', genreController.genre_delete_post)

// ROTAS DE BOOKINSTANCE
router.get('/bookinstances', bookInstanceController.bookinstance_list)
router.get('/bookinstance/create', bookInstanceController.bookinstance_create_get)
router.post('/bookinstance/create', bookInstanceController.bookinstance_create_post)
router.get('/bookinstance/:id', bookInstanceController.bookinstance_detail)
router.get('/bookinstance/:id/update', bookInstanceController.bookinstance_update_get)
router.post('/bookinstance/:id/update', bookInstanceController.bookinstance_update_post)
router.get('/bookinstance/:id/delete', bookInstanceController.bookinstance_delete_get)
router.post('/bookinstance/:id/delete', bookInstanceController.bookinstance_delete_post)

module.exports = router