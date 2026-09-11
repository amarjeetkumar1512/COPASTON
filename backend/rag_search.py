import chromadb
from sentence_transformers import SentenceTransformer


CHROMA_PATH = "./chroma_db"

MODEL_NAME = "all-MiniLM-L6-v2"

COLLECTION_NAME = "copaston_knowledge"


def search_knowledge(question, top_k=3):

    print("Loading embedding model...")

    model = SentenceTransformer(
        MODEL_NAME
    )

    print("Connecting to ChromaDB...")

    client = chromadb.PersistentClient(
        path=CHROMA_PATH
    )

    collection = client.get_collection(
        name=COLLECTION_NAME
    )

    question_embedding = model.encode(
        [question]
    ).tolist()

    results = collection.query(
        query_embeddings=question_embedding,
        n_results=top_k
    )

    return results


if __name__ == "__main__":

    question = (
        "What should I do if the brake response is delayed?"
    )

    results = search_knowledge(question)

    print("\nCOPASTON RAG SEARCH RESULTS")
    print("=" * 50)

    for i, document in enumerate(
        results["documents"][0],
        start=1
    ):
        print(f"\nRESULT {i}")
        print("-" * 50)
        print(document)