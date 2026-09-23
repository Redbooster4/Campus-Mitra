import os
import chromadb
import psycopg2
from dotenv import load_dotenv
from chromadb.utils import embedding_functions
from classify import classify_query
from answer_generator import generate_answer

# Load environment configuration
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)
load_dotenv()

POSTGRES_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": os.getenv("POSTGRES_PORT", 5432),
    "database": os.getenv("POSTGRES_DB", "campus_mitra"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", "")
}

# --- 1. Connect to Running Chroma HTTP Server ---
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8000))

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

chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)

# Determine target collection: prioritize .env, otherwise find collection with most chunks
target_collection_name = os.getenv("CHROMA_COLLECTION")

if not target_collection_name:
    try:
        collections = chroma_client.list_collections()
        if collections:
            # Sort collections by chunk count descending to target the complete dataset
            collections.sort(key=lambda c: c.count(), reverse=True)
            target_collection_name = collections[0].name
            print(f"[ChromaDB] Auto-selected largest collection '{target_collection_name}' with {collections[0].count()} chunks.")
        else:
            target_collection_name = "campus_mitra_docs"
    except Exception as e:
        print(f"[ChromaDB] Error inspecting collections: {e}")
        target_collection_name = "campus_mitra_docs"

try:
    knowledge_collection = chroma_client.get_collection(
        name=target_collection_name,
        embedding_function=ollama_ef
    )
except Exception:
    knowledge_collection = chroma_client.get_or_create_collection(
        name=target_collection_name,
        embedding_function=ollama_ef
    )

print(f"[ChromaDB] Active collection: '{knowledge_collection.name}' | Total Chunks: {knowledge_collection.count()}")


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
            JOIN applications a ON (s.id = a.student_id OR s.student_id = a.student_id)
            WHERE s.id = %s OR s.student_id = %s
            ORDER BY a.created_at DESC
            LIMIT 1
        """, (student_id, student_id))

        result = cursor.fetchone()
        documents = []

        if result:
            cursor.execute("""
                SELECT d.document_name, d.status
                FROM documents d
                JOIN applications a ON d.application_id = a.application_id
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


def query_chromadb(query_text, n_results=5):
    try:
        # nomic-embed-text requires the search_query prefix for optimal retrieval
        search_prompt = f"search_query: {query_text.strip()}"

        results = knowledge_collection.query(
            query_texts=[search_prompt],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )

        if not results or not results.get("documents") or not results["documents"][0]:
            print("[ChromaDB] No matching documents found for query.")
            return []

        docs = results["documents"][0]
        metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
        dists = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

        print(f"\n[ChromaDB Retrieved {len(docs)} Chunks]:")
        for i, (chunk, meta, dist) in enumerate(zip(docs, metas, dists)):
            source_file = meta.get("file_name") or meta.get("source") or meta.get("fileName") or "Unknown file"
            print(f"  [{i+1}] Source: {source_file} | Distance: {dist:.4f}")
            print(f"      Preview: {chunk[:120].strip()}...\n")

        return docs
    except Exception as e:
        print(f"[ChromaDB Query Error]: {e}")
        return [f"ChromaDB query failed: {str(e)}"]


def log_chat(student_id, user_message, ai_reply, department_id=None):
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()

        valid_student_id = None
        if student_id:
            cursor.execute("""
                SELECT id FROM students WHERE id = %s
                UNION
                SELECT student_id FROM students WHERE student_id = %s
            """, (student_id, student_id))
            row = cursor.fetchone()
            if row:
                valid_student_id = row[0]

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
    log_chat(student_id, query_text, reply)
    return {
        "message": "Your query has been forwarded to a counselor."
    }


def sanitize_text(val):
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

    print(f"\n[Router] Query: '{query_text}' | Route: {source}")

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
        data = escalate_to_human(query_text, student_id)

    elif source == "GREETING":
        data = {"message": "Hello! How can I help you with your admission query today?"}

    else:
        data = {"error": "Unknown routing source"}

    if source in ["HUMAN_ESCALATION", "GREETING"]:
        final_answer = data.get("message", "")
    else:
        final_answer = generate_answer(
            user_query=query_text,
            retrieved_data=data,
            language=language
        )

    clean_answer = sanitize_text(final_answer)

    if source not in ["HUMAN_ESCALATION"]:
        log_chat(student_id, query_text, clean_answer)

    return {
        "source": source,
        "confidence": classification.get("confidence", None),
        "reasoning": classification.get("reasoning", ""),
        "answer": clean_answer,
        "retrieved_data": data
    }