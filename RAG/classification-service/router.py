from classify import classify_query
import psycopg2
import os
import chromadb
from dotenv import load_dotenv
from answer_generator import generate_answer
from chromadb.utils import embedding_functions

load_dotenv()


POSTGRES_CONFIG = {
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_PORT"),
    "database": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD")
}


CHROMA_PATH = "./chroma_test_data"
CHROMA_COLLECTION = "sbmp_test"

sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="paraphrase-multilingual-MiniLM-L12-v2"
)

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
knowledge_collection = chroma_client.get_or_create_collection(
    name=CHROMA_COLLECTION,
    embedding_function=sentence_transformer_ef
)


def get_postgres_connection():
    return psycopg2.connect(**POSTGRES_CONFIG)


def query_postgres(student_id=None):
    if not student_id:
        return {"error": "student_id required"}

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

        documents = [
            {
                "name": d[0],
                "status": d[1]
            }
            for d in docs
        ]

    cursor.close()
    conn.close()

    if not result:
        return {"error": "Student record not found"}

    return {
        "full_name": result[0],
        "application_status": result[1],
        "applied_on": str(result[2]),
        "documents": documents
    }



def query_chromadb(query_text, n_results=3):

    results = knowledge_collection.query(
        query_texts=[query_text],
        n_results=n_results
    )

    if not results["documents"]:
        return []

    return results["documents"][0]


def log_chat(student_id, user_message, ai_reply, department_id=None):

    conn = get_postgres_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO chat_history
        (student_id, department_id, user_message, ai_reply)
        VALUES (%s,%s,%s,%s)
    """, (
        student_id,
        department_id,
        user_message,
        ai_reply
    ))

    conn.commit()

    cursor.close()
    conn.close()


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



def route_query(query_text, student_id=None):

    classification = classify_query(query_text)
    source = classification["source"]

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
    elif source=="GREETING":
        data = {"message": "Hello! How can I help you with your admission query today?"}
        
    else:

        data = {
            "error": "Unknown routing source"
        }

    if source == ["HUMAN_ESCALATION","GREETING"]:

        final_answer = data["message"]

    else:

        final_answer = generate_answer(
            user_query=query_text,
            retrieved_data=data
        )

    return {

        "source": source,

        "confidence": classification.get(
            "confidence",
            None
        ),

        "reasoning": classification["reasoning"],

        "answer": final_answer,

        "retrieved_data": data
    }

if __name__ == "__main__":

    student_id = "e6f53010-740a-4074-956a-d9b45685adf4"

    queries = [

        "mera admission status kya hai",

        "eligibility criteria kya hai computer branch ke liye",

        "mera admission status aur hostel rules batao",

        "mujhe kisi insaan se baat karni hai",

        "What is my application status?",

        "माझी फी भरली आहे का?"
    ]

    for q in queries:

        print("=" * 80)

        print(route_query(
            q,
            student_id
        ))