const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    imagePath: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    hsn_uom: {
        type: String,
        required: true,
        trim: true
    },
    uom: {
        type: String,
        required: true,
        trim: true
    },
    rate: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);