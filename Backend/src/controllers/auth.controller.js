const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const {
            username,
            full_name,
            phone_number,
            phone,
            password,
            role,
            student_id,
            counselor_id,
            email,
            target_branch,
            entrance_score
        } = req.body;

        const loginUsername = (username || full_name || phone_number || phone || "").trim();
        const studentFullName = (full_name || username || "").trim();
        const studentPhone = (phone || phone_number || "").trim();

        if (!loginUsername || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Fill all the required fields."
            });
        }
        let sid = student_id || null;
        if(role === "Student" && !sid){
            try{
                const studentResult=await pool.query(
                    `INSERT INTO students (full_name, phone, email, target_branch, entrance_score)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING student_id`,
                    [
                        studentFullName || loginUsername,
                        studentPhone || "",
                        email ? email.trim() : null,
                        target_branch || null,
                        entrance_score || null
                    ]
                );
                sid = studentResult.rows[0].student_id;
            } 
            catch(err){
                console.warn("[Register] Could not pre-create students row:", err.message);
            }
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
            RETURNING user_id, username, role, student_id, counselor_id, created_at;`,
            [
                loginUsername,
                password,
                role,
                sid,
                counselor_id || null,
            ]
        );
        const user = result.rows[0];
        const token=jwt.sign(
            {
                user_id: user.user_id,
                role: user.role,
                username: user.username,
                student_id: user.student_id
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(201).json({
            success: true,
            message: "Registration Successful",
            token,
            user: {
                ...user,
                full_name: studentFullName || user.username,
                phone: studentPhone,
                target_branch: target_branch || null,
                entrance_score: entrance_score || null,
                email: email || null
            }
        });
    } 
    catch(error){
        console.error("Register Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const loginUser=async(req, res) => {
    try{
        const { username, full_name, phone_number, phone, password } = req.body;
        const loginIdentifier=(username || full_name || phone_number || phone || "").trim();

        if (!loginIdentifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        const result = await pool.query(
            `SELECT
                u.user_id,
                u.username,
                u.role,
                u.student_id,
                u.counselor_id,
                COALESCE(s.full_name, c.name, u.username) AS full_name,
                COALESCE(s.phone, c.phone) AS phone,
                COALESCE(s.email, c.email) AS email,
                s.target_branch,
                s.entrance_score,
                s.category,
                s.callback_requested,
                s.followup_status
            FROM users_auth u
            LEFT JOIN students s ON u.student_id = s.student_id
            LEFT JOIN counselors c ON u.counselor_id = c.counselor_id
            WHERE (u.username = $1 OR s.phone = $1 OR s.full_name = $1)
              AND u.password_hash = crypt($2, u.password_hash)`,
            [loginIdentifier, password]
        );
        if(result.rows.length === 0){
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const user=result.rows[0];
        const token=jwt.sign(
            { 
                user_id: user.user_id, 
                role: user.role,
                username: user.username,
                student_id: user.student_id
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user
        });
    } 
    catch(error){
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getUser=async(req, res) => {
    try{
        const userId=req.user.user_id;
        const result=await pool.query(
            `SELECT 
                u.user_id,
                u.username,
                u.role,
                u.student_id,
                u.counselor_id,
                u.created_at,
                u.updated_at,
                COALESCE(s.full_name, c.name, u.username) AS full_name,
                COALESCE(s.phone, c.phone) AS phone,
                COALESCE(s.email, c.email) AS email,
                s.dob,
                s.category,
                s.target_branch,
                s.entrance_score,
                s.callback_requested,
                s.followup_status,
                s.notes
             FROM users_auth u
             LEFT JOIN students s ON u.student_id = s.student_id
             LEFT JOIN counselors c ON u.counselor_id = c.counselor_id
             WHERE u.user_id = $1`,
            [userId]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            user: result.rows[0]
        });
    } 
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const updateProfile=async(req, res) => {
    try {
        const userId=req.user?.user_id;
        const {
            full_name,
            phone,
            phone_number,
            email,
            target_branch,
            entrance_score,
            category,
            callback_requested
        } = req.body;

        const contactPhone = phone || phone_number;

        const userRes = await pool.query("SELECT student_id, username FROM users_auth WHERE user_id = $1", [userId]);
        if(userRes.rows.length === 0){
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let sid=userRes.rows[0].student_id;

        if(!sid){
            const newStudent = await pool.query(
                `INSERT INTO students (full_name, phone, email, target_branch, entrance_score, category, callback_requested)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING student_id`,
                [
                    full_name || userRes.rows[0].username || "Student",
                    contactPhone || "",
                    email || null,
                    target_branch || null,
                    entrance_score || null,
                    category || null,
                    callback_requested || false
                ]
            );
            sid = newStudent.rows[0].student_id;
            await pool.query("UPDATE users_auth SET student_id = $1 WHERE user_id = $2", [sid, userId]);
        } 
        else{
            await pool.query(
                `UPDATE students
                 SET full_name = COALESCE($1, full_name),
                     phone = COALESCE($2, phone),
                     email = COALESCE($3, email),
                     target_branch = COALESCE($4, target_branch),
                     entrance_score = COALESCE($5, entrance_score),
                     category = COALESCE($6, category),
                     callback_requested = COALESCE($7, callback_requested),
                     updated_at = NOW()
                 WHERE student_id = $8`,
                [
                    full_name || null,
                    contactPhone || null,
                    email || null,
                    target_branch || null,
                    entrance_score || null,
                    category || null,
                    callback_requested !== undefined ? Boolean(callback_requested) : null,
                    sid
                ]
            );
        }

        const updated = await pool.query(
            `SELECT 
                u.user_id, u.username, u.role, u.student_id, u.counselor_id,
                COALESCE(s.full_name, u.username) AS full_name,
                s.phone, s.email, s.target_branch, s.entrance_score, s.category,
                s.callback_requested, s.followup_status
             FROM users_auth u
             LEFT JOIN students s ON u.student_id = s.student_id
             WHERE u.user_id = $1`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updated.rows[0]
        });
    } 
    catch(err){
        console.error("Update Profile Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const logoutUser=async(req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logout Success !!"
    });
};

module.exports = { registerUser, loginUser, getUser, updateProfile, logoutUser };