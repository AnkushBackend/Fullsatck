require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const cors = require("cors");

const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://frontend-55ki.onrender.com");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});


app.use(cors({
    origin: "https://frontend-55ki.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/uploads/images", express.static(path.join(__dirname, "uploads/images")));


//  Static files
app.use("/images", express.static(path.join(__dirname, "uploads/images")));
app.use("/pdfs", express.static(path.join(__dirname, "uploads/pdfs")));

//  MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected");

    })
    .catch((err) => {
        console.error("DB Connection Error:", err.message);
    });

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/customers", require("./routes/customer"));
app.use("/products", require("./routes/product"));
app.use("/image", require("./routes/image"));
app.use("/performa", require("./routes/performa"));
app.use("/quotation", require("./routes/quotation"));
app.use("/purchase", require("./routes/purchase"));
app.use("/task", require("./routes/task"));
app.use("/api/invoicesetting", require("./routes/invoiceSetting"));

const supplierRoutes = require("./routes/supplier");
app.use("/supplier", supplierRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/dashboard", dashboardRoutes);



app.get("/", (req, res) => {
    res.send("Hello siddharth iam here");
});

// Start server
const PORT = 2000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});