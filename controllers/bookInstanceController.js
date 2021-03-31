var BookInstance = require('../models/bookInstance');
var Book = require('../models/book');

var async = require('async');

const { body, validationResult } = require('express-validator');

// Mostrar lista de BookInstances.
exports.bookinstance_list = function(req, res, next) {

    BookInstance.find()
        .populate('book')
        .exec(function(err, list_bookinstances) {
            if (err) { return next(err); }

            res.render('bookinstance_list', { title: 'Lista de cópias', bookinstance_list: list_bookinstances });
        });

};

// Mostrar página de detalhe de um específico BookInstance.
exports.bookinstance_detail = function(req, res, next) {

    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, book_instance) {
            if (err) return next(err);
            if (book_instance == null) {
                var err = new Error('Cópia não existe');
                err.status = 404;
                return next(err);
            }
            res.render('bookinstance_detail', { title: 'Cópia de: ' + book_instance.book.title, book_instance: book_instance});
        });

};

// Mostrar formulário de criação de BookInstance via GET.
exports.bookinstance_create_get = function(req, res, next) {

    Book.find({}, 'title')
        .exec(function(err, books) {
            if (err) return next(err);
            res.render('bookinstance_form', { title: 'Adicionar cópia', book_list: books });
        });

};

// Realizar criação de BookInstance via POST.
exports.bookinstance_create_post = [

    // Validar e sanitizar campos
    body('book', 'Livro deve ser especificado.').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Editora deve ser especificada.').trim().isLength({ min: 1 }).escape(),
    body('status', 'Estado da cópia deve ser especificado.').escape(),
    body('due_back', 'Data de retorno incorreta').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req, res, next) => {

        const errors = validationResult(req);

        var bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function(err, books) {
                    res.render('bookinstance_form', { title: 'Adicionar cópia', book_list: books, selected_book: bookInstance.book._id, bookinstance: bookInstance, errors: errors.array() });
                });
        }
        else {
            bookInstance.save(function(err) {
                if (err) return next(err);
            console.log('REDIRECT: ' + bookInstance.url);
                res.redirect(bookInstance.url);
            });
        }

    }
];

// Mostrar formulário de remoção de BookInstance via GET.
exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id, function(err, bookinstance) {
        if (err) return next(err);
        res.render('bookinstance_delete', { title: 'Excluir cópia', bookinstance: bookinstance });
    });
};

// Realizar remoção de BookInstance via POST.
exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findByIdAndRemove(req.body.biid, function(err) {
        if (err) return next(err);
        res.redirect('/catalog/bookinstances');
    });
};

// Mostrar formulário de atualização de BookInstance via GET.
exports.bookinstance_update_get = function(req, res, next) {

    async.parallel({
        bookInstance: function(callback) {
            BookInstance.findById(req.params.id)
                .populate('book')
                .exec(callback);
        },
        books: function(callback) {
            Book.find({}, 'title')
                .exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (!results.bookInstance) {
            var err = new Error('Cópia não existe');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_form', { title: 'Atualizar cópia', bookinstance: results.bookInstance, book_list: results.books });
    });
};

// Realizar atualização de BookInstance via POST.
exports.bookinstance_update_post = [
    // Validação dos dados
    body('book', 'Livro deve ser especificado').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Editora deve ser especificada').trim().isLength({ min: 1 }).escape(),
    body('status', 'Estado da cópia deve ser especificado').escape(),
    body('due_back', 'Data de retorno incorreta').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req, res, next) => {

         const errors = validationResult(req);

         var bi = new BookInstance({
             book: req.body.book,
             imprint: req.body.imprint,
             status: req.body.status,
             due_back: req.body.due_back,
             _id: req.params.id
         });

         if (!errors.isEmpty()) {
             async.parallel({
                 bookInstance: function(callback) {
                     BookInstance.findById(req.params.id)
                         .populate('book')
                         .exec(callback);
                 },
                 books: function(callback) {
                     Book.find({}, 'title')
                         .exec(callback);
                 }
             }, function(err, results) {
                 if (err) return next(err);
                 res.render('bookinstance_form', { title: 'Atualizar cópia', bookinstance: results.bookInstance, book_list: books, errors: errors.array() });
             });
         }
         else {
             BookInstance.findByIdAndUpdate(req.params.id, bi, {}, function(err, thebi) {
                 if (err) return next(err);
                 res.redirect(thebi.url);
             });
         }
    }
]
