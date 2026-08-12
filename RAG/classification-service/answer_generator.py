from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3.2:3b",
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
- If the required information is not present, clearly say (in {language_name}):
  "I couldn't find that information."
- If structured data and knowledge documents are both provided, use both.
- Give a concise and helpful answer.

If no retrieved data is available, DO NOT use your own knowledge.

Simply say (in {language_name}):

"I couldn't find this information in the knowledge base."

IMPORTANT: You must respond ONLY in {language_name}, regardless of the language
of the user query or the retrieved data. Translate any retrieved information
into {language_name} in your answer.
"""


def generate_answer(user_query, retrieved_data, language="en"):

    language_name = LANGUAGE_NAMES.get(language, "English")

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(language_name=language_name)

    prompt = f"""
User Query:
{user_query}

Retrieved Data:
{retrieved_data}

Generate a helpful answer in {language_name}.
"""

    response = llm.invoke([
        ("system", system_prompt),
        ("human", prompt)
    ])

    return response.content


if __name__ == "__main__":

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