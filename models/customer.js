const mongoose = require('mongoose')
const customerSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
})
const Customer = mongoose.model('Customer', customerSchema)
module.exports = Customer
