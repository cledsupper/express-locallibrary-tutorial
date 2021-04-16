var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');

var compression = require('compression')
var helmet = require('helmet')

var app = express();

// Conexão com o MongoDB Server
var mongoose = require('mongoose');
var MONGODB_URI = null
try {
    // Adicione config/mongo.js ao arquivo .gitignore
    MONGODB_URI = require('./config/mongoprivate')
} catch (err) {
    // $ env MONGODB_URI="mongodb+srv://user:password@clusterX.blabla.mongodb.net/local_library?retryWrites=true&w=majori>
    MONGODB_URI = process.env.MONGODB_URI
}
if (!MONGODB_URI) {
    var err = new Error('String de conexão não definida')
    err.status=1
    throw err
}

mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// Verificar erro de conexão
mongoose.connection
.on('error', console.error.bind(console, 'Erro de conexão MongoDB:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(helmet());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
