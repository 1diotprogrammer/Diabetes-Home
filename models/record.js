const mongoose = require('mongoose')
const recordSchema = new mongoose.Schema({
    dataId: { type: mongoose.Schema.Types.ObjectId, ref: 'Data' },
})
const Record = mongoose.model('Record', recordSchema)
module.exports = Record
