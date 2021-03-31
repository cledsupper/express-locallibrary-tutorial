var Genre = require('../models/genre');
var Book = require('../models/book');

var async = require('async');
const { body, validationResult } = require('express-validator')

// Mostrar lista de todos os Genre's.
exports.genre_list = function(req, res, next) {

    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function(err, list_genres) {
            if (err) { return next(err); }
            res.render('genre_list', { title: 'Lista de gêneros', genre_list: list_genres });
        });
};

// Mostrar página de detalhe de um Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
                .exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        if (results.genre == null) {
            var err = new Error("Gênero não existe");
            err.status = 404;
            return next(err);
        }

        res.render('genre_detail', { title: results.genre.name, genre: results.genre, genre_books: results.genre_books });
    });

};

// Mostrar formulário de criação de Genre via GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', { title: 'Adicionar gênero' });
};

// Realiza a criação de Genre via POST.
exports.genre_create_post = [
    // Valida e sanitiza o parâmetro 'name'
    body('name', 'Nome do gênero necessário').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        // Extrai os erros de validação da requisição
        const errors = validationResult(req);

        var genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            // Há erro. Renderiza o formulário novamente com a mensagen de erro e o parâmetro sanitizado
            res.render('genre_form', { title: 'Adicionar gênero', genre: genre, errors: errors.array() });
            return;
        }
        else {
            // Formulário válido.
            // Verifica se um gênero com o mesmo nome já existe.
            Genre.findOne({ 'name': req.body.name })
                .exec(function(err, found_genre) {
                    if (err) return next(err);

                    if (found_genre) {
                        // O gênero já existe, então redireciona para a página de detalhes deste
                        res.redirect(found_genre.url);
                    }
                    else {
                        genre.save(function (err) {
                            if (err) return next(err);
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// Mostrar formulário de remoção de Genre via GET.
exports.genre_delete_get = function(req, res, next) {
    
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id, callback)
        },
        books: function(callback) {
            Book.find({ 'genre': req.params.id }, callback)
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.genre == null) {
            res.redirect('/catalog/genres');
        }
        res.render('genre_delete', { title: 'Excluir gênero', genre: results.genre, books: results.books });
    });
};

// Realizar deleção de Genre via POST.
exports.genre_delete_post = function(req, res) {
    
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.body.genreid, callback)
        },
        books: function(callback) {
            Book.find({ 'genre': req.body.genreid }, callback)
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.books.length > 0) {
            res.render('genre_delete', { title: 'Excluir gênero', genre: results.genre, books: results.books });
        }
        else {
            Genre.findByIdAndRemove(req.body.genreid, function(err) {
                if (err) return next(err);
                res.redirect('/catalog/genres');
            });
        }
    });
};

// Mostrar atualização de Genre via GET.
exports.genre_update_get = function(req, res) {
    res.send('NÃO IMPLEMENTADO: Genre update GET');
};

// Realizar atualização de Genre via POST.
exports.genre_update_post = function(req, res) {
    res.send('NÃO IMPLEMENTADO: Genre update POST');
};
