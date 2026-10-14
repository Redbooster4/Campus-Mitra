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


import re
import hashlib
import urllib.request
from google import genai
from google.genai import types

PDF_CACHE_DIR = os.path.join(os.path.dirname(__file__), "pdf_cache")
os.makedirs(PDF_CACHE_DIR, exist_ok=True)


def get_pdf_content(pdf_url: str) -> str:
    """Fetch and extract text content from a PDF URL (including scanned image PDFs) using cached Gemini multimodal extraction."""
    try:
        url_hash = hashlib.md5(pdf_url.encode()).hexdigest()
        cache_file = os.path.join(PDF_CACHE_DIR, f"{url_hash}.txt")
        if os.path.exists(cache_file):
            with open(cache_file, "r", encoding="utf-8") as f:
                return f.read()

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return ""

        client = genai.Client(api_key=api_key)
        req = urllib.request.Request(pdf_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=12) as resp:
            pdf_bytes = resp.read()

        if not pdf_bytes:
            return ""

        prompt = (
            "Extract all text, tables, dates, numbers, amounts, categories, requirements, and key information "
            "from this document completely and accurately. Preserve tables and numerical figures."
        )
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
            contents=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                prompt
            ]
        )
        extracted_text = response.text or ""
        if extracted_text:
            with open(cache_file, "w", encoding="utf-8") as f:
                f.write(extracted_text)
        return extracted_text
    except Exception as e:
        print(f"[PDF Extraction Error for {pdf_url}]: {e}")
        return ""


def extract_all_known_pdf_links():
    try:
        all_docs = knowledge_collection.get(include=["documents"])["documents"]
        links = set()
        for d in all_docs:
            found = re.findall(r"(?:https?://[^\s\"')>]+\.pdf|/[^\s\"')>]+\.pdf)", d)
            for f in found:
                prefix = "https://sbmp.ac.in" if not f.startswith("http") else ""
                slash = "" if f.startswith("/") or f.startswith("http") else "/"
                links.add(prefix + slash + f)
        return list(links)
    except Exception as e:
        return []

ALL_PDF_LINKS = extract_all_known_pdf_links()


