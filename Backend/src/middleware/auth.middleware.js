const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    const authHeadher = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access Denied"
        });
    }
    const token = authHeadher.split(" ")[1];
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(401).json({
            success:false,
            "message":"Invalid Token"
        });
    }
}
module.exports = verifyToken;