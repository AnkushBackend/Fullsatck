const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const imageFolderPath = path.join(__dirname, "..", "uploads", "images");

//  Create folder 
if (!fs.existsSync(imageFolderPath)) {
    fs.mkdirSync(imageFolderPath, { recursive: true });
}

//  Multer Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, imageFolderPath),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

//   Upload Image
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Please upload a file using field name 'image'" });
    }

    res.status(200).json({
        message: "Image uploaded successfully",
        filename: req.file.filename,
        url: `/uploads/images/${req.file.filename}`
    });
});

// List All Images
router.get("/all", (req, res) => {
    fs.readdir(imageFolderPath, (err, files) => {
        if (err) {
            console.error("Error reading image folder:", err);
            return res.status(500).json({ error: "Failed to fetch images" });
        }

        const images = files.map((file) => ({
            filename: file,
            url: `${req.protocol}://${req.get("host")}/uploads/images/${file}`
        }));

        res.status(200).json(images);
    });
});
// Delete Image
router.delete("/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(imageFolderPath, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Image not found." });
    }

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
            return res.status(500).json({ error: "Failed to delete image." });
        }

        res.status(200).json({ message: "Image deleted successfully." });
    });
});
module.exports = router;