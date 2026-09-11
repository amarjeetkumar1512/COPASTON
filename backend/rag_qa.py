import chromadb
import requests


CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "copaston_knowledge"

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:0.5b"


def search_knowledge(question, top_k=3):

    client = chromadb.PersistentClient(
        path=CHROMA_PATH
    )

    collection = client.get_collection(
        name=COLLECTION_NAME
    )

    results = collection.get(
        include=["documents"]
    )

    documents = results.get("documents", [])

    if not documents:
        return []

    question_words = set(
        question.lower().split()
    )

    scored_documents = []

    for document in documents:

        document_words = set(
            document.lower().split()
        )

        score = len(
            question_words.intersection(document_words)
        )

        scored_documents.append(
            (score, document)
        )

    scored_documents.sort(
        key=lambda x: x[0],
        reverse=True
    )

    return [
        document
        for score, document in scored_documents[:top_k]
    ]


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