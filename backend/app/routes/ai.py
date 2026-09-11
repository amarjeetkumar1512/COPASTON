from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from rag_qa import search_knowledge, generate_answer


router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)


class AIQuestion(BaseModel):
    question: str


@router.post("/ask")
def ask_ai(request: AIQuestion):

    try:
        documents = search_knowledge(
            request.question
        )

        context = "\n\n".join(documents)

        answer = generate_answer(
            request.question,
            context
        )

        return {
            "question": request.question,
            "answer": answer,
            "sources_used": len(documents)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )