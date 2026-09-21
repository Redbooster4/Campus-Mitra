import os
import chromadb
import psycopg2
from dotenv import load_dotenv
from chromadb.utils import embedding_functions
from classify import classify_query
from answer_generator import generate_answer

load_dotenv()

POSTGRES_CONFIG = {
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_PORT"),
    "database": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD")
}

CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db_data"))

try:
    ollama_ef = embedding_functions.OllamaEmbeddingFunction(
        url="http://localhost:11434/api/embeddings",
        model_name="nomic-embed-text"
    )
except Exception:
    from langchain_ollama import OllamaEmbeddings
    class OllamaEmbeddingAdapter:
        def __init__(self, model_name="nomic-embed-text"):
            self.ef = OllamaEmbeddings(model=model_name)
        def __call__(self, input):
            return self.ef.embed_documents(input)
    ollama_ef = OllamaEmbeddingAdapter("nomic-embed-text")

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
existing_collections = chroma_client.list_collections()

target_collection_name = "sbmp_final_year_project"
if existing_collections:
    for col in existing_collections:
        if col.count() > 0:
            target_collection_name = col.name
            break
    if not target_collection_name:
        target_collection_name = existing_collections[0].name

knowledge_collection = chroma_client.get_or_create_collection(
    name=target_collection_name,
    embedding_function=ollama_ef
)


def get_postgres_connection():
    return psycopg2.connect(**POSTGRES_CONFIG)


def query_postgres(student_id=None):
    if not student_id:
        return {"error": "student_id required for personal database queries"}

    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT s.full_name, a.status, a.created_at
            FROM students s
            JOIN applications a
            ON s.student_id = a.student_id
            WHERE s.student_id = %s
            ORDER BY a.created_at DESC
            LIMIT 1
        """, (student_id,))

        result = cursor.fetchone()
        documents = []

        if result:
            cursor.execute("""
                SELECT d.document_name, d.status
                FROM documents d
                JOIN applications a
                ON d.application_id = a.application_id
                WHERE a.student_id = %s
            """, (student_id,))

            docs = cursor.fetchall()
            documents = [{"name": d[0], "status": d[1]} for d in docs]

        cursor.close()
        conn.close()

        if not result:
            return {"error": f"Student record for ID '{student_id}' not found"}

        return {
            "full_name": result[0],
            "application_status": result[1],
            "applied_on": str(result[2]),
            "documents": documents
        }
    except Exception as e:
        return {"error": f"PostgreSQL query failed: {str(e)}"}


def query_chromadb(query_text, n_results=3):
    try:
        results = knowledge_collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        if not results or not results.get("documents"):
            return []
        return results["documents"][0]
    except Exception as e:
        return [f"ChromaDB query failed: {str(e)}"]


def log_chat(student_id, user_message, ai_reply, department_id=None):
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()

        valid_student_id = None
        if student_id:
            cursor.execute("SELECT 1 FROM students WHERE student_id = %s", (student_id,))
            if cursor.fetchone():
                valid_student_id = student_id

        cursor.execute("""
            INSERT INTO chat_history
            (student_id, department_id, user_message, ai_reply)
            VALUES (%s, %s, %s, %s)
        """, (
            valid_student_id,
            department_id,
            user_message,
            ai_reply
        ))

        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[Error logging chat]: {e}")


def escalate_to_human(query_text, student_id=None):
    reply = "ESCALATED: Forwarded to counselor."
    log_chat(
        student_id,
        query_text,
        reply
    )
    return {
        "message": "Your query has been forwarded to a counselor."
    }


def sanitize_text(val):
    """Ensure output is always a clean string for JSON / React rendering."""
    if hasattr(val, "content"):
        val = val.content

    if isinstance(val, dict):
        return val.get("text") or val.get("answer") or val.get("message") or str(val)
    elif isinstance(val, list):
        extracted = []
        for item in val:
            if isinstance(item, dict):
                extracted.append(item.get("text", "") or str(item))
            elif hasattr(item, "content"):
                extracted.append(str(item.content))
            else:
                extracted.append(str(item))
        return "\n".join(extracted)
    elif val is None:
        return ""
    return str(val)


def route_query(query_text, student_id=None, language="en"):
    classification = classify_query(query_text)
    source = classification.get("source")

    if source == "POSTGRESQL":
        data = query_postgres(student_id)

    elif source == "CHROMADB":
        data = query_chromadb(query_text)

    elif source == "BOTH":
        data = {
            "postgres": query_postgres(student_id),
            "chromadb": query_chromadb(query_text)
        }

    elif source == "HUMAN_ESCALATION":
        data = escalate_to_human(
            query_text,
            student_id
        )

    elif source == "GREETING":
        data = {"message": "Hello! How can I help you with your admission query today?"}

    else:
        data = {
            "error": "Unknown routing source"
        }

    if source in ["HUMAN_ESCALATION", "GREETING"]:
        final_answer = data.get("message", "")
    else:
        final_answer = generate_answer(
            user_query=query_text,
            retrieved_data=data,
            language=language
        )

    clean_answer = sanitize_text(final_answer)

    return {
        "source": source,
        "confidence": classification.get("confidence", None),
        "reasoning": classification.get("reasoning", ""),
        "answer": clean_answer,
        "retrieved_data": data
    }
