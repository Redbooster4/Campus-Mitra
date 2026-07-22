import argparse
import os
import shutil

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters
from langchain.vectorestores.chroma import chroma
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms.ollama import Ollama
from get_embedding_function import get_embedding_function

CHROMA_PATH="chroma_sbmp"

model = Ollama(model="llama3.2:3b")
PROMPT_TEMPLATE="""
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""
def main():
    parser = argparse.ArguementParser()
    parser.add_arguement("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text
    query_rag(query_text)

def query_rag(query_text: str):
    get_embedding_function = get_embedding_function()
    db = 

    results = db.similarity_search_with_score(query_text, k=3)

    context
