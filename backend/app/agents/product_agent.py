from sqlalchemy.orm import Session

from app.agents.product_tools import (
    create_product_tool,
    get_product_tool,
    get_all_products_tool,
    update_product_tool,
    delete_product_tool,
    analyze_product_tool,
)


class ProductLifecycleAgent:
    """
    Product Lifecycle Agent

    This agent manages product lifecycle operations
    through a controlled set of product tools.
    """

    name = "Product Lifecycle Agent"

    def list_products(self, db: Session):
        return get_all_products_tool(db)

    def get_product(
        self,
        db: Session,
        product_id: int,
    ):
        return get_product_tool(
            db,
            product_id,
        )

    def create_product(
        self,
        db: Session,
        product_name: str,
        product_type: str,
        serial_number: str,
        manufacturer: str | None = None,
        manufacturing_date: str | None = None,
        status: str = "active",
    ):
        return create_product_tool(
            db=db,
            product_name=product_name,
            product_type=product_type,
            serial_number=serial_number,
            manufacturer=manufacturer,
            manufacturing_date=manufacturing_date,
            status=status,
        )

    def update_product(
        self,
        db: Session,
        product_id: int,
        product_name: str,
        product_type: str,
        serial_number: str,
        manufacturer: str | None = None,
        manufacturing_date: str | None = None,
        status: str = "active",
    ):
        return update_product_tool(
            db=db,
            product_id=product_id,
            product_name=product_name,
            product_type=product_type,
            serial_number=serial_number,
            manufacturer=manufacturer,
            manufacturing_date=manufacturing_date,
            status=status,
        )

    def delete_product(
        self,
        db: Session,
        product_id: int,
    ):
        return delete_product_tool(
            db,
            product_id,
        )

    def analyze_product(
        self,
        db: Session,
        product_id: int,
    ):
        return analyze_product_tool(
            db,
            product_id,
        )


product_agent = ProductLifecycleAgent()