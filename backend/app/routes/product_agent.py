from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.product_agent import product_agent


router = APIRouter(
    prefix="/agent/product",
    tags=["Product Lifecycle Agent"],
)


@router.get("/products")
def agent_list_products(
    db: Session = Depends(get_db),
):
    products = product_agent.list_products(db)

    return {
        "agent": product_agent.name,
        "count": len(products),
        "products": products,
    }


@router.get("/products/{product_id}")
def agent_get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = product_agent.get_product(
        db,
        product_id,
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return {
        "agent": product_agent.name,
        "product": product,
    }


@router.get("/products/{product_id}/analysis")
def agent_analyze_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    analysis = product_agent.analyze_product(
        db,
        product_id,
    )

    if analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return {
        "agent": product_agent.name,
        "analysis": analysis,
    }


@router.delete("/products/{product_id}")
def agent_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    deleted = product_agent.delete_product(
        db,
        product_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return {
        "agent": product_agent.name,
        "message": "Product deleted successfully",
        "product_id": product_id,
    }