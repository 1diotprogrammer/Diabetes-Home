const mongoose = require('mongoose')
const NoteId = require('./noteId')
const Record = require('./record')

const schema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bgl_requested: { type: Boolean, default: false },
    bgl_max: Number,
    bgl_min: Number,
    weight_requested: { type: Boolean, default: false },
    weight_max: Number,
    weight_min: Number,
    dn_requested: { type: Boolean, default: false },
    dn_max: Number,
    dn_min: Number,
    exercise_requested: { type: Boolean, default: false },
    exercise_max: Number,
    exercise_min: Number,
    message: String,
    data_record: [Record.schema],
    role: String,
    notes_record: [NoteId.schema],
    registerDate: Date,
    percentage: Number,
    date_of_birth: Date,
    screenName: String,
    brief:String,
    darkmod:{ type: Boolean, default: false },
})

const Patient = mongoose.model('Patient', schema)
module.exports = Patient
