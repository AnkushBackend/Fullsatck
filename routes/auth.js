const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");
const checkRole = require("../middlewares/checkRole");

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key";

//  Register User or SuperAdmin
router.post("/register", async(req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: email,
            name,
            email,
            password: hashedPassword,
            role: "superAdmin"
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, role: newUser.role },
            SECRET_KEY, { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "SuperAdmin registered successfully",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ error: "Registration failed" });
    }
});


//  Login
router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "1d" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});
//  Get All Employees
router.get("/employee/all", async(req, res) => {
    try {
        const employees = await User.find({ role: "user" }).select("-password");
        res.status(200).json({
            message: "All employees fetched successfully",
            data: employees
        });
    } catch (err) {
        console.error("Error fetching employees:", err.message);
        res.status(500).json({ error: "Failed to fetch employees", details: err.message });
    }
});

// Change Password
router.post("/changepassword/:userId", async(req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        console.error("Password change error:", err.message);
        res.status(500).json({ error: "Failed to change password" });
    }
});


//  Create Employee
router.post("/employee/create", async(req, res) => {
    try {
        const { name, email, phone, address, password } = req.body;

        if (!name || !email || !phone || !address || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: email,
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            role: "user"
        });

        await newUser.save();

        res.status(201).json({
            message: "Employee created successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error("Error creating employee:", err.message);
        res.status(500).json({ error: "Failed to create employee", details: err.message });
    }
});

// ✅ Get Employee by ID
router.get("/employee/:id", async(req, res) => {
    try {
        const employee = await User.findOne({ _id: req.params.id, role: "employee" }).select("-password");
        if (!employee) return res.status(404).json({ error: "Employee not found" });

        res.status(200).json({ message: "Employee fetched", data: employee });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employee", details: err.message });
    }
});

// ✅ Update Employee
router.post("/employee/update/:id", async(req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        const updated = await User.findOneAndUpdate({ _id: req.params.id, role: "user" }, // ✅ FIXED
            { name, email, phone, address }, { new: true }
        ).select("-password");

        if (!updated) return res.status(404).json({ error: "Employee not found" });

        res.status(200).json({ message: "Employee updated successfully", data: updated });
    } catch (err) {
        res.status(500).json({ error: "Failed to update employee", details: err.message });
    }
});

router.post("/employee/delete/:id", async(req, res) => {
    try {
        const deleted = await User.findOneAndDelete({ _id: req.params.id, role: "user" }); // ✅ FIXED role

        if (!deleted) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee deleted successfully",
            data: deleted
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete employee", details: err.message });
    }
});

// ✅ Admin Only
router.get("/admin-data", verifyToken, checkRole("superAdmin"), (req, res) => {
    res.json({ message: "Welcome, Super Admin!" });
});

// ✅ Authenticated User
router.get("/user-data", verifyToken, (req, res) => {
    res.json({ message: `Welcome, ${req.user.role}` });
});

module.exports = router;