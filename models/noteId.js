const mongoose = require('mongoose')
const noteIdSchema = new mongoose.Schema({
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
})
const NoteId = mongoose.model('NoteId', noteIdSchema)
module.exports = NoteId