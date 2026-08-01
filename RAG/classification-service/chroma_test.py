import chromadb
from chromadb.utils import embedding_functions


sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="paraphrase-multilingual-MiniLM-L12-v2"
)

client = chromadb.PersistentClient(path="./chroma_test_data")

collection = client.get_or_create_collection(
    name="sbmp_test",
    embedding_function=sentence_transformer_ef
)

try:
    collection.delete(ids=collection.get()["ids"])
except:
    pass

collection.add(
    ids=[
        "doc1",
        "doc2",
        "doc3",
        "doc4"
    ],

    documents=[

        "The eligibility criteria for Computer Engineering diploma requires passing the 10th standard with at least 35% marks in Mathematics and Science.",

        "Hostel facilities are available for outstation students. Rooms are shared by 3 to 4 students and hostel fees are separate from tuition fees.",

        "The admission process includes online registration, document verification, merit list publication, counselling and final admission confirmation.",

        "Scholarships are available for eligible students belonging to economically weaker sections after submitting the required income certificate."
    ],

    metadatas=[
        {"topic": "eligibility"},
        {"topic": "hostel"},
        {"topic": "admission"},
        {"topic": "scholarship"}
    ]
)

print("=" * 60)
print("Documents stored:", collection.count())
print("=" * 60)

results = collection.query(
    query_texts=[
        "Eligibility criteria for Computer Engineering"
    ],
    n_results=2
)

print("\nTop Results\n")

for i, doc in enumerate(results["documents"][0]):

    print(f"{i+1}. {doc}\n")