const express = require("express");
const pool = require("./src/config/db.js");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes.js");
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("CampusMitra Backend API is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});