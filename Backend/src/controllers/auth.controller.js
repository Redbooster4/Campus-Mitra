const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { username, password, role, student_id, counselor_id } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Fill all required fields (username, password, role)."
            });
        }
        const result = await pool.query(
            `INSERT INTO users_auth (
                username,
                password_hash,
                role,
                student_id,
                counselor_id
            )
            VALUES (
                $1,
                crypt($2, gen_salt('bf')),
                $3, $4, $5
            )
            RETURNING user_id, username, role, student_id, counselor_id`,
            [
                username.trim(),
                password,
                role,
                student_id || null,
                counselor_id || null
            ]
        );
        console.log(result);
        const user = result.rows[0];
        const token=jwt.sign(
            {
                user_id: user.user_id,
                role: user.role,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        console.log("User Registered:", user);
        return res.status(201).json({
            success: true,
            message: "Registration Successful",
            token,
            user
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        // Fixed table name: users -> users_auth
        const result = await pool.query(
            `SELECT
                user_id,
                username,
                role,
                student_id,
                counselor_id
            FROM users_auth
            WHERE username = $1 AND password_hash = crypt($2, password_hash)`,
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });
        }
        const user = result.rows[0];
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                role: user.role,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        console.log("User Logged: ", user);
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No Token Provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fixed table name & excluded password_hash from response
        const result = await pool.query(
            `SELECT user_id, username, role, student_id, counselor_id, created_at, updated_at
             FROM users_auth
             WHERE user_id = $1`,
            [decoded.id]
        );

        // Fixed typo: result.rows instead of result.row
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            user: result.rows[0]
        });

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
}

const logoutUser = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logout Success !!"
    });
};

module.exports = { registerUser, loginUser, getUser, logoutUser };