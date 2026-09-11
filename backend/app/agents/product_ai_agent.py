
import requests

from sqlalchemy.orm import Session

from app.agents.product_agent import product_agent


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:0.5b"


class ProductAIAgent:
    """
    AI Decision Layer for Product Lifecycle Agent.

    Uses Ollama to understand the user's request
    and routes the request to the appropriate
    Product Lifecycle Agent operation.
    """

    name = "Product AI Agent"

    def understand_request(self, request: str) -> str:
        text = request.lower().strip()

        # Reliable keyword detection for ANALYZE requests.
        # This must come BEFORE GET so that requests such as
        # "Analyze product 1" are correctly classified.

        if any(keyword in text for keyword in [
            "analyze product",
            "product analysis",
            "product status",
            "product recommendation",
            "product condition",
            "product health",
            "lifecycle analysis",
        ]):
            return "ANALYZE"

        # Reliable keyword detection for clear GET requests.

        if any(keyword in text for keyword in [
            "get product",
            "product details",
            "product detail",
            "details of product",
            "detail of product",
            "specific product",
        ]):
            return "GET"

        # Reliable keyword detection for clear LIST requests.

        if any(keyword in text for keyword in [
            "show all products",
            "show products",
            "list products",
            "list all products",
            "all products",
            "available products",
            "product list",
        ]):
            return "LIST"

        prompt = f"""
You are the Product AI Agent of COPASTON.

Classify the user's request into exactly ONE action.

Allowed actions:

LIST
GET
ANALYZE
UNKNOWN

Rules:

LIST:
User wants to see all products, product list, or available products.

GET:
User wants details or information about one specific product.

ANALYZE:
User wants product analysis, product status, recommendation,
condition, health, or lifecycle analysis.

UNKNOWN:
The request is unrelated or cannot be classified.

User request:
{request}

IMPORTANT:
Return ONLY ONE WORD from this list:
LIST
GET
ANALYZE
UNKNOWN
"""

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )

        response.raise_for_status()

        result = response.json()

        raw_response = result.get(
            "response",
            "",
        ).strip().upper()

        # First try exact response.

        if raw_response in {
            "LIST",
            "GET",
            "ANALYZE",
            "UNKNOWN",
        }:
            return raw_response

        # Handle cases where the small local model
        # returns extra words around the decision.

        if "ANALYZE" in raw_response:
            return "ANALYZE"

        if "LIST" in raw_response:
            return "LIST"

        if "GET" in raw_response:
            return "GET"

        return "UNKNOWN"

    def run(
        self,
        db: Session,
        request: str,
        product_id: int | None = None,
    ):
        decision = self.understand_request(request)

        if decision == "LIST":
            products = product_agent.list_products(db)

            return {
                "agent": self.name,
                "decision": decision,
                "result": {
                    "count": len(products),
                    "products": products,
                },
            }

        if decision == "GET":
            if product_id is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": (
                        "Product ID is required to get "
                        "a specific product."
                    ),
                }

            product = product_agent.get_product(
                db,
                product_id,
            )

            if product is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": "Product not found.",
                }

            return {
                "agent": self.name,
                "decision": decision,
                "result": product,
            }

        if decision == "ANALYZE":
            if product_id is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": (
                        "Product ID is required "
                        "for product analysis."
                    ),
                }

            analysis = product_agent.analyze_product(
                db,
                product_id,
            )

            if analysis is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": "Product not found.",
                }

            return {
                "agent": self.name,
                "decision": decision,
                "result": analysis,
            }

        return {
            "agent": self.name,
            "decision": "UNKNOWN",
            "message": (
                "The Product AI Agent could not determine "
                "the required product operation."
            ),
        }


product_ai_agent = ProductAIAgent()
