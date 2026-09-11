from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.rag_agent import rag_agent


router = APIRouter(
    prefix="/agent/rag",
    tags=["RAG Knowledge Agent"],
)


class RAGRequest(BaseModel):
    question: str


@router.post("/ask")
def ask_rag_agent(request: RAGRequest):
    result = rag_agent.answer(
        request.question
    )

    return {
        "agent": rag_agent.name,
        "result": result,
    }


@router.post("/search")
def search_rag_agent(request: RAGRequest):
    result = rag_agent.search(
        request.question
    )

    return {
        "agent": rag_agent.name,
        "result": result,
    }