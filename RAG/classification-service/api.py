from flask import Flask, request, jsonify
from flask_cors import CORS
from router import route_query

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    query_text = data.get("query")
    student_id = data.get("student_id")

    if not query_text:
        return jsonify({"error": "query is required"}), 400

    result = route_query(query_text, student_id)
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5000, debug=True)