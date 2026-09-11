from sqlalchemy.orm import Session

from app.agents.safety_tools import (
    create_safety_incident_tool,
    get_safety_incident_tool,
    get_all_safety_incidents_tool,
    update_safety_incident_tool,
    delete_safety_incident_tool,
    analyze_safety_incident_tool,
)


class SafetyAgent:
    """
    Safety Agent

    Manages safety incidents through a controlled
    set of safety tools.
    """

    name = "Safety Agent"

    def list_incidents(self, db: Session):
        return get_all_safety_incidents_tool(db)

    def get_incident(
        self,
        db: Session,
        incident_id: int,
    ):
        return get_safety_incident_tool(
            db,
            incident_id,
        )

    def create_incident(
        self,
        db: Session,
        product_id: int,
        incident_type: str,
        severity: str,
        description: str | None = None,
        status: str = "open",
    ):
        return create_safety_incident_tool(
            db=db,
            product_id=product_id,
            incident_type=incident_type,
            severity=severity,
            description=description,
            status=status,
        )

    def update_incident(
        self,
        db: Session,
        incident_id: int,
        incident_type: str,
        severity: str,
        description: str | None = None,
        status: str = "open",
    ):
        return update_safety_incident_tool(
            db=db,
            incident_id=incident_id,
            incident_type=incident_type,
            severity=severity,
            description=description,
            status=status,
        )

    def delete_incident(
        self,
        db: Session,
        incident_id: int,
    ):
        return delete_safety_incident_tool(
            db,
            incident_id,
        )

    def analyze_incident(
        self,
        db: Session,
        incident_id: int,
    ):
        return analyze_safety_incident_tool(
            db,
            incident_id,
        )


safety_agent = SafetyAgent()