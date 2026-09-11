
import re

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.orchestrator_agent import orchestrator_agent


router = APIRouter(
    prefix="/agent/orchestrator",
    tags=["Orchestrator Agent"],
)


class OrchestratorRequest(BaseModel):
    request: str
    product_id: int | None = None
    incident_id: int | None = None
    maintenance_id: int | None = None


@router.post("/ask")
def ask_orchestrator(
    payload: OrchestratorRequest,
    db: Session = Depends(get_db),
):
    request_text = payload.request.lower().strip()

    product_id = payload.product_id
    incident_id = payload.incident_id
    maintenance_id = payload.maintenance_id

    # Automatically extract Product ID from the user's request
    if product_id is None:
        product_match = re.search(
            r"(?:product|product id|product record)\s*(?:id\s*)?(\d+)",
            request_text,
        )

        if product_match:
            product_id = int(product_match.group(1))

    # Automatically extract Safety Incident ID from the user's request
    if incident_id is None:
        incident_match = re.search(
            r"(?:incident|incident id|safety incident|safety incident id)\s*(?:id\s*)?(\d+)",
            request_text,
        )

        if incident_match:
            incident_id = int(incident_match.group(1))

    # Automatically extract Maintenance ID from the user's request
    if maintenance_id is None:
        maintenance_match = re.search(
            r"(?:maintenance|maintenance id|maintenance record|maintenance record id)\s*(?:id\s*)?(\d+)",
            request_text,
        )

        if maintenance_match:
            maintenance_id = int(maintenance_match.group(1))

    result = orchestrator_agent.run(
        db=db,
        request=payload.request,
        product_id=product_id,
        incident_id=incident_id,
        maintenance_id=maintenance_id,
    )

    return result