def query_chromadb(query_text, n_results=50):
    try:
        q_lower = query_text.lower()
        is_faculty_query = any(w in q_lower for w in ["teacher", "teachers", "faculty", "professor", "professors", "lecturer", "staff", "hod"])

        # nomic-embed-text requires the search_query prefix for optimal retrieval
        if is_faculty_query:
            search_prompt = f"search_query: {query_text.strip()} faculty lecturer teachers staff department"
        else:
            search_prompt = f"search_query: {query_text.strip()}"

        results = knowledge_collection.query(
            query_texts=[search_prompt],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )

        if not results or not results.get("documents") or not results["documents"][0]:
            print("[ChromaDB] No matching documents found for query.")
            return {"content": [], "pdf_links": []}

        docs = results["documents"][0]
        metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
        dists = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

        unique_content = []
        pdf_links = []
        seen = set()

        for chunk, meta, dist in zip(docs, metas, dists):
            clean_chunk = (chunk or "").strip()
            if not clean_chunk or clean_chunk in seen:
                continue
            seen.add(clean_chunk)

            # Check if chunk itself is a PDF link or URL
            is_pdf_url = bool(re.search(r"(\.pdf|/cdn/uploads/)", clean_chunk, re.I)) and len(clean_chunk) < 350
            if is_pdf_url:
                url = clean_chunk if clean_chunk.startswith("http") else f"https://sbmp.ac.in{'' if clean_chunk.startswith('/') else '/'}{clean_chunk}"
                if url not in pdf_links:
                    pdf_links.append(url)
            else:
                unique_content.append(clean_chunk)

            # Also check metadata for source file links
            source_file = meta.get("file_name") or meta.get("source") or meta.get("fileName") or ""
            if source_file and re.search(r"\.pdf", source_file, re.I):
                url = source_file if source_file.startswith("http") else f"https://sbmp.ac.in{'' if source_file.startswith('/') else '/'}{source_file}"
                if url not in pdf_links:
                    pdf_links.append(url)

        # For faculty queries, ensure the official faculty list document is prioritized
        if is_faculty_query:
            faculty_pdf = "https://sbmp.ac.in/cdn/uploads/2023-2024.pdf"
            if faculty_pdf not in pdf_links:
                pdf_links.insert(0, faculty_pdf)

        # Check if chunks or query match any known official PDF documents
        combined_text = (query_text + " " + " ".join(unique_content[:3])).lower()
        for link in ALL_PDF_LINKS:
            if link in pdf_links:
                continue
            slug = link.split("/")[-1].replace(".pdf", "").replace("-", " ").replace("_", " ").lower()
            slug_words = [w for w in slug.split() if len(w) > 3]
            if not slug_words:
                continue
            c_matches = sum(1 for w in slug_words if w in combined_text)
            if c_matches / len(slug_words) >= 0.5:
                pdf_links.append(link)

        # Rank PDF links by relevance to the user query and retrieved content
        def score_link(link):
            slug = link.split("/")[-1].replace(".pdf", "").replace("-", " ").replace("_", " ").lower()
            slug_words = [w for w in slug.split() if len(w) > 2]
            q_words = [w for w in query_text.lower().split() if len(w) > 2]
            score = sum(3 for w in slug_words if w in q_words)
            if unique_content:
                c_text = " ".join(unique_content[:3]).lower()
                score += sum(1 for w in slug_words if w in c_text)
            return score

        pdf_links.sort(key=score_link, reverse=True)

        # For top relevant PDF links, fetch full content so Gemini has the complete document content
        for link in pdf_links[:2]:
            extracted = get_pdf_content(link)
            if extracted:
                doc_name = link.split("/")[-1].replace(".pdf", "").replace("-", " ").replace("_", " ")
                unique_content.insert(0, f"=== FULL EXTRACTED CONTENT OF DOCUMENT ({doc_name}) ===\n{extracted}")

        print(f"\n[ChromaDB Retrieved {len(unique_content)} Text Chunks & {len(pdf_links)} PDF Links]")
        for i, chunk in enumerate(unique_content[:3]):
            print(f"  [Text {i+1}] Preview: {chunk[:100].strip()}...")
        for j, link in enumerate(pdf_links):
            print(f"  [PDF Link {j+1}] {link}")

        return {
            "content": unique_content[:20],
            "pdf_links": pdf_links
        }
    except Exception as e:
        print(f"[ChromaDB Query Error]: {e}")
        return {"content": [f"ChromaDB query failed: {str(e)}"], "pdf_links": []}




def log_chat(student_id, user_message, ai_reply, department_id=None):
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()

        valid_student_id = None
        if student_id:
            try:
                cursor.execute("""
                    SELECT student_id FROM students WHERE student_id = %s
                """, (str(student_id),))
                row = cursor.fetchone()
                if row:
                    valid_student_id = row[0]
            except Exception:
                conn.rollback()

        cursor.execute("""
            INSERT INTO chat_history
            (student_id, department_id, user_message, ai_reply)
            VALUES (%s, %s, %s, %s)
            RETURNING chat_id
        """, (
            valid_student_id,
            department_id,
            user_message,
            ai_reply
        ))

        row = cursor.fetchone()
        chat_id = str(row[0]) if row else None

        conn.commit()
        cursor.close()
        conn.close()
        return chat_id
    except Exception as e:
        print(f"[Error logging chat]: {e}")
        return None


LANGUAGE_MAP = {
    "english": "en",
    "en": "en",
    "hindi": "hi",
    "hi": "hi",
    "marathi": "mr",
    "mr": "mr",
    "gujarati": "gu",
    "gu": "gu",
}

