const TRANSCRIPTION_URL = "https://api.sarvam.ai/speech-to-text";
const AUDIO_EXTENSIONS = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
};

const LANGUAGE_CODES = {
    en: "en-IN",
    hi: "hi-IN",
    mr: "mr-IN",
    gu: "gu-IN",
};

const transcribeVoiceAudio = async ({ audio, contentType, language }) => {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
        const error = new Error("Voice transcription is not configured.");
        error.code="SARVAM_NOT_CONFIGURED";
        throw error;
    }
    const mimeType = String(contentType || "").split(";")[0].trim().toLowerCase();
    const extension = AUDIO_EXTENSIONS[mimeType];
    if (!extension) {
        const error = new Error("Unsupported audio format.");
        error.code = "UNSUPPORTED_AUDIO_FORMAT";
        throw error;
    }

    const model = process.env.SARVAM_MODEL || "saaras:v3";
    const languageCode = LANGUAGE_CODES[language] || (language && language.includes("-") ? language : "en-IN");

    const form = new FormData();
    form.append("file", new Blob([audio], { type: mimeType }), `voice-input.${extension}`);
    form.append("model", model);
    form.append("language_code", languageCode);

    const response = await fetch(TRANSCRIPTION_URL, {
        method: "POST",
        headers: { "api-subscription-key": apiKey },
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

    const transcript = result?.transcript || result?.text;
    if (typeof transcript !== "string" || !transcript.trim()) {
        const error = new Error("The transcription provider returned no text.");
        error.code = "EMPTY_TRANSCRIPTION";
        throw error;
    }

    return transcript.trim();
};

module.exports = { AUDIO_EXTENSIONS, transcribeVoiceAudio };
