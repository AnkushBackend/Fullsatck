const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    names: [String], // optional array of names
    phones: [String], // optional array of phones
    name: String, // optional single name
    phone: String, // optional single phone
    shipTo: String,
    billTo: String,
    status: {
        type: String,
        enum: [
            "New lead",
            "Not Started",
            "Interested",
            "Checklist Shared",
            "Ringing",
            "Switched Off",
            "Call Back",
            "Not Interested"
        ],
        default: "New lead"
    }
}, { timestamps: true });

module.exports = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);