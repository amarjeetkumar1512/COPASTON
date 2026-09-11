from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance import MaintenanceRecord


router = APIRouter(
    prefix="/maintenance",
    tags=["O&M / Maintenance"]
)


@router.get("/")
def get_maintenance_records(
    db: Session = Depends(get_db)
):
    records = db.query(MaintenanceRecord).all()

    return records


@router.post("/")
def create_maintenance_record(
    product_id: int,
    maintenance_type: str,
    description: str | None = None,
    due_date: str | None = None,
    status: str = "pending",
    db: Session = Depends(get_db)
):
    new_record = MaintenanceRecord(
        product_id=product_id,
        maintenance_type=maintenance_type,
        description=description,
        due_date=due_date,
        status=status
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


@router.get("/{maintenance_id}")
def get_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.id == maintenance_id
    ).first()

    if record is None:
        return {
            "message": "Maintenance record not found"
        }

    return record


@router.put("/{maintenance_id}")
def update_maintenance_record(
    maintenance_id: int,
    product_id: int,
    maintenance_type: str,
    description: str | None = None,
    due_date: str | None = None,
    status: str = "pending",
    db: Session = Depends(get_db)
):
    record = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.id == maintenance_id
    ).first()

    if record is None:
        return {
            "message": "Maintenance record not found"
        }

    record.product_id = product_id
    record.maintenance_type = maintenance_type
    record.description = description
    record.due_date = due_date
    record.status = status

    db.commit()
    db.refresh(record)

    return record


@router.delete("/{maintenance_id}")
def delete_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    record = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.id == maintenance_id
    ).first()

    if record is None:
        return {
            "message": "Maintenance record not found"
        }

    db.delete(record)
    db.commit()

    return {
        "message": "Maintenance record deleted successfully",
        "maintenance_id": maintenance_id
    }