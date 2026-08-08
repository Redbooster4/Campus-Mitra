from typing import Literal
from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama

class QuerySource(BaseModel):
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
    - Exact fee amounts/structure
    - Seat availability/seat matrix numbers
    - Specific dates, deadlines, cutoffs
    - Any question needing precise numeric lookups
    - Faculty Names
    - Cutoff Percentage
    PRIORITY RULES:
    1. If the question asks for an exact number, amount, percentage,
    count, date, seat availability, faculty name, or cutoff,
    choose POSTGRESQL.
    2. If the question asks for descriptive information such as eligibility,
    admission procedure, course description, or policy,
    choose CHROMADB.
    3. If the question contains BOTH a structured lookup and a descriptive
    question, choose BOTH.
    4. Never choose CHROMADB for an exact fee, seat count, cutoff,
    percentage, or other numeric lookup.
    """
classifier_model = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    # num_ctx=1024,
    # num_predict=128,
    validate_model_on_init=True,
)
structured_classifier=classifier_model.with_structured_output(QuerySource)

def classify_query_source(query_text: str) -> dict:
    messages=[
        ("system", CLASSIFIER_SYSTEM_PROMPT),
        ("human", query_text),
    ]
    try:
        result: QuerySource = structured_classifier.invoke(messages) # type: ignore
        return result.model_dump()
    except Exception as e:
        return{
            "source":"BOTH",
            "reasoning":f"Fallback default - classifier error: {e}",
        }