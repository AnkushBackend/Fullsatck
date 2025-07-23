const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    address: String,
    password: { type: String, required: true },

    role: {
        type: String,
        enum: ["user", "superAdmin"],
        default: "user"
    },

    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null
    }
});

module.exports = mongoose.model("User", userSchema);