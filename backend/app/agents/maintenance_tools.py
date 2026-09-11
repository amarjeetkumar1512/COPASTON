from sqlalchemy.orm import Session

from app.models.maintenance import MaintenanceRecord


def create_maintenance_tool(
    db: Session,
    product_id: int,
    maintenance_type: str,
    description: str | None = None,
    due_date: str | None = None,
    status: str = "pending",
):
    record = MaintenanceRecord(
        product_id=product_id,
        maintenance_type=maintenance_type,
        description=description,
        due_date=due_date,
        status=status,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def get_maintenance_tool(
    db: Session,
    maintenance_id: int,
):
    record = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.id == maintenance_id)
        .first()
    )

    if record is None:
        return None

    return record


def get_all_maintenance_tool(db: Session):
    return db.query(MaintenanceRecord).all()


def update_maintenance_tool(
    db: Session,
    maintenance_id: int,
    maintenance_type: str,
    description: str | None = None,
    due_date: str | None = None,
    status: str = "pending",
):
    record = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.id == maintenance_id)
        .first()
    )

    if record is None:
        return None

    record.maintenance_type = maintenance_type
    record.description = description
    record.due_date = due_date
    record.status = status

    db.commit()
    db.refresh(record)

    return record


def delete_maintenance_tool(
    db: Session,
    maintenance_id: int,
):
    record = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.id == maintenance_id)
        .first()
    )

    if record is None:
        return False

    db.delete(record)
    db.commit()

    return True


def analyze_maintenance_tool(
    db: Session,
    maintenance_id: int,
):
    record = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.id == maintenance_id)
        .first()
    )

    if record is None:
        return None

    if record.status.lower() == "overdue":
        recommendation = (
            "Maintenance is overdue. "
            "Immediate maintenance action is recommended."
        )
    elif record.status.lower() == "pending":
        recommendation = (
            "Maintenance is pending. "
            "Complete the scheduled maintenance as planned."
        )
    elif record.status.lower() == "completed":
        recommendation = (
            "Maintenance has been completed. "
            "Continue regular preventive maintenance."
        )
    else:
        recommendation = (
            "Maintenance status requires review."
        )

    return {
        "maintenance_id": record.id,
        "product_id": record.product_id,
        "maintenance_type": record.maintenance_type,
        "description": record.description,
        "due_date": record.due_date,
        "status": record.status,
        "recommendation": recommendation,
    }