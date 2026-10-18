const { transcribeVoiceAudio } = require("../services/voiceTranscription.service");

const transcribeVoice = async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: "Record a short voice message first." });
    }

    const language = req.query.language;
    const supportedLanguages = new Set(["en", "hi", "mr", "gu"]);
    if (language && !supportedLanguages.has(language)) {
        return res.status(400).json({ error: "Unsupported transcription language." });
    }

    try {
        const text = await transcribeVoiceAudio({
            audio: req.body,
            contentType: req.get("content-type"),
            language,
        });
        return res.status(200).json({ success: true, text });
    } catch (error) {
        if (error.code === "OPENAI_NOT_CONFIGURED") {
            return res.status(503).json({
                error: "Voice transcription is unavailable until OPENAI_API_KEY is configured on the backend.",
            });
        }
        if (error.code === "UNSUPPORTED_AUDIO_FORMAT") {
            return res.status(415).json({ error: "This audio format is not supported for transcription." });
        }
        if (error.name === "TimeoutError") {
            return res.status(504).json({ error: "Transcription took too long. Please try a shorter recording." });
        }

        if (error.code === "TRANSCRIPTION_PROVIDER_ERROR") {
            // Log the provider's explanation for debugging without logging audio or credentials.
            console.error("Voice transcription provider error:", {
                status: error.status,
                code: error.providerCode,
                type: error.providerType,
                message: error.message,
            });
            if (error.status === 401 || error.status === 403) {
                return res.status(503).json({
                    error: "The backend OpenAI key was rejected. Check OPENAI_API_KEY and its project access.",
                });
            }
            if (error.status === 429) {
                return res.status(503).json({
                    error: "The transcription service is rate-limited or out of quota. Check the OpenAI project usage and billing.",
                });
            }
            if (error.status === 400) {
                return res.status(502).json({
                    error: "The transcription service rejected this audio or language setting. Check the model and try a shorter recording.",
                });
            }
        } else {
            console.error("Voice transcription failed:", error.code || error.message);
        }

        return res.status(502).json({
            error: "We couldn't transcribe that recording. Please try again.",
        });
    }
};

module.exports = { transcribeVoice };
