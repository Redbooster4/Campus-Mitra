const express = require("express");
const morgan = require("morgan");
const authRoute = require("./routes/auth.routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const app = express();
const allowedOrigins = [
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:3001",
]
const corsOptions = {
    origin: allowedOrigins, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(hemlet());

app.use("/api/auth", authRoute)

module.exports = app;