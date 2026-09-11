from sqlalchemy.orm import Session

from app.models.safety import SafetyIncident


def create_safety_incident_tool(
    db: Session,
    product_id: int,
    incident_type: str,
    severity: str,
    description: str | None = None,
    status: str = "open",
):
    incident = SafetyIncident(
        product_id=product_id,
        incident_type=incident_type,
        severity=severity,
        description=description,
        status=status,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


def get_safety_incident_tool(
    db: Session,
    incident_id: int,
):
    incident = (
        db.query(SafetyIncident)
        .filter(SafetyIncident.id == incident_id)
        .first()
    )

    if incident is None:
        return None

    return incident


def get_all_safety_incidents_tool(db: Session):
    return db.query(SafetyIncident).all()


def update_safety_incident_tool(
    db: Session,
    incident_id: int,
    incident_type: str,
    severity: str,
    description: str | None = None,
    status: str = "open",
):
    incident = (
        db.query(SafetyIncident)
        .filter(SafetyIncident.id == incident_id)
        .first()
    )

    if incident is None:
        return None

    incident.incident_type = incident_type
    incident.severity = severity
    incident.description = description
    incident.status = status

    db.commit()
    db.refresh(incident)

    return incident


def delete_safety_incident_tool(
    db: Session,
    incident_id: int,
):
    incident = (
        db.query(SafetyIncident)
        .filter(SafetyIncident.id == incident_id)
        .first()
    )

    if incident is None:
        return False

    db.delete(incident)
    db.commit()

    return True


def analyze_safety_incident_tool(
    db: Session,
    incident_id: int,
):
    incident = (
        db.query(SafetyIncident)
        .filter(SafetyIncident.id == incident_id)
        .first()
    )

    if incident is None:
        return None

    if incident.severity.lower() == "high":
        recommendation = (
            "High severity safety incident. "
            "Immediate investigation and corrective action required."
        )
    elif incident.severity.lower() == "medium":
        recommendation = (
            "Medium severity safety incident. "
            "Investigation and corrective action should be scheduled."
        )
    else:
        recommendation = (
            "Low severity safety incident. "
            "Monitor and record appropriate corrective action."
        )

    return {
        "incident_id": incident.id,
        "product_id": incident.product_id,
        "incident_type": incident.incident_type,
        "severity": incident.severity,
        "description": incident.description,
        "status": incident.status,
        "recommendation": recommendation,
    }