const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base directories
const imageUploadDir = path.join(__dirname, "..", "uploads", "images");
const pdfBaseDir = path.join(__dirname, "..", "uploads", "pdfs");

// Ensure base folders exist
if (!fs.existsSync(imageUploadDir)) fs.mkdirSync(imageUploadDir, { recursive: true });
if (!fs.existsSync(pdfBaseDir)) fs.mkdirSync(pdfBaseDir, { recursive: true });

// Multer Storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            return cb(null, imageUploadDir);
        }

        if (file.mimetype === "application/pdf") {
            let moduleName = "others";
            const urlPath = req.originalUrl.toLowerCase();

            if (urlPath.includes("performa")) moduleName = "performa";
            else if (urlPath.includes("quotation")) moduleName = "quotation";
            else if (urlPath.includes("purchase")) moduleName = "purchase";

            const moduleDir = path.join(pdfBaseDir, moduleName);
            if (!fs.existsSync(moduleDir)) fs.mkdirSync(moduleDir, { recursive: true });

            return cb(null, moduleDir);
        }

        cb(new Error("Only image and PDF files are allowed."), false);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only image and PDF files are allowed."), false);
    }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;