const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    voucherNo: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    dispatchedThrough: {
        type: String,
        required: true
    },
    modeOfPayment: {
        type: String,
        required: true
    },
    salesPerson: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    termsOfDelivery: {
        type: String,
        required: true
    },
    pdfPath: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);