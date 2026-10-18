const pool = require("../config/db");
const RAG_SERVICE_URL=process.env.RAG_SERVICE_URL || "http://localhost:5000";

const chatWithMitra = async(req, res) => {
    try{
        const { query, query_text, message, student_id, language, needs_followup } = req.body;
        const prompt=query || query_text || message;

        if(!prompt || !String(prompt).trim()){
            return res.status(400).json({
                error: "Missing query in request body",
                answer: "Please ask a question."
            });
        }

        const sid=student_id || req.user?.student_id || req.user?.id || null;
        const selectedLanguage = language || "English";

        console.log(`[Backend Chat] Query: "${prompt.trim()}" | Language: "${selectedLanguage}" | Student ID: ${sid}`);

        const ragResponse=await fetch(`${RAG_SERVICE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: prompt.trim(),
                student_id: sid,
                language: selectedLanguage,
                needs_followup: Boolean(needs_followup)
            })
        });

        if(!ragResponse.ok){
            const errBody = await ragResponse.text();
            console.error("[RAG Service Error]:", ragResponse.status, errBody);
            return res.status(ragResponse.status).json({
                error: "RAG service returned an error",
                details: errBody
            });
        }
        const data = await ragResponse.json();
        if(needs_followup && data.chat_id){
            try{
                await pool.query("UPDATE chat_history SET needs_followup = TRUE WHERE chat_id = $1", [data.chat_id]);
            }
            catch(e){
                console.warn("[Backend Chat] Error flagging chat followup:", e.message);
            }
        }

        return res.status(200).json(data);
    } 
    catch(error){
        console.error("Chat Error: ", error);
        return res.status(500).json({
            error: "Failed to communicate with RAG service",
            details: error.message
        });
    }
};

const getSessionFollowupStatus = async (req, res) => {
    try {
        const chatIds = Array.isArray(req.body?.chat_ids) ? req.body.chat_ids : [];
        const validChatIds = chatIds.filter((chatId) =>
            typeof chatId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId)
        );

        if (validChatIds.length === 0) {
            return res.status(200).json({ success: true, needs_followup: false });
        }

        const result = await pool.query(
            `SELECT EXISTS (
                SELECT 1
                FROM chat_history
                WHERE chat_id = ANY($1::uuid[])
                  AND needs_followup = TRUE
            ) AS needs_followup`,
            [validChatIds]
        );

        return res.status(200).json({
            success: true,
            needs_followup: Boolean(result.rows[0]?.needs_followup)
        });
    } catch (error) {
        console.error("Session Follow-up Status Error:", error);
        return res.status(500).json({ success: false, message: "Could not check chat follow-up status." });
    }
};

const submitFeedback = async(req, res) => {
    try {
        const { rating, user_message, ai_reply, student_id, chat_id, callback_requested } = req.body;
        const numericRating = Number(rating);

        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                error: "Feedback rating must be an integer between 1 and 5",
                success: false
            });
        }

        const sid = student_id || req.user?.student_id || req.user?.id || null;

        // Verify that student_id exists in students table before inserting foreign key
        let validStudentId = null;
        if (sid) {
            try {
                const sCheck = await pool.query(
                    "SELECT student_id FROM students WHERE student_id = $1",
                    [sid]
                );
                if (sCheck.rows.length > 0) {
                    validStudentId = sCheck.rows[0].student_id;
                }
            } catch (err) {
                console.warn("[Feedback] Invalid student_id format/not found:", sid);
            }
        }

        // Verify that chat_id exists in chat_history table before inserting foreign key
        let validChatId = null;
        if (chat_id) {
            try {
                const cCheck = await pool.query(
                    "SELECT chat_id FROM chat_history WHERE chat_id = $1",
                    [chat_id]
                );
                if (cCheck.rows.length > 0) {
                    validChatId = cCheck.rows[0].chat_id;
                }
            } catch (err) {
                console.warn("[Feedback] Invalid chat_id format/not found:", chat_id);
            }
        }

        const result = await pool.query(`
            INSERT INTO chat_feedback(
                student_id,
                chat_id,
                rating,
                user_message,
                ai_reply
            )
            VALUES($1, $2, $3, $4, $5)
            RETURNING feedback_id, rating, created_at;
            `,
            [validStudentId, validChatId, numericRating, user_message || null, ai_reply || null]
        );

        // If student requested follow-up alongside feedback
        if (callback_requested) {
            if (validStudentId) {
                await pool.query(
                    "UPDATE students SET callback_requested = TRUE, followup_status = 'Pending', updated_at = NOW() WHERE student_id = $1",
                    [validStudentId]
                );
            }
            if (validChatId) {
                await pool.query(
                    "UPDATE chat_history SET needs_followup = TRUE WHERE chat_id = $1",
                    [validChatId]
                );
            }
        }

        const savedFeedback = result.rows[0];
        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback_id: savedFeedback.feedback_id,
            rating: savedFeedback.rating,
            callback_requested: Boolean(callback_requested),
            created_at: savedFeedback.created_at
        });
    } 
    catch(error) {
        console.error("Feedback Submission Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
            details: error.message
        });
    }
};
const requestCallback = async (req, res) => {
    try{
        const { student_id, phone, email, full_name, target_branch, chat_id, notes } = req.body;
        const sid=req.user?.student_id || student_id || req.user?.id || null;
        const contactPhone = typeof phone === "string" ? phone.trim() : "";
        const contactEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const contactName = typeof full_name === "string" ? full_name.trim() : "";
        const contactNotes = typeof notes === "string" ? notes.trim() : "";

        if (!contactPhone && !contactEmail) {
            return res.status(400).json({
                success: false,
                message: "Provide a phone number or email address for follow-up."
            });
        }
        if (contactPhone && !/^[0-9+() .-]{7,20}$/.test(contactPhone)) {
            return res.status(400).json({ success: false, message: "Enter a valid phone number." });
        }
        if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address." });
        }

        let validStudentId=null;
        if(sid){
            try{
                const sCheck=await pool.query("SELECT student_id FROM students WHERE student_id = $1", [sid]);
                if(sCheck.rows.length > 0){
                    validStudentId=sCheck.rows[0].student_id;
                }
            } 
            catch(err){
                console.warn("[Callback] Student query error:", err.message);
            }
        }

        if(!validStudentId){
            const existingStudent = await pool.query(
                `SELECT student_id
                 FROM students
                 WHERE ($1::text IS NOT NULL AND phone = $1)
                    OR ($2::text IS NOT NULL AND LOWER(email) = LOWER($2))
                 ORDER BY CASE WHEN $1::text IS NOT NULL AND phone = $1 THEN 0 ELSE 1 END, created_at DESC
                 LIMIT 1`,
                [contactPhone || null, contactEmail || null]
            );
            validStudentId = existingStudent.rows[0]?.student_id || null;
        }

        if(validStudentId){
            await pool.query(
                `UPDATE students
                 SET callback_requested = TRUE,
                     followup_status = 'Pending',
                     phone = COALESCE($1, phone),
                     email = COALESCE($2, email),
                     full_name = COALESCE($3, full_name),
                     target_branch = COALESCE($4, target_branch),
                     notes = COALESCE($5, notes),
                     updated_at = NOW()
                 WHERE student_id = $6`,
                [contactPhone || null, contactEmail || null, contactName || null, target_branch || null, contactNotes || null, validStudentId]
            );
        } else {
            const newStudent = await pool.query(
                `INSERT INTO students (full_name, phone, email, target_branch, callback_requested, followup_status, notes)
                 VALUES ($1, $2, $3, $4, TRUE, 'Pending', $5)
                 RETURNING student_id`,
                [contactName || "Prospective Student", contactPhone || "", contactEmail || null, target_branch || null, contactNotes || null]
            );
            validStudentId = newStudent.rows[0].student_id;
        }

        if(chat_id){
            try{
                await pool.query(
                    `UPDATE chat_history
                     SET needs_followup = TRUE,
                         student_id = COALESCE(student_id, $1)
                     WHERE chat_id = $2`,
                    [validStudentId, chat_id]
                );
            } 
            catch(err){
                console.warn("[Callback] Could not flag chat_history:", err.message);
            }
        }
        return res.status(200).json({
            success: true,
            message: "Counselor callback requested successfully. Our admission desk will reach out soon.",
            student_id: validStudentId
        });
    } 
    catch(error){
        console.error("Callback Request Error:", error);
        return res.status(500).json({ success: false, message: "Failed to request callback", error: error.message });
    }
};

module.exports = { chatWithMitra, getSessionFollowupStatus, submitFeedback, requestCallback };
