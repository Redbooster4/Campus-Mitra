const express=require("express");
const pool=require("./src/config/db.js");
require("dotenv").config();

const app=express();
app.use(express.json());

app.listen(process.env.PORT, () => {
    console.log("Server Running")
})


//npm install express pg dotenv cors jsonwebtoken multer uuid morgan helmet express-rate-limit