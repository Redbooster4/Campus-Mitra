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
- Do not make up information.
- When answering queries about documents, notices, academic calendars, fee structures, syllabi, vacancy positions, or college policies:
  1. In-Chat Content: Present the key information, schedules, dates, rules, eligibility criteria, or fee figures directly in the chat message in a clear, well-structured, and readable format (use bullet points or neat sections).
  2. Official PDF Link: Whenever official document or PDF links are provided in the data, ALWAYS include the link(s) formatted as Markdown links: [Document Title](URL) so the user can easily view or download the complete official document.
  3. ALWAYS provide BOTH the extracted text content in the chat AND the official PDF download link when both are available.
  4. If only the PDF link is available in the retrieved data, state clearly what the document is, provide the PDF link, and invite the user to check the document or ask specific questions about it.
- If the required information is not present or an error is stated in retrieved data, clearly explain what is missing (in {language_name}).
- If structured data and knowledge documents are both provided, use both.
- Give a concise and helpful answer.

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

Generate a helpful answer in {language_name}.
"""

    response = llm.invoke([
        ("system", system_prompt),
        ("human", prompt)
    ])

    return response.content
