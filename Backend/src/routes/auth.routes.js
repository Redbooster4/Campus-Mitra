const express = require("express")
const router = express.Router()
const { registerUser, loginUser, getUser, logoutUser } = require("../controllers/auth.controller");
const verifyToken = require("../middleware/auth.middleware");
const rateLimit=require("express-rate-limit");

const loginLimit= rateLimit({windowMs:15*60*1000, max:5});

router.post("/register", registerUser);
router.post("/login", loginLimit, loginUser);
router.get("/me", verifyToken, getUser);
router.post("/logout", verifyToken, logoutUser);

module.exports = router;