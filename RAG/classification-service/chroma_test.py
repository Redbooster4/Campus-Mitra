import os
import chromadb
from chromadb.utils import embedding_functions

try:
    ollama_ef = embedding_functions.OllamaEmbeddingFunction(
        url="http://localhost:11434/api/embeddings",
        model_name="nomic-embed-text"
    )
except Exception:
    from langchain_ollama import OllamaEmbeddings
    class OllamaEmbeddingAdapter:
        def __init__(self, model_name="nomic-embed-text"):
            self.ef = OllamaEmbeddings(model=model_name)
        def __call__(self, input):
            return self.ef.embed_documents(input)
    ollama_ef = OllamaEmbeddingAdapter("nomic-embed-text")

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db_data"))

client = chromadb.PersistentClient(path=db_path)

collections = client.list_collections()
collection_name = collections[0].name if collections else "sbmp_final_year_project"

collection = client.get_or_create_collection(
    name=collection_name,
    embedding_function=ollama_ef
)

print("=" * 60)
print("Using Chroma DB path:", db_path)
print("Collection name:", collection_name)
print("Total documents in collection:", collection.count())
print("=" * 60)

results = collection.query(
    query_texts=[
        "Eligibility criteria for Computer Engineering"
    ],
    n_results=3
)

print("\nTop Results\n")

if results and results.get("documents") and results["documents"][0]:
    for i, doc in enumerate(results["documents"][0]):
        print(f"{i+1}. {doc}\n")
else:
    print("No matching documents found in collection.")
     