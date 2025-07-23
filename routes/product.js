const path = require("path");
const fs = require("fs");
require("dotenv").config();
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const Product = require('../models/product');
const verifyToken = require('../middlewares/verifyToken');
const mongoose = require('mongoose');

//  Create Product
router.post('/create', verifyToken, upload.single('image'), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required.' });
        }

        const { description, hsn_uom, uom, rate } = req.body;
        if (!description || !hsn_uom || !uom || !rate) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const product = new Product({
            imagePath: req.file.path,
            description,
            hsn_uom,
            uom,
            rate
        });

        await product.save();
        res.status(201).json({ message: 'Product created successfully.', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Get All Products
router.get('/getAll', verifyToken, async(req, res) => {
    try {
        const all = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({ data: all });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


//  Get Single Product
router.get('/getProductById/:id', verifyToken, async(req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Product ID format.' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

//  Delete Product
router.post('/delete/:id', verifyToken, async(req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Product ID format.' });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product deleted successfully.', deletedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Only Image Update
router.post('/replaceImage/:id', verifyToken, upload.single('image'), async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Product ID format.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required.' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id, { imagePath: req.file.path }, { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json({ message: 'Image updated successfully.', updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Only Data Update
router.post('/update/:id/', verifyToken, async(req, res) => {
    try {
        const { id } = req.params;
        const { description, hsn_uom, uom, rate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Product ID format.' });
        }

        const updateFields = {};
        if (description) updateFields.description = description;
        if (hsn_uom) updateFields.hsn_uom = hsn_uom;
        if (uom) updateFields.uom = uom;
        if (rate) updateFields.rate = rate;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'No fields provided for update.' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product data updated successfully.', updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Optional: Detect content type
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        default:
            return 'application/octet-stream';
    }
}
//  Get Image Path
router.get('/getImage/:id', verifyToken, async(req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID format.' });
    }

    try {
        const product = await Product.findById(id);

        if (!product || !product.imagePath) {
            return res.status(404).json({ error: 'Product or image not found.' });
        }

        const imagePath = path.resolve(product.imagePath); // Resolve full path

        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image file not found on server.' });
        }

        const mimeType = getMimeType(imagePath); // Optional: detect content type
        res.setHeader('Content-Type', mimeType);

        const imageBuffer = fs.readFileSync(imagePath);
        res.status(200).send(imageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/deleteImage/:id', verifyToken, async(req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID format.' });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        if (product.imagePath) {
            const imagePath = path.resolve(__dirname, '..', product.imagePath);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

            product.imagePath = null;
            await product.save();
        }

        res.status(200).json({
            message: 'Only image deleted successfully.',
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete image.' });
    }
});

module.exports = router;