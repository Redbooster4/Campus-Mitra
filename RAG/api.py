from fastapi import FastAPI
from pydantic import BaseModel
from core import coreRag

app = FastAPI()
class ChatRequest(BaseModel):
    query: str
    
@app.post("/ask")
def ask(request: ChatRequest):
    answer = coreRag(query=request.query, context="...")
    return {"reply": answer}