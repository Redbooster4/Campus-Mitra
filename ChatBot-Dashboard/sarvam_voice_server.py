import io
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from sarvamai import SarvamAI

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/voice/transcribe":{"origins": "*"}},
    supports_credentials=True,
)
LANGUAGE_CODES={
    "en":"en-IN",
    "hi":"hi-IN",
    "mr":"mr-IN",
    "gu":"gu-IN",
}

@app.post("/api/voice/transcribe")
def transcribe_voice():
    api_key=os.environ.get("SARVAM_API_KEY")
    if not api_key:
        return jsonify(error="Sarvam speech-to-text is not configured on the server."), 503

    audio=request.get_data()
    if not audio:
        return jsonify(error="No audio was received."), 400

    language_code = LANGUAGE_CODES.get(request.args.get("language", "en"),"en-IN")
    filename="recording.webm"
    mime_type=request.headers.get("Content-Type", "audio/webm").split(";")[0]
    try:
        client = SarvamAI(
            base_url="https://api.sarvam.ai/",
            api_subscription_key=api_key,
        )
        result = client.speech_to_text.transcribe(
            file=(filename, io.BytesIO(audio), mime_type),
            language_code=language_code,
        )
        return jsonify(text=result.transcript)
    except Exception:
        app.logger.exception("Sarvam speech-to-text request failed")
        return jsonify(error="Couldn't transcribe that recording. Please try again."), 502

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001)
