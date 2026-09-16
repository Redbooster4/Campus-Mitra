const jwt = require("jsonwebtoken");

function verifyToken(req, res, next){
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            error:"Not Authenticated"
        });
    }
    try{
        req.user=jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch{
        res.status(403).json({error:"Invalid Token"});
    }
}
function requireAdmin(req, res, next){
    if(!req.user || req.user.role !== "Admin"){
        return res.status(403).json({error: "Admin Access Required"});
    }
    next();
}
module.exports={verifyToken, requireAdmin};