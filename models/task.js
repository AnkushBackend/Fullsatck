const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    alertDate: {
        type: Date,
        required: true,
    },
    alertTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
    },

    note: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Task", taskSchema);