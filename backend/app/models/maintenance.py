from sqlalchemy import Column, Integer, String, Text, Date
from app.database import Base


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        nullable=False
    )

    maintenance_type = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    due_date = Column(
        Date,
        nullable=True
    )

    status = Column(
        String,
        default="pending"
    )