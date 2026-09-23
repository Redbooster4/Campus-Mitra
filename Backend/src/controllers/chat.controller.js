const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:5000";

const chatWithMitra = async (req, res) => {
    try {
        const { query, query_text, message, student_id, language } = req.body;
        const prompt = query || query_text || message;

        if (!prompt || !String(prompt).trim()) {
            return res.status(400).json({
                error: "Missing query in request body",
                answer: "Please ask a question."
            });
        }

        const sid = student_id || req.user?.student_id || req.user?.id || null;

        const ragResponse = await fetch(`${RAG_SERVICE_URL}/chat`, {
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

        if (!ragResponse.ok) {
            const errBody = await ragResponse.text();
            console.error("[RAG Service Error]:", ragResponse.status, errBody);
            return res.status(ragResponse.status).json({
                error: "RAG service returned an error",
                details: errBody
            });
        }

        const data = await ragResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("[Chat Controller Error]:", error);
        return res.status(500).json({
            error: "Failed to communicate with RAG service",
            details: error.message
        });
    }
};

module.exports = {
    chatWithMitra
};
