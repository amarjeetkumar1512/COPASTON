from sqlalchemy import Column, Integer, String, Date
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, nullable=False)
    product_type = Column(String, nullable=False)
    manufacturer = Column(String, nullable=True)
    serial_number = Column(String, unique=True, nullable=False)
    manufacturing_date = Column(Date, nullable=True)
    status = Column(String, default="active")