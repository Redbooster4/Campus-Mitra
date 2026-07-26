const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/login", async (req, res) => {
    const {username, password} = req.body;
    try{
        const result = await pool.query(   
        `   SELECT *
            FROM users
            WHERE username = $1 AND password_hash = crypt($2, password_hash)
        `,[username, password]);
        if(result.rows.length === 0){
            return res.status(401).json({
                success:false,
                message:"Invalid Credentials"
            });
        }
        res.json({
            success:true,
            user:result.rows[0]
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Server Error"
        });
    }
});

module.exports = router;