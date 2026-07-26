from langchain_ollama import OllamaEmbeddings

def get_embedding_function():
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    input_text = "The meaning of life is 42"
    vector = embeddings.embed_query(input_text)
    print(vector)
    return embeddings

# if __name__ == "__main__":
#     get_embedding_function()