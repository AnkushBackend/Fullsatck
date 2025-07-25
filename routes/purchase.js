const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");
const Purchase = require("../models/Purchase");
const InvoiceSetting = require("../models/InvoiceSetting");
const mongoose = require("mongoose");

const validateFields = (body, fields) => {
    const missing = fields.filter((field) => !body[field]);
    return missing.length ? `Missing fields: ${missing.join(", ")}` : null;
};

// API 1: Set Purchase Invoice Number
router.post("/invoice-number", verifyToken, async(req, res) => {
    const { prefix, startFrom } = req.body;

    if (!prefix || !startFrom) {
        return res.status(400).json({ message: "prefix and startFrom are required" });
    }

    try {
        let setting = await InvoiceSetting.findOne({ module: "purchase" });

        if (setting) {
            setting.prefix = prefix;
            setting.currentNumber = startFrom;
        } else {
            setting = new InvoiceSetting({ module: "purchase", prefix, currentNumber: startFrom });
        }

        await setting.save();
        res.status(200).json({ message: "Invoice number set successfully", data: setting });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error setting invoice number", error });
    }
});

// API 2: Get Current Purchase Invoice Number
router.get("/invoice-number", verifyToken, async(req, res) => {
    try {
        const setting = await InvoiceSetting.findOne({ module: "purchase" });

        if (!setting) {
            return res.status(404).json({ message: "Invoice setting not found" });
        }

        const invoiceNo = `${setting.prefix}-${setting.currentNumber}`;
        res.status(200).json({ invoiceNo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching invoice number", error });
    }
});

// API 3: Increment Purchase Invoice Number
router.post("/invoice-increment", verifyToken, async(req, res) => {
    try {
        const setting = await InvoiceSetting.findOne({ module: "purchase" });

        if (!setting) {
            return res.status(404).json({ message: "Invoice setting not found" });
        }

        setting.currentNumber += 1;
        await setting.save();

        res.status(200).json({
            message: "Invoice number incremented",
            currentNumber: setting.currentNumber
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error incrementing invoice number", error });
    }
});

// API 4: Create Purchase
router.post("/create", verifyToken, upload.single("pdfFile"), async(req, res) => {
    const requiredFields = [
        "supplierId", "productId", "date", "dispatchedThrough",
        "modeOfPayment", "salesPerson", "destination",
        "termsOfDelivery", "voucherNo"
    ];

    const missingFields = validateFields(req.body, requiredFields);
    if (missingFields) {
        return res.status(400).json({ message: missingFields });
    }

    try {
        const setting = await InvoiceSetting.findOne({ module: "purchase" });
        if (!setting) {
            return res.status(400).json({ message: "Purchase invoice setting not found" });
        }

        const invoiceNo = `${setting.prefix}-${setting.currentNumber}`;

        const data = {
            ...req.body,
            invoiceNo,
            pdfFile: req.file ? req.file.filename : null,
        };

        const newPurchase = new Purchase(data);
        await newPurchase.save();

        setting.currentNumber += 1;
        await setting.save();

        res.status(201).json({ message: "Purchase created", data: newPurchase });
    } catch (error) {
        console.error("Error creating purchase:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Upload PDF
router.post("/:id/upload-pdf", verifyToken, upload.single("pdfFile"), async(req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid purchase ID" });
    }

    try {
        const updated = await Purchase.findByIdAndUpdate(
            id, { pdfFile: req.file ? req.file.filename : null }, { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        res.json({ message: "PDF uploaded", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error uploading PDF", error });
    }
});

// API 6: Get All Purchases
router.get("/getAll", verifyToken, async(req, res) => {
    try {
        const purchases = await Purchase.find().populate("supplierId productId");
        res.json({ data: purchases });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching purchases", error });
    }
});

// API 7: Get Single Purchase
router.get("getID/:id", verifyToken, async(req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid purchase ID" });
    }

    try {
        const purchase = await Purchase.findById(id).populate("supplierId productId");
        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }
        res.json({ data: purchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching purchase", error });
    }
});

// API 8: Update Purchase
router.post("/:id", verifyToken, upload.single("pdfFile"), async(req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid purchase ID" });
    }

    try {
        const data = {
            ...req.body,
            ...(req.file && { pdfFile: req.file.filename })
        };

        const updated = await Purchase.findByIdAndUpdate(id, data, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Purchase not found" });
        }
        res.json({ message: "Purchase updated", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating purchase", error });
    }
});

// API 9: Delete Purchase
router.post("/:id/delete", verifyToken, async(req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid purchase ID" });
    }

    try {
        const deleted = await Purchase.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Purchase not found" });
        }
        res.json({ message: "Purchase deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting purchase", error });
    }
});

module.exports = router;