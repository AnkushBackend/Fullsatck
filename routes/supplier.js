const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const mongoose = require("mongoose");
const verifyToken = require("../middlewares/verifyToken");


// Create Supplier
// Create Supplier (Single or Bulk)
router.post("/", async(req, res) => {
    try {
        const {
            names,
            phones,
            name,
            phone,
            shipTo,
            billTo,
            status
        } = req.body;

        const supplier = new Supplier({
            names,
            phones,
            name,
            phone,
            shipTo,
            billTo,
            status
        });

        await supplier.save();

        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            supplier
        });
    } catch (error) {
        console.error("Error creating supplier:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating supplier"
        });
    }
});
// Get All Suppliers
router.get("/all", async(req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.status(200).json({
            message: "Suppliers fetched successfully",
            data: suppliers
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch suppliers" });
    }
});

// Get One Supplier by ID
router.get("/:id", async(req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid supplier ID" });
    }

    try {
        const supplier = await Supplier.findById(id);
        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        res.status(200).json({ message: "Supplier fetched", data: supplier });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch supplier" });
    }
});

// Update Supplier
router.post("/update/:id", async(req, res) => {
    const { id } = req.params;
    const { names, phones, shipTo, billTo, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid supplier ID" });
    }

    try {
        const updated = await Supplier.findByIdAndUpdate(
            id, { names, phones, shipTo, billTo, status }, { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ error: "Supplier not found" });

        res.status(200).json({ message: "Supplier updated", data: updated });
    } catch (err) {
        res.status(500).json({ error: "Failed to update supplier" });
    }
});

// Delete Supplier
router.post("/delete/:id", async(req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid supplier ID" });
    }

    try {
        const deleted = await Supplier.findByIdAndDelete(id);

        if (!deleted) return res.status(404).json({ error: "Supplier not found" });

        res.status(200).json({ message: "Supplier deleted successfully", data: deleted });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete supplier" });
    }
});

module.exports = router;