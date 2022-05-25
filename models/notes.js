const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    date: Date,
    note: String,
})
const Note = mongoose.model('Note', schema)
module.exports = Note