OUT_OF_SCOPE_RESPONSES = {
    "en": "I am Campus-Mitra, the SBMP College Assistant. I can only assist with queries related to SBMP college admissions, eligibility, fees, courses, campus facilities, and student records.",
    "hi": "मैं कैंपस-मित्र (SBMP कॉलेज सहायक) हूँ। मैं केवल SBMP कॉलेज प्रवेश, पात्रता, शुल्क, पाठ्यक्रम, परिसर सुविधाओं और छात्र रिकॉर्ड से संबंधित प्रश्नों में आपकी सहायता कर सकता हूँ।",
    "mr": "मी कॅम्पस-मित्र (SBMP कॉलेज सहाय्यक) आहे. मी फक्त SBMP कॉलेज प्रवेश, पात्रता, फी, अभ्यासक्रम, महाविद्यालयीन सुविधा आणि विद्यार्थी नोंदींशी संबंधित प्रश्नांची उत्तरे देऊ शकतो.",
    "gu": "હું કેમ્પસ-મિત્ર (SBMP કોલેજ સહાયક) છું. હું માત્ર SBMP કોલેજ પ્રવેશ, પાત્રતા, ફી, અભ્યાસક્રમો અને વિદ્યાર્થી રેકોર્ડ સંબંધિત પ્રશ્નોમાં મદદ કરી શકું છું."
}

GREETING_RESPONSES = {
    "en": "Hello! How can I help you with your admission query today?",
    "hi": "नमस्ते! आज मैं आपकी प्रवेश संबंधी क्या मदद कर सकता हूँ?",
    "mr": "नमस्कार! आज मी आपल्या प्रवेश संबंधित काय मदत करू शकतो?",
    "gu": "નમસ્તે! આજે હું આપની પ્રવેશ સંબંધી શું મદદ કરી શકું?"
}

HUMAN_ESCALATION_RESPONSES = {
    "en": "Your query has been forwarded to a counselor.",
    "hi": "आपका प्रश्न काउंसलर को भेज दिया गया है।",
    "mr": "तुमचा प्रश्न समुपदेशकाकडे पाठवला गेला आहे.",
    "gu": "તમારો પ્રશ્ન કાઉન્સેલરને મોકલી દેવામાં આવ્યો છે."
}


def escalate_to_human(query_text, student_id=None, language="English"):
    lang_code = LANGUAGE_MAP.get(str(language).lower().strip(), "en")
    msg = HUMAN_ESCALATION_RESPONSES.get(lang_code, HUMAN_ESCALATION_RESPONSES["en"])
    reply = f"ESCALATED: {msg}"
    chat_id = log_chat(student_id, query_text, reply)
    return {
        "message": msg,
        "chat_id": chat_id
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


def route_query(query_text, student_id=None, language="English"):
    lang_code = LANGUAGE_MAP.get(str(language).lower().strip(), "en")
    classification = classify_query(query_text)
    source = classification.get("source")

    print(f"\n[Router] Query: '{query_text}' | Route: {source} | Language: {language} ({lang_code})")

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
        data = escalate_to_human(query_text, student_id, language=language)

    elif source == "GREETING":
        data = {"message": GREETING_RESPONSES.get(lang_code, GREETING_RESPONSES["en"])}

    elif source == "OUT_OF_SCOPE":
        data = {"message": OUT_OF_SCOPE_RESPONSES.get(lang_code, OUT_OF_SCOPE_RESPONSES["en"])}

    else:
        data = {"error": "Unknown routing source"}

    if source in ["HUMAN_ESCALATION", "GREETING", "OUT_OF_SCOPE"]:
        final_answer = data.get("message", "")
    else:
        final_answer = generate_answer(
            user_query=query_text,
            retrieved_data=data,
            language=language
        )

    clean_answer = sanitize_text(final_answer)

    chat_id = None
    if source not in ["HUMAN_ESCALATION"]:
        chat_id = log_chat(student_id, query_text, clean_answer)
    else:
        chat_id = data.get("chat_id")

    return {
        "source": source,
        "confidence": classification.get("confidence", None),
        "reasoning": classification.get("reasoning", ""),
        "answer": clean_answer,
        "retrieved_data": data,
        "chat_id": chat_id
    }