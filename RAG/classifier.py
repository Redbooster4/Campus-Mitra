import json
from typing import Literal

from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
class QuerySource(BaseModel):
    """Schema for the router's decision."""
    source: Literal["CHROMADB", "POSTGRESQL", "BOTH"] = Field(
        description="Which data source(s) are needed to answer the query."
    )
    reasoning: str=Field(
        description="One short sentence explaining the routing decision."
    )

CLASSIFIER_SYSTEM_PROMPT = """You are a query router for the SBMP Admission Assistant.
The system has two data sources. Decide which one(s) are needed to answer the
student's question.
 
CHROMADB (unstructured text — use for):
- Admission process / how to apply
- Eligibility criteria descriptions
- Course/branch descriptions
- General policy or procedural questions
 
POSTGRESQL (structured records — use for):
- Exact fee amounts
- Seat availability / seat matrix numbers
- Specific dates, deadlines, cutoffs
- Any question needing precise numeric lookups
- Faculty Names
- Cutoff Percentage
 
Rules:
- If the question needs both a numeric/structured fact AND surrounding
  explanation/context, choose BOTH.
- If you are unsure, prefer BOTH over guessing wrong.
- Respond only with the structured fields requested — no extra commentary.
"""

classifier_model = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    validate_model_on_init=True,
)
structured_classifier=classifier_model.with_structured_output(QuerySource)

def classify_query_source(query_text: str) -> dict:
    """
    Classify which backend(s) a query should be routed to.
    Return a plain dict, e.g.:
        {"source": "POSTGRESQL", "reasoning": "..."}
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
            "source":"BOTH",
            "reasoning":f"Fallback default - classifier error: {e}",
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