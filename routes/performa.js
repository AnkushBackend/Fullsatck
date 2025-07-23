const express = require("express");
const router = express.Router();
const Performa = require("../models/Performa");
const InvoiceSetting = require("../models/InvoiceSetting");
const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/verifyToken");

function validateFields(data, fields) {
    const missing = fields.filter(field => {
        return !data[field] || data[field].toString().trim() === "";
    });
    return missing.length > 0 ? `Missing fields: ${missing.join(", ")}` : null;
}


// Create Performa
router.post("/create", verifyToken, upload.single("pdfFile"), async(req, res) => {
    const requiredFields = [
        "customerId", "productIds", "date", "modeOrTermsOfPayment",
        "salesPerson", "dispatchedThrough", "destination",
        "termsOfDelivery", "taxType", "freightAndCartageAmount"
    ];

    const missingFields = validateFields(req.body, requiredFields);
    if (missingFields) {
        return res.status(400).json({ message: missingFields });
    }

    try {
        const setting = await InvoiceSetting.findOne({ module: "performa" });
        if (!setting) {
            return res.status(400).json({ message: "Performa invoice setting not found" });
        }

        // ✅ Parse productIds from JSON string (from multipart form)
        let productIds = [];
        try {
            productIds = JSON.parse(req.body.productIds);
            if (!Array.isArray(productIds)) {
                return res.status(400).json({ message: "productIds must be an array" });
            }
        } catch (err) {
            return res.status(400).json({ message: "Invalid productIds format. Must be JSON array." });
        }

        const invoiceNo = `${setting.prefix}-${setting.currentNumber}`;

        const data = {
            customerId: req.body.customerId,
            productIds: productIds, // ✅ Now properly parsed
            invoiceNo,
            date: req.body.date,
            modeOrTermsOfPayment: req.body.modeOrTermsOfPayment,
            salesPerson: req.body.salesPerson,
            dispatchedThrough: req.body.dispatchedThrough,
            destination: req.body.destination,
            termsOfDelivery: req.body.termsOfDelivery,
            taxType: req.body.taxType,
            freightAndCartageAmount: req.body.freightAndCartageAmount
        };

        // ✅ Add file path if uploaded
        if (req.file) {
            data.pdfFile = `/pdfs/${req.file.filename}`;
        }

        // ✅ Save performa
        const newPerforma = new Performa(data);
        await newPerforma.save();

        // ✅ Increment invoice number
        setting.currentNumber += 1;
        await setting.save();

        res.status(201).json({ message: "Performa created", data: newPerforma });
    } catch (error) {
        console.error("Error creating Performa:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Set invoice number
router.post("/invoice-number", verifyToken, async(req, res) => {
    const { prefix, startFrom } = req.body;

    if (!prefix || !startFrom) {
        return res.status(400).json({ message: "prefix and startFrom are required" });
    }

    try {
        let setting = await InvoiceSetting.findOne({ module: "performa" });

        if (setting) {
            setting.prefix = prefix;
            setting.currentNumber = startFrom;
        } else {
            setting = new InvoiceSetting({
                module: "performa",
                prefix,
                currentNumber: startFrom,
            });
        }

        await setting.save();
        res.status(200).json({ message: "Invoice number set successfully", data: setting });
    } catch (error) {
        res.status(500).json({ message: "Error setting invoice number", error });
    }
});

//  Get invoice number
router.get("/invoice-number", verifyToken, async(req, res) => {
    try {
        const setting = await InvoiceSetting.findOne({ module: "performa" });

        if (!setting) {
            return res.status(404).json({ message: "Invoice setting not found" });
        }

        const invoiceNo = `${setting.prefix}-${setting.currentNumber}`;
        res.status(200).json({ invoiceNo });
    } catch (error) {
        res.status(500).json({ message: "Error fetching invoice number", error });
    }
});

// Increment invoice number manually
router.post("/invoiceincrement", verifyToken, async(req, res) => {
    try {
        const setting = await InvoiceSetting.findOne({ module: "performa" });

        if (!setting) {
            return res.status(404).json({ message: "Invoice setting not found" });
        }

        setting.currentNumber += 1;
        await setting.save();

        res.status(200).json({
            message: "Invoice number incremented",
            currentNumber: setting.currentNumber,
        });
    } catch (error) {
        res.status(500).json({ message: "Error incrementing invoice number", error });
    }
});

//  Get all performas
router.get("/getAll", verifyToken, async(req, res) => {
    try {
        const performas = await Performa.find()
            .populate("customerId")
            .populate("productIds"); // ✅ Corrected

        res.status(200).json({
            message: "Performas fetched successfully",
            data: performas,
        });
    } catch (error) {
        console.error("Error fetching performas:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

//  Get single performa by ID
router.get("/getID/:id", verifyToken, async(req, res) => {
    try {
        const performa = await Performa.findById(req.params.id)
            .populate("customerId")
            .populate("productId");

        if (!performa) {
            return res.status(404).json({ message: "Performa not found" });
        }

        res.status(200).json({ data: performa });
    } catch (error) {
        res.status(500).json({ message: "Error fetching performa", error });
    }
});

//  Delete performa
router.post("/delete/:id", verifyToken, async(req, res) => {
    try {
        const deleted = await Performa.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Performa not found" });
        }
        res.status(200).json({ message: "Performa deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting performa", error });
    }
});

module.exports = router;