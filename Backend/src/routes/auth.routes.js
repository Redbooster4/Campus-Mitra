const express = require("express")
const router = express.Router()
const { registerUser, loginUser, getUser, logoutUser } = require("../controllers/auth.controller");
const verifyToken = require("../middleware/auth.middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, getUser);
router.post("/logout", verifyToken, logoutUser);

module.exports = router;