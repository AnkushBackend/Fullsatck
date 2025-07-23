const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
    invoiceNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    kindAttentionName: {
        type: String,
        trim: true,
    },
    kindAttentionEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    subject: {
        type: String,
        trim: true,
    },
    openDate: {
        type: Date,
    },
    printDate: {
        type: Date,
    },
    dispatchedThrough: {
        type: String,
        trim: true,
    },
    modeOfPayment: {
        type: String,
        trim: true,
    },
    deliveryNoteDate: {
        type: Date,
    },
    destination: {
        type: String,
        trim: true,
    },
    salesPerson: {
        type: String,
        trim: true,
    },
    termsOfDelivery: {
        type: String,
        trim: true,
    },
    greetingNote: {
        type: String,
        trim: true,
    },
    pdfFile: {
        type: String,
        default: null,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Quotation", quotationSchema);