// É preferível utilizar o(s) handler de teste em indexController!

var mongoose = require('mongoose')
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

var Book = require('./models/book')

// Conexão com o MongoDB Atlas
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
Book.countDocuments({}, function (err, count) {
    console.log('Número de documentos: ' + count)
})
