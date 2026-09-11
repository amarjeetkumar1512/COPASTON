from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class SafetyIncident(Base):
    __tablename__ = "safety_incidents"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        nullable=False
    )

    incident_type = Column(
        String,
        nullable=False
    )

    severity = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    status = Column(
        String,
        default="open"
    )