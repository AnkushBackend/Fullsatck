const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const InvoiceSetting = require("../models/InvoiceSetting");
router.get("/get", verifyToken, async(req, res) => {
    try {
        const module = req.query.module;

        if (!module) {
            return res.status(400).json({ message: "Module is required as query parameter" });
        }

        const setting = await InvoiceSetting.findOne({ module });

        if (!setting) {
            return res.status(404).json({ message: "Invoice setting not found" });
        }

        const invoiceNo = `${setting.prefix}-${setting.currentNumber}`;
        res.status(200).json({ invoiceNo });

    } catch (error) {
        console.error("Invoice fetch error:", error.message);
        res.status(500).json({ message: "Error fetching invoice", error });
    }
});

// Create or update invoice setting
router.post("/set", verifyToken, async(req, res) => {
    const { module, prefix, startFrom } = req.body;

    if (!module || !prefix || !startFrom) {
        return res.status(400).json({ message: "module, prefix and startFrom are required" });
    }

    const startFromNum = parseInt(startFrom);
    if (isNaN(startFromNum)) {
        return res.status(400).json({ message: "startFrom must be a number" });
    }

    try {
        let setting = await InvoiceSetting.findOne({ module });

        if (setting) {
            // update
            setting.prefix = prefix;
            setting.currentNumber = startFromNum;
            await setting.save();
        } else {
            // create
            setting = new InvoiceSetting({ module, prefix, currentNumber: startFromNum });
            await setting.save();
        }

        res.status(200).json({ message: "Invoice number set", data: setting });
    } catch (error) {
        res.status(500).json({ message: "Error setting invoice", error });
    }
});

// Get all settings
router.get("/", verifyToken, async(req, res) => {
    try {
        const allSettings = await InvoiceSetting.find();
        res.status(200).json({ data: allSettings });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all invoice settings", error });
    }
});

module.exports = router;