import argparse
import chromadb

from langchain_chroma import Chroma
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from get_embedding_function import get_embedding_function


model = ChatOllama(
    model="llama3.2:3b",
    validate_model_on_init=True,
    temperature=0.8,
    num_predict=256,
    # other params ...
)
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text
    query_rag(query_text)

def query_rag(query_text: str):
    embed_func=get_embedding_function()
    db=Chroma(
        client=chroma_client, 
        collection_name="", 
        embedding_function=embed_func
    )

    results = db.similarity_search_with_score(query_text, k=3)

    context_text="\n\n---\n\n".join([doc.page_content for doc, _score in results])

    prompt_template=ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt=prompt_template.format(context=context_text, question=query_text)
    print(prompt)

    sources=[doc.metadata.get("id", None) for doc, _score in results]

    response_text = model.invoke(prompt)
    formatted_response = f"Response: {response_text}\nSources: {sources}"
    print(formatted_response)
    return response_text

if __name__ == "__main__":
    main()