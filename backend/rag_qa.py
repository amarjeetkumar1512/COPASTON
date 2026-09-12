import chromadb
from pathlib import Path


CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "copaston_knowledge"

DOCUMENT_PATH = Path(
    "knowledge_base/documents/railway_maintenance_manual.txt"
)

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def load_document():
    if not DOCUMENT_PATH.exists():
        raise FileNotFoundError(
            f"Document not found: {DOCUMENT_PATH}"
        )

    return DOCUMENT_PATH.read_text(
        encoding="utf-8"
    )


def split_into_chunks(text):
    chunks = []

    start = 0

    while start < len(text):
        end = start + CHUNK_SIZE

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


def get_knowledge_collection():
    client = chromadb.PersistentClient(
        path=CHROMA_PATH
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME
    )

    # Load knowledge automatically if collection is empty
    if collection.count() == 0:

        document_text = load_document()

        chunks = split_into_chunks(
            document_text
        )

        if chunks:
            collection.add(
                ids=[
                    f"knowledge_{i}"
                    for i in range(len(chunks))
                ],
                documents=chunks
            )

    return collection


def search_knowledge(question, top_k=3):

    collection = get_knowledge_collection()

    results = collection.get(
        include=["documents"]
    )

    documents = results.get(
        "documents",
        []
    )

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
            question_words.intersection(
                document_words
            )
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
        for score, document
        in scored_documents[:top_k]
        if score > 0
    ]


def generate_answer(question, context):

    if not context:
        return (
            "The requested information is not "
            "available in the COPASTON knowledge base."
        )

    return (
        "According to the COPASTON railway "
        "maintenance knowledge base:\n\n"
        + "\n\n".join(context)
    )


if __name__ == "__main__":

    question = (
        "What should I do if the brake response is delayed?"
    )

    documents = search_knowledge(
        question
    )

    answer = generate_answer(
        question,
        documents
    )

    print("\nCOPASTON AI ANSWER")
    print("=" * 50)
    print(answer)