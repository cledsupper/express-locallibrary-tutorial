var Book = require('../models/book')
var Author = require('../models/author')
var BookInstance = require('../models/bookInstance')
var Genre = require('../models/genre')
const { body, validationResult } = require('express-validator')

var async = require('async')
var debug = require('debug')('book')

exports.index = function(req, res) {
    async.parallel({
      book_count: function(callback) {
        Book.countDocuments({}, callback) // contar todos os documentos da coleção
      },
      book_instance_count: function(callback) {
        BookInstance.countDocuments({}, callback)
      },
      book_instance_available_count: function(callback) {
        BookInstance.countDocuments({ status: "Disponível" }, callback)
      },
      author_count: function(callback) {
        Author.countDocuments({}, callback)
      },
      genre_count: function(callback) {
        Genre.countDocuments({}, callback)
      }
    }, function(err, results) {
      if (err) debug('query error: ' + err)
      res.render('index', { title: 'Local Library Home', error: err, data: results })
    })
}

exports.book_list = function(req, res, next) {
    Book.find({}, "title author")
        .populate("author")
        .exec(function(err, list_books) {
            if (err) {
                debug('query error: ' + err)
                return next(err)
            }
            res.render('book_list', { title: 'Lista de livros', book_list: list_books })
        })
}

exports.book_detail = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
                .populate("author")
                .populate("genre")
                .exec(callback)
        },
        book_instance: function(callback) {
            BookInstance.find({ 'book': req.params.id })
                .exec(callback)
        }
    }, function(err, results) {
        if (err) {
            debug('query error: ' + err)
            return next(err)
        }
        if (results.book == null) {
            var err = new Error('Livro não existe')
            err.status = 404
            return next(err)
        }
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance })
    })

}

exports.book_create_get = function(req, res, next) {

    async.parallel({
        authors: function(callback) {
            Author.find(callback)
        },
        genres: function(callback) {
            Genre.find(callback)
        }
    }, function(err, results) {
        if (err) {
            debug('query error: ' + err)
            return next(err)
        }
        res.render('book_form', { title: 'Adicionar livro', authors: results.authors, genres: results.genres })
    })
}

exports.book_create_post = [
    // Converte os gêneros em um array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = []
            else
                req.body.genre = new Array(req.body.genre)
        }
        next()
    },

    // validar e sanitizar campos
    body('title', 'Título não pode estar em branco.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Autor não pode estar em branco.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Descrição não pode estar em branco.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN não pode estar em branco.').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // processar requisição
    (req, res, next) => {
        const errors = validationResult(req)

        // Cria o livro
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        })

        if (!errors.isEmpty()) {
            async.parallel({
                authors: function(callback) {
                    Author.find(callback)
                },
                genres: function(callback) {
                    Genre.find(callback)
                }
            }, function(err, results) {
                if (err) {
                    debug('query error: ' + err)
                    return next(err)
                }

                // Rechecar os gêneros
                for (let i=0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true'
                    }
                }

                res.render('book_form', { title: 'Adicionar livro', authors: results.authors, genres: results.genres, book: book, errors: errors.array() })
            })
        }
        else {
            book.save(function(err) {
                if (err) {
                    debug('save error: ' + err)
                    return next(err)
                }
                res.redirect(book.url)
            })
        }
    }
]

exports.book_update_get = function(req, res, next) {

    // Colocar livros, autores e gêneros no formulário
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback)
        },
        authors: function(callback) {
            Author.find(callback)
        },
        genres: function(callback) {
            Genre.find(callback)
        }
    }, function(err, results) {
        if (err) {
            debug('query error: ' + err)
            return next(err)
        }
        if (results.book == null) {
            var err = new Error('Livro não encontrado')
            err.status = 404
            return next(err)
        }

        for (let g=0; g < results.genres.length; g++) {
            for (let bg=0; bg < results.book.genre.length; bg++) {
                if (results.genres[g]._id.toString() === results.book.genre[bg]._id.toString()) {
                    results.genres[g].checked = 'true'
                }
            }
        }
        res.render('book_form', { title: 'Atualizar livro', book: results.book, authors: results.authors, genres: results.genres })
    })

}

exports.book_update_post = [

    // Converte o parâmetro de gênero em array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = []
            else
                req.body.genre = new Array(req.body.genre)
        }
        next()
    },

    // Validação de dados
    body('title', 'Título deve ser preenchido').trim().isLength({ min: 1 }).escape(),
    body('author', 'Autor deve ser selecionado').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Descrição deve ser preeenchida').trim().isLength({ min: 1 }).escape(),
    body('isbn', "ISBN deve ser preenchido").trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    (req, res, next) => {

        const errors = validationResult(req)

        // Criar livro
        var book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
            _id: req.params.id
        })

        if (!errors.isEmpty()) {
            // Renderizar formulário novamente
            async.parallel({
                authors: function(callback) {
                    Author.find(callback)
                },
                genres: function(callback) {
                    Genre.find(callback)
                }
            }, function(err, results) {
                if (err) {
                    debug('query error: ' + err)
                    return next(err)
                }

                for (let i=0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true'
                    }
                }
                res.render('book_form', { title: 'Alterar livro', authors: results.authors, genres: results.genres, book: book, errors: errors.array() })
            })
        }
        else {
            Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
                if (err) {
                    debug('update error: ' + err)
                    return next(err)
                }
                res.redirect(thebook.url)
            })
        }
    }
]

exports.book_delete_get = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id, callback)
        },
        bookinstances: function(callback) {
            BookInstance.find({ 'book': req.params.id }, callback)
        }
    }, function(err, results) {
        if (err) {
            debug('query error: ' + err)
            return next(err)
        }
        if (results.book == null) {
            res.redirect('/catalog/books')
        }
        else {
            res.render('book_delete', { title: 'Excluir livro', book: results.book, bookinstances: results.bookinstances })
        }
    })
}

exports.book_delete_post = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.body.bookid, callback)
        },
        bookinstances: function(callback) {
            BookInstance.find({ 'book': req.body.bookid }, callback)
        }
    }, function(err, results) {
        if (err) {
            debug('query error: ' + err)
            return next(err)
        }
        if (results.bookinstances.length > 0) {
            res.render('book_delete', { title: 'Excluir livro', book: results.book, bookinstances: results.bookinstances })
        }
        else {
            Book.findByIdAndRemove(req.body.bookid, function(err) {
                res.redirect('/catalog/books')
            })
        }
    })
}
