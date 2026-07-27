const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const registerUser = async(req, res) => {
    try {
        const {username, password, role} = req.body;
        if(!username || !password || !role){
            return res.status(400).json({
                success:false,
                "message": "Fill all the Fields."
            });
        }
        const userExists = await pool.query(
            `SELECT user_id
            FROM users
            WHERE username=$1`,[username]
        );
        if(userExists.rows.length>0){
            return res.status(409).json({
                "message": "Username already exists"
            });
        }
        const result = await pool.query(
            `INSERT INTO users(
                username,
                password_hash,
                role,
                student_id,
                counselor_id
            )
            VALUES(
                $1,
                crypt($2, gen_salt('bf')),
                $3, $4, $5
            )`,[username, 
                password, 
                role, 
                student_id || null, 
                counselor_id || null
            ]
        );

        return res.status(201).json({
            success: true,
            "message": "Registration Successfully",
            user: result.row[0]
        });
    } catch (error) {
        console.error("Register error name:", error.name);   // ← log these
        console.error("Register error message:", error.message);
        console.error("Register error stack:", error.stack);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const loginUser = async(req, res) => {
    const {username, password} = req.body

    const result = await pool.query(
        `SELECT
            user_id,
            username,
            role,
            student_id,
            counselor_id
        FROM users
        WHERE
            username = $1 AND password_hash = crypt($2, password_hash)
        `,[username, password]
    );

    if(result.row.length === 0){
        return res.status(401).json({
            success:false,
            "message": "Invalid Username/Password"
        });
    }

    const user = result.row[0];
    const token = jwt.sign({
        id: user.user_id,
        role: user.role
    }, process.env.JWT_SECRET,{
        expiresIn: "1d"
    });
    return res.status(200).json({
        success:true,
        message: "Login Successful",
        user: user,
        token: token
    });
}

async function getUser(req, res) {
    try{
        const token = req.headers.authorization?.split(" ")[1];
            if(!token){
                return res.status(401).json({
                    "message": "No Token Present"
                });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const result = await pool.query(
            `SELECT *
            FROM users
            WHERE user_id = $1
            `, [decoded.id]
            );
            if(result.rows.length === 0){
                return res.status(404).json({
                    success:false,
                    "message": "User Not Found"
                });
            }
            return res.status(200).json({
                success: true,
                user: result.rows[0]
            })
        }
        catch(err) {
            return res.status(401).json({
                "message": "Invalid Token"
            })
        }
}

const logoutUser = async(req, res) => {
    return res.status(200).json({
            success:true,
            "message": "Logout Success !!"
        })
}

module.exports={ registerUser, loginUser, getUser, logoutUser };