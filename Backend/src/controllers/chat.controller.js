const axios = require("axios");
const pool = require("../config/db");

const handleChat = async(req, res) => {
    try {
        const { message } = req.body;
        const pythonRes = await axios.post("http://localhost:8000/ask", {
            query: message
        });
        const aiReply = pythonRes.data.reply;
        
        await pool.query("INSERT INTO chat_history(user_message, ai_reply) VALUES ($1, $2)",
            [message, aiReply]
        );
        res.json({
            reply: aiReply
        });
    } 
    catch(error){
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI Model" });
    }
}
module.exports = {handleChat};