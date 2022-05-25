const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    date: Date,
    bgl: Number,
    bgl_comment: String,
    weight: Number,
    weight_comment: String,
    dn: Number,
    dn_comment: String,
    exercise: Number,
    exercise_comment: String,
})
const Data = mongoose.model('Data', schema)
module.exports = Data
