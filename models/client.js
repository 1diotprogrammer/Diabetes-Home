const mongoose = require('mongoose')
const Customer = require('./customer')

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalCustomer: { type: Number, default: 0 },
    customerRecord: [Customer.schema],
    role: String,
})

const Client = mongoose.model('Client', schema)
module.exports = Client
