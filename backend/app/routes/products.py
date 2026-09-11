from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    return products


@router.post("/")
def create_product(
    product_name: str,
    product_type: str,
    serial_number: str,
    manufacturer: str | None = None,
    manufacturing_date: str | None = None,
    status: str = "active",
    db: Session = Depends(get_db)
):
    new_product = Product(
        product_name=product_name,
        product_type=product_type,
        serial_number=serial_number,
        manufacturer=manufacturer,
        manufacturing_date=manufacturing_date,
        status=status
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@router.get("/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if product is None:
        return {
            "message": "Product not found"
        }

    return product

@router.put("/{product_id}")
def update_product(
    product_id: int,
    product_name: str,
    product_type: str,
    serial_number: str,
    manufacturer: str | None = None,
    manufacturing_date: str | None = None,
    status: str = "active",
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if product is None:
        return {
            "message": "Product not found"
        }

    product.product_name = product_name
    product.product_type = product_type
    product.serial_number = serial_number
    product.manufacturer = manufacturer
    product.manufacturing_date = manufacturing_date
    product.status = status

    db.commit()
    db.refresh(product)

    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if product is None:
        return {
            "message": "Product not found"
        }

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully",
        "product_id": product_id
    }