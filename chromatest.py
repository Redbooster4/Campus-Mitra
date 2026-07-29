import chromadb
import pandas as pd

client = chromadb.PersistentClient(path="./chroma_data")
collection = client.get_collection(name="7735b6b9-7ae8-495f-a0e8-d57e0b246703")

# 1. Fetch data
data = collection.get(include=["embeddings", "documents", "metadatas"])

# 2. Build DataFrame safely
df = pd.DataFrame({
    "id": data["ids"],
    "document": data["documents"],
    "metadata": [str(m) if m is not None else "" for m in data["metadatas"]],
    "embedding": list(data["embeddings"]) if data["embeddings"] is not None else []
})

print(df)