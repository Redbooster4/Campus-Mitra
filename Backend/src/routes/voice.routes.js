const express = require("express");
const { AUDIO_EXTENSIONS } = require("../services/voiceTranscription.service");
const { transcribeVoice } = require("../controllers/voice.controller");

const router = express.Router();
const supportedAudioTypes = Object.keys(AUDIO_EXTENSIONS);
const parseAudio = express.raw({ type: supportedAudioTypes, limit: "20mb" });

router.post("/transcribe", (req, res, next) => {
    parseAudio(req, res, (error) => {
        if (error?.type === "entity.too.large") {
            return res.status(413).json({ error: "Keep voice recordings under 20 MB." });
        }
        if (error) return next(error);
        return next();
    });
}, transcribeVoice);

module.exports = router;
