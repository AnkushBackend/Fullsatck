const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");
const verifyToken = require("../middlewares/verifyToken");
// Add Customer
router.post("/create", async(req, res) => {
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

        const customer = new Customer({
            names,
            phones,
            name,
            phone,
            shipTo,
            billTo,
            status
        });

        await customer.save();

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customer
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating customer"
        });
    }
});
//  Get All Customers with group UUID
router.get("/getall", verifyToken, async(req, res) => {
    try {
        const customers = await Customer.find();

        if (customers.length === 0) {
            return res.status(200).json({
                message: "No customers found",
                data: [],
            });
        }


        res.status(200).json({
            message: "Customers fetched successfully",
            data: customers
        });

    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch customers",
            details: err.message
        });
    }
});


// Update Customer by ID
router.post("/update/:id", async(req, res) => {
    try {
        const customerId = req.params.id;
        const updateData = req.body;

        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            updateData, { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            customer: updatedCustomer
        });
    } catch (error) {
        console.error("Error updating customer:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating customer"
        });
    }
});


//  Get by ID
router.get("/getID/:id", verifyToken, async(req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        res.status(200).json({
            message: "Customer fetched successfully",
            data: customer
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch customer", details: err.message });
    }
});

//  Delete by ID
router.post("/delete/:id", verifyToken, async(req, res) => {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Customer not found" });

    res.status(200).json({
        message: "Customer deleted successfully",
        data: deleted,
    });
});

module.exports = router;