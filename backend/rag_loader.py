from pathlib import Path


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


if __name__ == "__main__":
    document_text = load_document()

    chunks = split_into_chunks(document_text)

    print("COPASTON KNOWLEDGE BASE LOADED SUCCESSFULLY!")
    print("---------------------------------------------")
    print(f"Total characters: {len(document_text)}")
    print(f"Total chunks: {len(chunks)}")

    print("\nFIRST CHUNK")
    print("---------------------------------------------")
    print(chunks[0])