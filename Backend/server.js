const express = require("express");
const pool = require("./src/config/db.js");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes.js");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("CampusMitra Backend API is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});