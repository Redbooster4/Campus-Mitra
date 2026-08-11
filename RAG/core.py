import json
from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
from classifier import classify_query_source

MODEL_NAME="llama3.2:3b"
CHROMA_PATH="chroma_sbmp"
COLLECTION_NAME="sbmp_final_year_project"

class QueryResponse(BaseModel):
    reply: str=Field(
        description="A clear and concise answer to the student's query."
    )
    
CORE_SYSTEM_PROMPT = """You are the SBMP Admission Assistant.
The system has can either return three data sources ["CHROMADB", "POSTGRESQL", "BOTH"]. Strictly based on these
choose what information to fetch and then generate a wondwerful response guiding to user's issues.
Data Source Context: {context} 
Question: {query}

Rules:
- If the classifier's response is CHROMADB use strictly the CHROMADB embedding to generate a response
- If the classifier's response is POSTGRESQL lookup strictly in the POSTGRESQL database SQL/structured query
- If the classifier's response is BOTH, then use a comibination of both the structured informations and embeddings in order to generate the perfect reply 
to the models query. 
- Respond only with the structured fields requested — no extra commentary (exception: when user types 'Explain this...' or anything else when the user asks for more details on the topic).

Instructions:
- Answer the question based only on the above context.
- Be clear, concise, and helpful — the user is a prospective student or parent.
- If the answer is NOT found in the context, respond exactly with:
  "I don't have that information right now. I'm connecting you with an admission counselor for further help."
- Do not make up fees, dates, or eligibility criteria that are not in the context.
"""
model = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    validate_model_on_init=True,
)
output = model.with_structured_output(QueryResponse)

def coreRag(query: str, context: str) -> str:
    try:
        system_prompt=CORE_SYSTEM_PROMPT.format(context=context, query=query)
        result = output.invoke(
            [
                ("system", system_prompt),
                ("human", query),
            ]
        )
        return result.reply
    except Exception as e:
        print(f"Error Occured: {e}")
    
if __name__ == "__main__":
    sampleQuery=input("Enter a sample Query: ")
    #    Give me the details for the fees structure in IT for diploma
    classification = classify_query_source(sampleQuery)
    print("Classification - ", classification)
    source = classification["source"]
    if(source == "CHROMADB"):
        context=query_chroma(sampleQuery)    
    elif(source == "POSTGRESQL"):
        context=query_postgres(sampleQuery)
    else:
        ctxChroma=query_chroma(sampleQuery)    
        ctxPostgr=query_postgres(sampleQuery)
        context="""
        CHROMADB Context:
        {ctxChroma}
        
        POSTGRESQL Context:
        {ctxPostgr}
        """
    res = coreRag(query=sampleQuery, context=context)
    print(f"Query: {sampleQuery}")
    print(json.dumps(res, indent=2))