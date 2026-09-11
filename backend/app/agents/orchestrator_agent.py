import requests

from sqlalchemy.orm import Session

from app.agents.product_ai_agent import product_ai_agent
from app.agents.safety_ai_agent import safety_ai_agent
from app.agents.maintenance_ai_agent import maintenance_ai_agent
from app.agents.rag_agent import rag_agent


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:0.5b"


class OrchestratorAgent:
    name = "Orchestrator Agent"

    def understand_request(self, request: str) -> str:
        text = request.lower().strip()

        # PRODUCT ROUTING
        product_keywords = [
            "product",
            "products",
            "equipment",
            "serial number",
            "manufacturer",
            "product lifecycle",
            "product status",
        ]

        if any(keyword in text for keyword in product_keywords):
            return "PRODUCT"

        # SAFETY ROUTING
        safety_keywords = [
            "safety",
            "safety incident",
            "safety incidents",
            "incident",
            "incidents",
            "accident",
            "failure",
            "severity",
            "risk",
            "safety risk",
            "corrective action",
        ]

        if any(keyword in text for keyword in safety_keywords):
            return "SAFETY"

        # MAINTENANCE ROUTING
        maintenance_keywords = [
            "maintenance",
            "maintenances",
            "maintenance record",
            "maintenance records",
            "maintenance schedule",
            "preventive maintenance",
            "servicing",
            "service",
            "overdue maintenance",
        ]

        if any(keyword in text for keyword in maintenance_keywords):
            return "MAINTENANCE"

        # RAG / KNOWLEDGE ROUTING
        knowledge_keywords = [
            "how should",
            "how do i",
            "what should i do",
            "procedure",
            "procedures",
            "manual",
            "inspection",
            "inspect",
            "brake",
            "hydraulic",
            "engine",
            "electrical",
            "tyre",
            "wheel",
            "maintenance procedure",
            "safety procedure",
            "knowledge",
        ]

        if any(keyword in text for keyword in knowledge_keywords):
            return "RAG"

        # AI FALLBACK
        prompt = f"""
You are the Orchestrator Agent of COPASTON.

Choose which specialist agent should handle the request.

Available agents:

PRODUCT
SAFETY
MAINTENANCE
RAG
UNKNOWN

Rules:

PRODUCT:
Requests about products, equipment,
product details, product list,
product status, serial number,
manufacturer, or product lifecycle.

SAFETY:
Requests about safety incidents,
accidents, failures, severity,
risk assessment, or safety analysis.

MAINTENANCE:
Requests about maintenance records,
maintenance schedules, preventive maintenance,
servicing, overdue maintenance,
or maintenance analysis.

RAG:
Requests asking for maintenance procedures,
safety procedures, inspection instructions,
technical knowledge, railway maintenance
manual information, or "what should I do"
questions that require knowledge-base information.

UNKNOWN:
Requests unrelated to COPASTON.

User request:
{text}

Return ONLY ONE WORD:

PRODUCT
SAFETY
MAINTENANCE
RAG
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
            ""
        ).strip().upper()

        if raw_response in {
            "PRODUCT",
            "SAFETY",
            "MAINTENANCE",
            "RAG",
            "UNKNOWN",
        }:
            return raw_response

        if "PRODUCT" in raw_response:
            return "PRODUCT"

        if "SAFETY" in raw_response:
            return "SAFETY"

        if "MAINTENANCE" in raw_response:
            return "MAINTENANCE"

        if "RAG" in raw_response:
            return "RAG"

        return "UNKNOWN"

    def run(
        self,
        db: Session,
        request: str,
        product_id: int | None = None,
        incident_id: int | None = None,
        maintenance_id: int | None = None,
    ):
        decision = self.understand_request(request)

        # PRODUCT
        if decision == "PRODUCT":
            result = product_ai_agent.run(
                db=db,
                request=request,
                product_id=product_id,
            )

            return {
                "agent": self.name,
                "decision": decision,
                "delegated_to": "Product AI Agent",
                "result": result,
            }

        # SAFETY
        if decision == "SAFETY":
            result = safety_ai_agent.run(
                db=db,
                request=request,
                incident_id=incident_id,
            )

            return {
                "agent": self.name,
                "decision": decision,
                "delegated_to": "Safety AI Agent",
                "result": result,
            }

        # MAINTENANCE
        if decision == "MAINTENANCE":
            result = maintenance_ai_agent.run(
                db=db,
                request=request,
                maintenance_id=maintenance_id,
            )

            return {
                "agent": self.name,
                "decision": decision,
                "delegated_to": "Maintenance AI Agent",
                "result": result,
            }

        # RAG
        if decision == "RAG":
            result = rag_agent.answer(request)

            return {
                "agent": self.name,
                "decision": decision,
                "delegated_to": "RAG Knowledge Agent",
                "result": result,
            }

        # UNKNOWN
        return {
            "agent": self.name,
            "decision": "UNKNOWN",
            "message": (
                "The Orchestrator Agent could not determine "
                "which specialist agent should handle the request."
            ),
        }


orchestrator_agent = OrchestratorAgent()