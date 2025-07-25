const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/upload");
const Quotation = require("../models/Quotation");
const InvoiceSetting = require("../models/InvoiceSetting");

// Fields required while creating quotation (not for PDF upload)
const requiredFields = ["customerId", "productDescription"];

const validateFields = (body, fields) => {
    const missing = fields.filter(field => !body[field]);
    return missing.length ? `Missing fields: ${missing.join(", ")}` : null;
};

// Set invoice number prefix and starting number
router.post("/invoice-number", verifyToken, async(req, res) => {
    const { prefix, startFrom } = req.body;
    if (!prefix || !startFrom) {
        return res.status(400).json({ message: "prefix and startFrom are required" });
    }

    try {
        let setting = await InvoiceSetting.findOne({ module: "quotation" });
        if (setting) {
            setting.prefix = prefix;
            setting.currentNumber = startFrom;
        } else {
            setting = new InvoiceSetting({
                module: "quotation",
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
// Get current invoice number
router.get("/invoice-number", verifyToken, async(req, res) => {
    try {
        const setting = await InvoiceSetting.findOne({ module: "quotation" });
        if (!setting) return res.status(404).json({ message: "Invoice setting not found" });

        const invoiceNo = `${setting.prefix}-${setting.currentNumber}`;
        res.status(200).json({ invoiceNo });
    } catch (error) {
        res.status(500).json({ message: "Error fetching invoice number", error });
    }
});
// Increment invoice number
router.post("/invoiceincrement", verifyToken, async(req, res) => {
    try {
        const setting = await InvoiceSetting.findOne({ module: "quotation" });
        if (!setting) return res.status(404).json({ message: "Invoice setting not found" });

        setting.currentNumber += 1;
        await setting.save();

        res.status(200).json({
            message: "Invoice number incremented",
            currentNumber: setting.currentNumber
        });
    } catch (error) {
        res.status(500).json({ message: "Error incrementing invoice number", error });
    }
});

// Create quotation 
router.post("/create", verifyToken, upload.single("pdfFile"), async(req, res) => {
    const requiredFields = [
        "customerId",
        "productId",
        "kindAttentionName",
        "kindAttentionEmail",
        "subject",
        "openDate",
        "printDate",
        "dispatchedThrough",
        "modeOfPayment",
        "deliveryNoteDate",
        "destination",
        "salesPerson",
        "termsOfDelivery",
        "greetingNote"
    ];

    const missingMsg = validateFields(req.body, requiredFields);
    if (missingMsg) return res.status(400).json({ message: missingMsg });

    try {
        const setting = await InvoiceSetting.findOne({ module: "quotation" });
        if (!setting) {
            return res.status(400).json({ message: "Quotation invoice setting not found" });
        }

        const invoiceNo = `${setting.prefix}-${setting.currentNumber}`;

        const data = {
            ...req.body,
            invoiceNo,
            pdfFile: req.file ? req.file.filename : null,
        };

        const quotation = new Quotation(data);
        await quotation.save();

        res.status(201).json({ message: "Quotation created with PDF", data: quotation });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.invoiceNo) {
            return res.status(409).json({ message: "Duplicate invoice number. Please increment and try again." });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// Upload PDF 
router.post("/upload/:id", verifyToken, upload.single("pdfFile"), async(req, res) => {
    try {
        console.log(" Uploaded file:", req.file);
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const updated = await Quotation.findByIdAndUpdate(
            req.params.id, { pdfFile: req.file.filename }, { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Quotation not found" });

        res.json({ message: "PDF uploaded successfully", data: updated });
    } catch (error) {
        console.error(" Upload Error:", error);
        res.status(500).json({ message: "Error uploading PDF", error });
    }
});
// Get all quotations
router.get("/getAll", verifyToken, async(req, res) => {
    try {
        const quotations = await Quotation.find()
            .populate("customerId")
            .populate("productId");

        res.status(200).json({
            message: "Quotations fetched successfully",
            data: quotations
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching quotations", error });
    }
});
// Get single quotation
router.get("getID/:id", verifyToken, async(req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id).populate("customerId");
        if (!quotation) return res.status(404).json({ message: "Quotation not found" });
        res.json({ data: quotation });
    } catch (error) {
        res.status(500).json({ message: "Error fetching quotation", error });
    }
});
// Update quotation (with optional new PDF)
router.post("/:id", verifyToken, upload.single("pdfFile"), async(req, res) => {
    try {
        const updateData = {...req.body };
        if (req.file) {
            updateData.pdfFile = req.file.filename;
        }

        const updated = await Quotation.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: "Quotation not found" });

        res.json({ message: "Quotation updated", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Error updating quotation", error });
    }
});


module.exports = router;