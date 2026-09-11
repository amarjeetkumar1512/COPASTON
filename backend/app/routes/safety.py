from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.safety import SafetyIncident


router = APIRouter(
    prefix="/safety",
    tags=["Safety"]
)


@router.get("/")
def get_safety_incidents(
    db: Session = Depends(get_db)
):
    incidents = db.query(SafetyIncident).all()

    return incidents


@router.post("/")
def create_safety_incident(
    product_id: int,
    incident_type: str,
    severity: str,
    description: str | None = None,
    status: str = "open",
    db: Session = Depends(get_db)
):
    new_incident = SafetyIncident(
        product_id=product_id,
        incident_type=incident_type,
        severity=severity,
        description=description,
        status=status
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident


@router.get("/{incident_id}")
def get_safety_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(SafetyIncident).filter(
        SafetyIncident.id == incident_id
    ).first()

    if incident is None:
        return {
            "message": "Safety incident not found"
        }

    return incident


@router.put("/{incident_id}")
def update_safety_incident(
    incident_id: int,
    product_id: int,
    incident_type: str,
    severity: str,
    description: str | None = None,
    status: str = "open",
    db: Session = Depends(get_db)
):
    incident = db.query(SafetyIncident).filter(
        SafetyIncident.id == incident_id
    ).first()

    if incident is None:
        return {
            "message": "Safety incident not found"
        }

    incident.product_id = product_id
    incident.incident_type = incident_type
    incident.severity = severity
    incident.description = description
    incident.status = status

    db.commit()
    db.refresh(incident)

    return incident


@router.delete("/{incident_id}")
def delete_safety_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = db.query(SafetyIncident).filter(
        SafetyIncident.id == incident_id
    ).first()

    if incident is None:
        return {
            "message": "Safety incident not found"
        }

    db.delete(incident)
    db.commit()

    return {
        "message": "Safety incident deleted successfully",
        "incident_id": incident_id
    }