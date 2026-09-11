from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.maintenance_agent import maintenance_agent


router = APIRouter(
    prefix="/agent/maintenance",
    tags=["Maintenance Agent"],
)


@router.get("/records")
def agent_list_maintenance(
    db: Session = Depends(get_db),
):
    records = maintenance_agent.list_maintenance(db)

    return {
        "agent": maintenance_agent.name,
        "count": len(records),
        "records": records,
    }


@router.get("/records/{maintenance_id}")
def agent_get_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
):
    record = maintenance_agent.get_maintenance(
        db,
        maintenance_id,
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return {
        "agent": maintenance_agent.name,
        "record": record,
    }


@router.get("/records/{maintenance_id}/analysis")
def agent_analyze_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
):
    analysis = maintenance_agent.analyze_maintenance(
        db,
        maintenance_id,
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return {
        "agent": maintenance_agent.name,
        "analysis": analysis,
    }


@router.post("/records")
def agent_create_maintenance(
    product_id: int,
    maintenance_type: str,
    description: str | None = None,
    due_date: str | None = None,
    status: str = "pending",
    db: Session = Depends(get_db),
):
    record = maintenance_agent.create_maintenance(
        db=db,
        product_id=product_id,
        maintenance_type=maintenance_type,
        description=description,
        due_date=due_date,
        status=status,
    )

    return {
        "agent": maintenance_agent.name,
        "record": record,
    }


@router.put("/records/{maintenance_id}")
def agent_update_maintenance(
    maintenance_id: int,
    maintenance_type: str,
    description: str | None = None,
    due_date: str | None = None,
    status: str = "pending",
    db: Session = Depends(get_db),
):
    record = maintenance_agent.update_maintenance(
        db=db,
        maintenance_id=maintenance_id,
        maintenance_type=maintenance_type,
        description=description,
        due_date=due_date,
        status=status,
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return {
        "agent": maintenance_agent.name,
        "record": record,
    }


@router.delete("/records/{maintenance_id}")
def agent_delete_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
):
    deleted = maintenance_agent.delete_maintenance(
        db,
        maintenance_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Maintenance record not found",
        )

    return {
        "agent": maintenance_agent.name,
        "message": "Maintenance record deleted successfully",
        "maintenance_id": maintenance_id,
    }