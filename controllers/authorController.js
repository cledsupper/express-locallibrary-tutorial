var Author = require('../models/author')
var Book = require('../models/book')

var async = require('async')
const { body, validationResult } = require('express-validator')

// Mostrar lista de autores
exports.author_list = function(req, res, next) {

    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) { return next(err); }

            res.render('author_list', { title: 'Lista de autores', author_list: list_authors })
        })

}

exports.author_detail = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
                .exec(callback)
        },
        author_books: function(callback) {
            Book.find({ 'author': req.params.id }, 'title summary')
                .exec(callback)
        }
    }, function(err, results) {
        if (err) return next(err)
        if (results.author == null) {
            var err = new Error('Autor não existe')
            err.status = 404
            return next(err)
        }
        res.render('author_detail', { title: results.author.name, author: results.author, author_books: results.author_books })
    })

}

exports.author_create_get = function(req, res, next) {
    res.render('author_form', { title: 'Adicionar autor' })
}

exports.author_create_post = [
    // Campos para validação e sanitização
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('O primeiro nome deve ser especificado')
        .isAlphanumeric().withMessage('O primeiro nome contém caracteres não alfanúmericos'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('O nome de família deve ser especificado')
    .isAlphanumeric().withMessage('O nome de família contém caracteres não alfanúmericos'),
    body('date_of_birth', 'Data de nascimento inválida').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Data de falecimento inválida').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Processar requisição após validação e sanitização
    (req, res, next) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            // Existem erros. Então renderiza o formulário com os erros e valores sanitizados
            res.render('author_form', { title: 'Adicionar autor', author: req.body, errors: errors.array() })
            return
        }
        else {
            // Os dados do formulário são válidos
            // Cria um autor com os dados limpos
            var author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            })
            author.save(function(err) {
                if (err) return next(err)
                // Com sucesso, retorna para a página do autor
                res.redirect(author.url)
            })
        }
    }
]

exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        books: function(callback) {
            Book.find({ 'author': req.params.id }, callback)
        }
    }, function(err, results) {

        if (err) return next(err)
        if (results.author == null) res.redirect('/catalog/authors')
        res.render('author_delete', { title: 'Excluir autor', author: results.author, author_books: results.books })

    })

}

exports.author_delete_post = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.body.authorid).exec(callback)
        },
        books: function(callback) {
            Book.find({ 'author': req.body.authorid }, callback)
        }
    }, function(err, results) {
        if (err) return next(err)
        if (results.books.length > 0) {
            res.render('author_delete', { title: 'Excluir autor', author: results.author, author_books: results.books })
        }
        else {
            Author.findByIdAndRemove(req.body.authorid, function(err) {
                if (err) return next(err)
                res.redirect('/catalog/authors')
            })
        }
    })

}

exports.author_update_get = function(req, res, next) {

    Author.findById(req.params.id, function(err, author) {
        if (err) return next(err)
        if (!author) {
            var err = new Error('Autor não encontrado')
            err.status = 404
            return next(err)
        }
        res.render('author_form', { title: 'Alterar dados de autor', author: author })
    })
}

exports.author_update_post = [
    // Validação dos dados
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('O primeiro nome deve ser especificado')
        .isAlphanumeric().withMessage('O primeiro nome contém caracteres não alfanuméricos'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('O nome de família deve ser especificado')
        .isAlphanumeric().withMessage('O nome de família contém caracteres não alfanuméricos'),
    body('date_of_birth', 'Data de nascimento inválida').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Data de falência inválida').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req, res, next) => {

        const errors = validationResult(req)

        var author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id
        })

        if (!errors.isEmpty()) {
            res.render('author_form', { title: 'Alterar dados de autor', author: author, errors: errors.array() })
        }
        else {
            Author.findByIdAndUpdate(req.params.id, author, {}, function(err, theauthor) {
                if (err) return next(err)
                res.redirect(theauthor.url)
            })
        }
    }
]
