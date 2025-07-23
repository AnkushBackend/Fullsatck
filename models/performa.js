const mongoose = require("mongoose");

const performaSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    productIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }],

    invoiceNo: { type: String, required: true },
    date: { type: Date, required: true },

    modeOrTermsOfPayment: { type: String, required: true },
    salesPerson: { type: String, required: true },
    dispatchedThrough: { type: String, required: true },
    destination: { type: String, required: true },
    termsOfDelivery: { type: String, required: true },

    taxType: { type: String, required: true },
    freightAndCartageAmount: { type: Number, required: true },

    pdfFile: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Performa || mongoose.model("Performa", performaSchema);