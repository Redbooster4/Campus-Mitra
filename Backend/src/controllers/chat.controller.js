const pool = require("../config/db");
const RAG_SERVICE_URL=process.env.RAG_SERVICE_URL || "http://localhost:5000";

const chatWithMitra = async(req, res) => {
    try{
        const { query, query_text, message, student_id, language } = req.body;
        const prompt=query || query_text || message;

        if (!prompt || !String(prompt).trim()) {
            return res.status(400).json({
                error: "Missing query in request body",
                answer: "Please ask a question."
            });
        }

        const sid=student_id || req.user?.student_id || req.user?.id || null;

        const ragResponse=await fetch(`${RAG_SERVICE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: prompt.trim(),
                student_id: sid,
                language: language || "en"
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

const submitFeedback = async(req, res) => {
    try{
        const { rating, user_message, ai_reply, student_id, chat_id }=req.body;
        if(rating<1 || rating>5){
            return res.status(400).json({
                error: "Feedback Out of Range",
                success: false
            });
        }
        const result=await pool.query(`
            INSERT INTO chat_feedback(
                feedback_id,
                student_id,
                chat_id,
                rating,
                user_message,
                ai_reply,
                created_at
            )
            VALUES($1, $2, $3, $4, $5)
            RETURNING feedback_id, rating;
            `,
        [
            rating, user_message, ai_reply, student_id || null, chat_id || null
        ]);

        console.log(result);
        return res.status(201).json({
            success: true, 
            feedback_id: feedback_id,
            rating: rating
        })
    } 
    catch(error){
        console.error("Feedback Not Submitted");
        return res.status(500).json({
            success: false,
            message: "Feedback Not Submitted"
        });
    }

}
module.exports={ chatWithMitra, submitFeedback };
