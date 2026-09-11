from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


DOCUMENT_PATH = Path(
    "knowledge_base/documents/railway_maintenance_manual.txt"
)

CHROMA_PATH = "./chroma_db"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def load_document():
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


def create_vector_store():

    print("Loading document...")

    text = load_document()

    chunks = split_into_chunks(text)

    print(f"Total chunks: {len(chunks)}")

    print("Loading embedding model...")

    model = SentenceTransformer(
        "all-MiniLM-L6-v2"
    )

    print("Connecting to ChromaDB...")

    client = chromadb.PersistentClient(
        path=CHROMA_PATH
    )

    collection = client.get_or_create_collection(
        name="copaston_knowledge"
    )

    embeddings = model.encode(
        chunks
    ).tolist()

    ids = [
        f"chunk_{i}"
        for i in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings
    )

    print("\nCOPASTON VECTOR STORE CREATED SUCCESSFULLY!")
    print(f"Documents stored: {collection.count()}")


if __name__ == "__main__":
    create_vector_store()