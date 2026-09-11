from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.safety_ai_agent import safety_ai_agent


router = APIRouter(
    prefix="/agent/safety",
    tags=["Safety AI Agent"],
)


class SafetyAIRequest(BaseModel):
    request: str
    incident_id: int | None = None


@router.post("/ask")
def ask_safety_ai(
    request: SafetyAIRequest,
    db: Session = Depends(get_db),
):
    result = safety_ai_agent.run(
        db=db,
        request=request.request,
        incident_id=request.incident_id,
    )

    return result