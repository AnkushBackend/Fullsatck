const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "my_secret_key");


        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};