const express = require("express");
const router = express.Router();
const { chatWithMitra } = require("../controllers/chat.controller");
const jwt = require("jsonwebtoken");

// Optional auth: parse user if token is present, but don't reject guests
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch {
            // guest / ignored token error
        }
    }
    next();
};

router.post("/", optionalAuth, chatWithMitra);

module.exports = router;
