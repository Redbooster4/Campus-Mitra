import os
import json
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)
load_dotenv()

if os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
    google_api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
}

SYSTEM_PROMPT_TEMPLATE = """
You are the SBMP Admission Assistant for Shri Bhagubhai Mafatlal Polytechnic and College of Engineering (SBMP).

Answer ONLY using the provided data.

Rules:
- Be strictly on point and concise. Provide ONLY the direct answer to the specific question asked. Do not include unnecessary details, broad overviews, or background information.
- Do not dump entire documents, schedules, full tables, or unrelated rules. Extract and present only the exact facts or figures requested.
- Do not make up information.
- Official Document / PDF Links:
  - If official document or PDF links are provided in the data, give the direct answer first, and then include the relevant Markdown link: [Document Title](URL) for the user's reference.
  - Do NOT dump the full text of the document when a link is available.
  - If only the PDF link is available in the retrieved data, state briefly what the document is and provide the link.
- If the required information is not present or an error is stated in retrieved data, state clearly and concisely what is missing (in {language_name}).
- Do not use outside knowledge to answer off-topic questions (e.g., coding, general trivia, cooking, or unrelated subjects). If a query is outside the scope of SBMP college, politely state (in {language_name}) that you can only assist with SBMP college-related matters.
- If structured data and knowledge documents are both provided, use only the specific data points that directly answer the query.

IMPORTANT: You must respond ONLY in {language_name}, regardless of the language of the user query or the retrieved data. Translate any retrieved information into {language_name} in your answer.
"""

def format_rag_dict(rag_dict):
    parts = []
    content = rag_dict.get("content", [])
    if content:
        if isinstance(content, list):
            parts.append("--- RETRIEVED DOCUMENT CONTENT ---\n" + "\n\n".join(str(c) for c in content))
        else:
            parts.append(f"--- RETRIEVED DOCUMENT CONTENT ---\n{content}")
    pdf_links = rag_dict.get("pdf_links", [])
    if pdf_links:
        if isinstance(pdf_links, list):
            parts.append("--- OFFICIAL DOCUMENT / PDF LINKS ---\n" + "\n".join(f"- {link}" for link in pdf_links))
        else:
            parts.append(f"--- OFFICIAL DOCUMENT / PDF LINKS ---\n- {pdf_links}")
    return "\n\n".join(parts) if parts else "No document data found."

def format_context(retrieved_data):
    if not retrieved_data:
        return "No retrieved data available."
    if isinstance(retrieved_data, list):
        return "\n\n".join([str(item) for item in retrieved_data])
    if isinstance(retrieved_data, dict):
        if "content" in retrieved_data or "pdf_links" in retrieved_data:
            return format_rag_dict(retrieved_data)
        formatted_parts = []
        for key, value in retrieved_data.items():
            if isinstance(value, dict) and ("content" in value or "pdf_links" in value):
                formatted_parts.append(f"=== {key.upper()} ===\n" + format_rag_dict(value))
            elif isinstance(value, list):
                formatted_parts.append(f"=== {key.upper()} ===\n" + "\n\n".join([str(v) for v in value]))
            elif isinstance(value, dict):
                formatted_parts.append(f"=== {key.upper()} ===\n" + json.dumps(value, indent=2))
            else:
                formatted_parts.append(f"=== {key.upper()} ===\n{value}")
        return "\n\n".join(formatted_parts)
    return str(retrieved_data)

def generate_answer(user_query, retrieved_data, language="en"):
    language_name = LANGUAGE_NAMES.get(language, "English")
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(language_name=language_name)
    context_text = format_context(retrieved_data)

    prompt = f"""
User Query:
{user_query}

Retrieved Data Context:
{context_text}

Provide a direct, concise, and on-point answer to the specific question asked in {language_name}. Do not include unnecessary background or unrequested details.
"""

    response = llm.invoke([
        ("system", system_prompt),
        ("human", prompt)
    ])

    raw_content = response.content
    if isinstance(raw_content, str):
        return raw_content
    if isinstance(raw_content, list):
        parts = []
        for item in raw_content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                parts.append(item.get("text", "") or str(item))
            elif hasattr(item, "text"):
                parts.append(getattr(item, "text"))
            else:
                parts.append(str(item))
        return "\n".join(parts)
    if isinstance(raw_content, dict):
        return raw_content.get("text", "") or raw_content.get("content", "") or str(raw_content)
    return str(raw_content)
