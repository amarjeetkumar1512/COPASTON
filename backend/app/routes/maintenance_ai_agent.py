from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.maintenance_ai_agent import maintenance_ai_agent


router = APIRouter(
    prefix="/agent/maintenance",
    tags=["Maintenance AI Agent"],
)


class MaintenanceAIRequest(BaseModel):
    request: str
    maintenance_id: int | None = None


@router.post("/ask")
def ask_maintenance_ai(
    request: MaintenanceAIRequest,
    db: Session = Depends(get_db),
):
    result = maintenance_ai_agent.run(
        db=db,
        request=request.request,
        maintenance_id=request.maintenance_id,
    )

    return result