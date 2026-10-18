const TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";
const AUDIO_EXTENSIONS = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
};

const transcribeVoiceAudio = async ({ audio, contentType, language }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        const error = new Error("Voice transcription is not configured.");
        error.code = "OPENAI_NOT_CONFIGURED";
        throw error;
    }

    const mimeType = String(contentType || "").split(";")[0].trim().toLowerCase();
    const extension = AUDIO_EXTENSIONS[mimeType];
    if (!extension) {
        const error = new Error("Unsupported audio format.");
        error.code = "UNSUPPORTED_AUDIO_FORMAT";
        throw error;
    }

    const model = process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1";
    const form = new FormData();
    form.append("file", new Blob([audio], { type: mimeType }), `voice-input.${extension}`);
    form.append("model", model);
    // whisper-1 accepts one ISO-639-1 language hint. Newer transcription
    // models use languages[]; keep that path available for explicit overrides.
    if (language) {
        if (model === "whisper-1") form.append("language", language);
        else form.append("languages[]", language);
    }

    const response = await fetch(TRANSCRIPTION_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: AbortSignal.timeout(60_000),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
        const providerError = result?.error;
        const error = new Error(providerError?.message || "The transcription provider rejected the audio.");
        error.code = "TRANSCRIPTION_PROVIDER_ERROR";
        error.status = response.status;
        error.providerCode = providerError?.code;
        error.providerType = providerError?.type;
        throw error;
    }
    if (typeof result?.text !== "string" || !result.text.trim()) {
        const error = new Error("The transcription provider returned no text.");
        error.code = "EMPTY_TRANSCRIPTION";
        throw error;
    }

    return result.text.trim();
};

module.exports = { AUDIO_EXTENSIONS, transcribeVoiceAudio };
