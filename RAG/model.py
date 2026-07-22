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
You are the AI Admission Assistant for Shri Bhagubhai Mafatlal Polytechnic and College of Engineering(SBMP).
Answer the student's question using ONLY the following context, which is taken
directly from official SBMP admission documents:

{context}

---

Instructions:
- Answer the question based only on the above context.
- Be clear, concise, and helpful — the user is a prospective student or parent.
- If the answer is NOT found in the context, respond exactly with:
  "I don't have that information right now. I'm connecting you with an admission counselor for further help."
- Do not make up fees, dates, or eligibility criteria that are not in the context.

Question: {question}
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

    context_text="\n\n---\n\n".join([doc.page_content for doc, _score in results])

    prompt_template=ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt=prompt_template.format(context=context_text, question=query_text)
    print(prompt)

    sources=[doc.metadata.get("id", None) for doc, _score in results]

    formatted_response = f"Response: {response_text}\nSources: {sources}"
    print(formatted_response)
    return response_text

if __name__ == "__main__":
    main()