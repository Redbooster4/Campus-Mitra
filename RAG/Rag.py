import os
import psycopg2
import ollama
import chromadb
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
from classifier import classify_query_source

ollama_ef = OllamaEmbeddingFunction(
    url="http://localhost:11434/api/embeddings",
    model_name="nomic-embed-text"
)

chroma_client = chromadb.PersistentClient(path="./chroma_db_data")

collection = chroma_client.get_or_create_collection(
    name="sbmp_v2",
    embedding_function=ollama_ef
)

def get_pg_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "sbmp_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASS", "postgres"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )

def query_chromadb(query_text: str, n_results: int = 3) -> str:
    try:
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        docs = results.get("documents", [[]])[0]
        return "\n\n".join(docs) if docs else "No relevant documents found in ChromaDB."
    except Exception as e:
        return f"ChromaDB Query Error: {e}"

def query_postgresql(query_text: str) -> str:
    conn = get_pg_connection()
    cursor = conn.cursor()
    
    schema_info = """
    Tables in PostgreSQL:
    - courses (id, course_name, duration, intake_capacity)
    - eligibility (id, course_name, min_percentage, mandatory_subjects)
    - fees (id, course_name, tuition_fee, total_fee)
    - faculty (id, course_name, faculty_name, designation)
    """
    
    prompt = f"""Given the following Postgres database schema:\n{schema_info}\n
Generate ONLY a single raw SQL query (no markdown formatting, no extra explanation) to answer: {query_text}"""
    
    sql_response = ollama.generate(model="llama3.2:3b", prompt=prompt)
    sql_query = sql_response["response"].strip().replace("```sql", "").replace("```", "").strip()
    
    try:
        cursor.execute(sql_query)
        rows = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description] if cursor.description else []
        cursor.close()
        conn.close()
        return str([dict(zip(colnames, row)) for row in rows]) if rows else "No record found."
    except Exception as e:
        cursor.close()
        conn.close()
        return f"PostgreSQL Execution Error: {e} (Attempted SQL: {sql_query})"

def generate_rag_response(query_text: str) -> str:
    classification = classify_query_source(query_text)
    source = classification.get("source", "BOTH")
    
    chroma_context = ""
    postgres_context = ""
    
    if source in ["CHROMADB", "BOTH"]:
        chroma_context = query_chromadb(query_text)
        
    if source in ["POSTGRESQL", "BOTH"]:
        postgres_context = query_postgresql(query_text)
        
    combined_context = f"--- ChromaDB Context ---\n{chroma_context}\n\n--- PostgreSQL Context ---\n{postgres_context}"
    
    system_prompt = """You are the SBMP Admission Assistant. Answer the student's question clearly using ONLY the provided context from ChromaDB and PostgreSQL. If you don't know or the information isn't present in the context, explicitly state that you don't know."""
    
    user_prompt = f"Context:\n{combined_context}\n\nQuestion: {query_text}"
    
    response = ollama.generate(
        model="llama3.2:3b",
        prompt=f"{system_prompt}\n\n{user_prompt}"
    )
    
    return response["response"]

if __name__ == "__main__":
    test_query = "What is the eligibility criteria for the Computer Engineering diploma?"
    answer = generate_rag_response(test_query)
    print("--- Final Answer ---")
    print(answer)