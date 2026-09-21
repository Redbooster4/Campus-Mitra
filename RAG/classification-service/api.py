import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from router import route_query

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "error": "Invalid or missing JSON payload.",
                "answer": "Failed to process request: invalid payload format."
            }), 400

        query_text = data.get("query") or data.get("query_text") or data.get("message")
        if not query_text or not str(query_text).strip():
            return jsonify({
                "error": "Missing 'query' field in request body.",
                "answer": "Please provide a valid question."
            }), 400

        student_id = data.get("student_id")
        language = data.get("language", "en")

        logger.info(f"Incoming query: '{query_text}' | Student ID: {student_id} | Language: {language}")

        # Route query through classification, DB/RAG retrieval, and LLM answer generation
        result = route_query(query_text=query_text.strip(), student_id=student_id, language=language)

        logger.info(f"Query routed successfully. Source: {result.get('source')}")
        return jsonify(result), 200

    except Exception as e:
        logger.exception(f"Unhandled error in /chat endpoint: {str(e)}")
        return jsonify({
            "error": "Internal server error occurred while processing the query.",
            "details": str(e),
            "answer": "Sorry, an internal error occurred. Please try again or contact support."
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)