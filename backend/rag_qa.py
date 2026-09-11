import chromadb
import requests
from sentence_transformers import SentenceTransformer


CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "copaston_knowledge"

MODEL_NAME = "all-MiniLM-L6-v2"

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:0.5b"


def search_knowledge(question, top_k=3):

    model = SentenceTransformer(MODEL_NAME)

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

    return results["documents"][0]


def generate_answer(question, context):

    prompt = f"""
You are COPASTON, an AI assistant for railway
product safety and maintenance.

Answer the user's question using ONLY the
provided knowledge.

If the answer is not available in the knowledge,
say that the information is not available.

Knowledge:
{context}

User Question:
{question}

Provide a clear and practical answer.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )

    response.raise_for_status()

    return response.json()["response"]


if __name__ == "__main__":

    question = (
        "What should I do if the brake response is delayed?"
    )

    documents = search_knowledge(question)

    context = "\n\n".join(documents)

    answer = generate_answer(
        question,
        context
    )

    print("\nCOPASTON AI ANSWER")
    print("=" * 50)
    print(answer)
    