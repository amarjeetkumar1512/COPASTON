from sqlalchemy.orm import Session

from app.models.product import Product


def create_product_tool(
    db: Session,
    product_name: str,
    product_type: str,
    serial_number: str,
    manufacturer: str | None = None,
    manufacturing_date: str | None = None,
    status: str = "active",
):
    product = Product(
        product_name=product_name,
        product_type=product_type,
        serial_number=serial_number,
        manufacturer=manufacturer,
        manufacturing_date=manufacturing_date,
        status=status,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_product_tool(
    db: Session,
    product_id: int,
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        return None

    return product


def get_all_products_tool(db: Session):
    return db.query(Product).all()


def update_product_tool(
    db: Session,
    product_id: int,
    product_name: str,
    product_type: str,
    serial_number: str,
    manufacturer: str | None = None,
    manufacturing_date: str | None = None,
    status: str = "active",
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        return None

    product.product_name = product_name
    product.product_type = product_type
    product.serial_number = serial_number
    product.manufacturer = manufacturer
    product.manufacturing_date = manufacturing_date
    product.status = status

    db.commit()
    db.refresh(product)

    return product


def delete_product_tool(
    db: Session,
    product_id: int,
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        return False

    db.delete(product)
    db.commit()

    return True


def analyze_product_tool(
    db: Session,
    product_id: int,
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        return None

    return {
        "product_id": product.id,
        "product_name": product.product_name,
        "product_type": product.product_type,
        "manufacturer": product.manufacturer,
        "serial_number": product.serial_number,
        "manufacturing_date": product.manufacturing_date,
        "status": product.status,
        "recommendation": (
            "Product is active."
            if product.status == "active"
            else "Product status requires review."
        ),
    }