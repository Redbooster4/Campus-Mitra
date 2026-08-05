import json
from typing import Literal

from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama

class QuerySource(BaseModel):
    """Schema for the reply decision."""
    reply: str=Field(
        description="A brief reply on the user's query"
    )

CLASSIFIER_SYSTEM_PROMPT = """You are the SBMP Admission Assistant.
The system has can either return three data sources ["CHROMADB", "POSTGRES", "BOTH"]. Strictly based on these
choose what information to fetch and then generate a wondwerful response guiding to user's issues.
 
Rules:
- If the classifier's response is CHROMADB use strictly the CRHOMADB embedding to generate a response
- If the classifier's response is POSTGRES lookup strictly in the POSTGRES database embedding to generate a response for the fixed content present in it.
- If the classifier's response is BOTH, then use a comibination of both the structured informations and embeddings in order to generate the perfect reply 
to the models query. 
- Respond only with the structured fields requested — no extra commentary (exception: when user types 'Explain this...').
"""

classifier_model = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    validate_model_on_init=True,
)
structured_classifier=classifier_model.with_structured_output(QuerySource)
def classify_query_source(query_text: str) -> dict:
    """
    Respond to the user's Issues relating to the college admission Process
    """
    messages=[
        ("system", CLASSIFIER_SYSTEM_PROMPT),
        ("human", query_text),
    ]
    try:
        result: QuerySource = structured_classifier.invoke(messages)
        return result.model_dump()
    except Exception as e:
        return{
            "reply":"Some Issues !!..",
        }

if __name__ == "__main__":
    test_queries=[
        "What is the eligibility criteria for the Computer Engineering diploma?",
        "What is the exact tuition fee for the first year?",
        "How many seats are available and what's the admission process?",
    ]
    for q in test_queries:
        res = classify_query_source(q)
        print(f"Query: {q}")
        print(json.dumps(res, indent=2))