import json
import sys
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    temperature=0
)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
}

SYSTEM_PROMPT_TEMPLATE = """
You are the SBMP Admission Assistant.

Answer ONLY using the provided data.

Rules:
- Do not make up information.
- If the required information is not present or an error is stated in retrieved data, clearly explain what is missing (in {language_name}).
- If structured data and knowledge documents are both provided, use both.
- Give a concise and helpful answer.

IMPORTANT: You must respond ONLY in {language_name}, regardless of the language of the user query or the retrieved data. Translate any retrieved information into {language_name} in your answer.
"""

def format_context(retrieved_data):
    if not retrieved_data:
        return "No retrieved data available."
    if isinstance(retrieved_data, list):
        return "\n\n".join([str(item) for item in retrieved_data])
    if isinstance(retrieved_data, dict):
        formatted_parts = []
        for key, value in retrieved_data.items():
            if isinstance(value, list):
                formatted_parts.append(f"--- {key.upper()} --- \n" + "\n\n".join([str(v) for v in value]))
            elif isinstance(value, dict):
                formatted_parts.append(f"--- {key.upper()} --- \n" + json.dumps(value, indent=2))
            else:
                formatted_parts.append(f"--- {key.upper()} --- \n{value}")
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

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    sample_data = {
        "postgres": {
            "full_name": "Test Student",
            "application_status": "Under Review"
        },
        "chromadb": [
            "Hostel facilities are available for students.",
            "Rooms are shared by 3-4 students."
        ]
    }

    answer = generate_answer(
        "Mera admission status aur hostel rules batao",
        sample_data,
        language="hi"
    )

    print(answer)