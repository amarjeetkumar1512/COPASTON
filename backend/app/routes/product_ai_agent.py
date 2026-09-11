from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.product_ai_agent import product_ai_agent


router = APIRouter(
    prefix="/agent/product",
    tags=["Product AI Agent"],
)


class ProductAIRequest(BaseModel):
    request: str
    product_id: int | None = None


@router.post("/ask")
def ask_product_ai(
    request: ProductAIRequest,
    db: Session = Depends(get_db),
):
    result = product_ai_agent.run(
        db=db,
        request=request.request,
        product_id=request.product_id,
    )

    return result