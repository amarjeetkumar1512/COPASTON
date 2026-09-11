from sqlalchemy.orm import Session

from app.agents.maintenance_tools import (
    create_maintenance_tool,
    get_maintenance_tool,
    get_all_maintenance_tool,
    update_maintenance_tool,
    delete_maintenance_tool,
    analyze_maintenance_tool,
)


class MaintenanceAgent:
    """
    Maintenance / O&M Agent

    Manages maintenance records through a controlled
    set of maintenance tools.
    """

    name = "Maintenance Agent"

    def list_maintenance(self, db: Session):
        return get_all_maintenance_tool(db)

    def get_maintenance(
        self,
        db: Session,
        maintenance_id: int,
    ):
        return get_maintenance_tool(
            db,
            maintenance_id,
        )

    def create_maintenance(
        self,
        db: Session,
        product_id: int,
        maintenance_type: str,
        description: str | None = None,
        due_date: str | None = None,
        status: str = "pending",
    ):
        return create_maintenance_tool(
            db=db,
            product_id=product_id,
            maintenance_type=maintenance_type,
            description=description,
            due_date=due_date,
            status=status,
        )

    def update_maintenance(
        self,
        db: Session,
        maintenance_id: int,
        maintenance_type: str,
        description: str | None = None,
        due_date: str | None = None,
        status: str = "pending",
    ):
        return update_maintenance_tool(
            db=db,
            maintenance_id=maintenance_id,
            maintenance_type=maintenance_type,
            description=description,
            due_date=due_date,
            status=status,
        )

    def delete_maintenance(
        self,
        db: Session,
        maintenance_id: int,
    ):
        return delete_maintenance_tool(
            db,
            maintenance_id,
        )

    def analyze_maintenance(
        self,
        db: Session,
        maintenance_id: int,
    ):
        return analyze_maintenance_tool(
            db,
            maintenance_id,
        )


maintenance_agent = MaintenanceAgent()