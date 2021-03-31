var mongoose = require('mongoose')
const { DateTime } = require('luxon')

var Schema = mongoose.Schema

var BookInstanceSchema = new Schema(
    {
        book: {type: Schema.ObjectId, ref: 'Book', required: true},
        imprint: {type: String, required: true},
        status: {type: String, required: true, enum: ['Disponível', 'Em manutenção', 'Emprestado', 'Reservado',], default: 'Em manutenção'},
        due_back: {type: Date, default: Date.now}
    }
)

// Atributo virtual para URL
BookInstanceSchema
.virtual('url')
.get(function() {
    return '/catalog/bookinstance/' + this._id
})

// Atributo virtual para formatar a data exibida
BookInstanceSchema
.virtual('due_back_formatted')
.get(function() {
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATETIME_MED)
})

BookInstanceSchema
.virtual('due_back_yyyy_mm_dd')
.get(function() {
    return DateTime.fromJSDate(this.due_back).toISODate()
})

module.exports = mongoose.model('BookInstance', BookInstanceSchema)
