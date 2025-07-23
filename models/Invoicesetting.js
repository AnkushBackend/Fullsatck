const mongoose = require('mongoose');

const invoiceSettingSchema = new mongoose.Schema({
    module: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    currentNumber: { type: Number, required: true }
});

module.exports = mongoose.model('InvoiceSetting', invoiceSettingSchema);