from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.safety_agent import safety_agent


router = APIRouter(
    prefix="/agent/safety",
    tags=["Safety Agent"],
)


@router.get("/incidents")
def agent_list_incidents(
    db: Session = Depends(get_db),
):
    incidents = safety_agent.list_incidents(db)

    return {
        "agent": safety_agent.name,
        "count": len(incidents),
        "incidents": incidents,
    }


@router.get("/incidents/{incident_id}")
def agent_get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    incident = safety_agent.get_incident(
        db,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Safety incident not found",
        )

    return {
        "agent": safety_agent.name,
        "incident": incident,
    }


@router.get("/incidents/{incident_id}/analysis")
def agent_analyze_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    analysis = safety_agent.analyze_incident(
        db,
        incident_id,
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Safety incident not found",
        )

    return {
        "agent": safety_agent.name,
        "analysis": analysis,
    }


@router.post("/incidents")
def agent_create_incident(
    product_id: int,
    incident_type: str,
    severity: str,
    description: str | None = None,
    status: str = "open",
    db: Session = Depends(get_db),
):
    incident = safety_agent.create_incident(
        db=db,
        product_id=product_id,
        incident_type=incident_type,
        severity=severity,
        description=description,
        status=status,
    )

    return {
        "agent": safety_agent.name,
        "incident": incident,
    }


@router.put("/incidents/{incident_id}")
def agent_update_incident(
    incident_id: int,
    incident_type: str,
    severity: str,
    description: str | None = None,
    status: str = "open",
    db: Session = Depends(get_db),
):
    incident = safety_agent.update_incident(
        db=db,
        incident_id=incident_id,
        incident_type=incident_type,
        severity=severity,
        description=description,
        status=status,
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Safety incident not found",
        )

    return {
        "agent": safety_agent.name,
        "incident": incident,
    }


@router.delete("/incidents/{incident_id}")
def agent_delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
):
    deleted = safety_agent.delete_incident(
        db,
        incident_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Safety incident not found",
        )

    return {
        "agent": safety_agent.name,
        "message": "Safety incident deleted successfully",
        "incident_id": incident_id,
    }