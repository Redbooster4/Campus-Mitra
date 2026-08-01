from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)

SYSTEM_PROMPT = """
You are the SBMP Admission Assistant.

Answer ONLY using the provided data.

Rules:
- Do not make up information.
- If the required information is not present, clearly say:
  "I couldn't find that information."
- If structured data and knowledge documents are both provided, use both.
- Give a concise and helpful answer.

If no retrieved data is available, DO NOT use your own knowledge.

Simply say:

"I couldn't find this information in the knowledge base."
"""


def generate_answer(user_query, retrieved_data):

    prompt = f"""
User Query:
{user_query}

Retrieved Data:
{retrieved_data}

Generate a helpful answer.
"""

    response = llm.invoke([
        ("system", SYSTEM_PROMPT),
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
        sample_data
    )

    print(answer)