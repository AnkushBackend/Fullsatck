const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Employee = require("../models/User");
const Performa = require("../models/Performa");
const Quotation = require("../models/Quotation");
const PurchaseOrder = require("../models/Purchase");
const Task = require("../models/Task");
const verifyToken = require("../middlewares/verifyToken");

//Dashboard Tiles Stats
router.get("/stats", async(req, res) => {
    try {
        const [
            productCount,
            customerCount,
            supplierCount,
            employeeCount,
            piCount,
            quotationCount,
            poCount
        ] = await Promise.all([
            Product.countDocuments(),
            Customer.countDocuments(),
            Supplier.countDocuments(),
            Employee.countDocuments(),
            Performa.countDocuments(),
            Quotation.countDocuments(),
            PurchaseOrder.countDocuments()
        ]);

        res.json({
            productCount,
            customerCount,
            supplierCount,
            employeeCount,
            piCount,
            quotationCount,
            poCount
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching dashboard stats", err });
    }
});

// Recent 5 Tasks 
router.get("/mytasks", verifyToken, async(req, res) => {
    try {
        const tasks = await Task.find({ employeeId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tasks", err });
    }
});
//suppliers
router.get("/top-suppliers", async(req, res) => {
    try {
        const data = await PurchaseOrder.aggregate([{
                $group: {
                    _id: "$supplierId",
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $sort: { totalOrders: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "suppliers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "supplierInfo"
                }
            },
            {
                $unwind: "$supplierInfo"
            },
            {
                $project: {
                    _id: 0,
                    supplierId: "$_id",
                    totalOrders: 1,
                    supplierName: {
                        $ifNull: [
                            "$supplierInfo.name",
                            { $arrayElemAt: ["$supplierInfo.names", 0] }

                        ]
                    }
                }
            }
        ]);

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching top suppliers", err });
    }
});


//customer

router.get("/top-customers", async(req, res) => {
    try {
        const data = await Quotation.aggregate([{
                $group: {
                    _id: "$customerId",
                    totalQuotations: { $sum: 1 }
                }
            },
            {
                $sort: { totalQuotations: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "customerInfo"
                }
            },
            {
                $unwind: "$customerInfo"
            },
            {
                $project: {
                    _id: 0,
                    customerId: "$_id",
                    customerName: {
                        $ifNull: [
                            "$customerInfo.name",
                            { $arrayElemAt: ["$customerInfo.names", 0] }
                        ]
                    },
                    totalQuotations: 1
                }
            }
        ]);

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching top customers", err });
    }
});

module.exports = router;