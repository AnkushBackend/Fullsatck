const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    names: [String], // array of names (optional)
    phones: [String], // array of phones (optional)
    name: String, // single name (optional)
    phone: String, // single phone (optional)
    shipTo: String,
    billTo: String,
    status: { type: String, default: 'New lead' }
});


module.exports = mongoose.model("Customer", customerSchema);