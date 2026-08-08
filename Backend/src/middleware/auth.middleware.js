const jwt = require("jwt");

function verifyToken(req, res, next){
    const token = req.cookies.token;
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