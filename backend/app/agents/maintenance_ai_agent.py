import requests

from sqlalchemy.orm import Session

from app.agents.maintenance_agent import maintenance_agent


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:0.5b"


class MaintenanceAIAgent:
    name = "Maintenance AI Agent"

    def understand_request(self, request: str) -> str:
        text = request.lower().strip()

        # Reliable keyword detection for clear requests
        # This prevents the small Ollama model from returning UNKNOWN
        # for obvious maintenance operations.

        if any(keyword in text for keyword in [
            "analyze maintenance",
            "analyze maintenance record",
            "maintenance analysis",
            "maintenance status",
            "maintenance recommendation",
            "maintenance risk",
            "maintenance advice",
            "corrective action",
            "overdue maintenance",
            "analyze",
            "analysis",
            "recommendation",
            "risk assessment",
            "risk",
            "advice",
        ]):
            return "ANALYZE"

        if any(keyword in text for keyword in [
            "show all maintenance",
            "show maintenance records",
            "list maintenance",
            "list maintenance records",
            "all maintenance records",
            "all maintenance",
            "maintenance records",
            "maintenance schedule",
            "maintenance list",
        ]):
            return "LIST"

        if any(keyword in text for keyword in [
            "get maintenance",
            "get maintenance record",
            "maintenance details",
            "maintenance detail",
            "details of maintenance",
            "detail of maintenance",
            "specific maintenance record",
        ]):
            return "GET"

        prompt = f"""
You are the Maintenance AI Agent of COPASTON.

Classify the user's request into exactly ONE action.

Allowed actions:

LIST
GET
ANALYZE
UNKNOWN

Rules:

LIST:
The user wants to see all maintenance records,
maintenance schedules, or maintenance lists.

GET:
The user wants details of one specific
maintenance record.

ANALYZE:
The user wants maintenance analysis,
maintenance status, risk assessment,
recommendation, corrective action,
overdue analysis, or maintenance advice.

UNKNOWN:
The request is unrelated to maintenance.

User request:
{request}

IMPORTANT:
Return ONLY ONE WORD.

For analysis, recommendation, status analysis,
risk assessment, corrective action, or advice,
return:

ANALYZE

For list or all records, return:

LIST

For details of one record, return:

GET

Otherwise return:

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
            "LIST",
            "GET",
            "ANALYZE",
            "UNKNOWN",
        }:
            return raw_response

        if "ANALYZE" in raw_response:
            return "ANALYZE"

        if "RECOMMENDATION" in raw_response:
            return "ANALYZE"

        if "CORRECTIVE" in raw_response:
            return "ANALYZE"

        if "RISK" in raw_response:
            return "ANALYZE"

        if "OVERDUE" in raw_response:
            return "ANALYZE"

        if "ADVICE" in raw_response:
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
        maintenance_id: int | None = None,
    ):
        decision = self.understand_request(request)

        if decision == "LIST":
            records = maintenance_agent.list_maintenance(db)

            return {
                "agent": self.name,
                "decision": decision,
                "result": {
                    "count": len(records),
                    "records": records,
                },
            }

        if decision == "GET":
            if maintenance_id is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": (
                        "Maintenance ID is required "
                        "to get a specific maintenance record."
                    ),
                }

            record = maintenance_agent.get_maintenance(
                db,
                maintenance_id,
            )

            if record is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": "Maintenance record not found.",
                }

            return {
                "agent": self.name,
                "decision": decision,
                "result": record,
            }

        if decision == "ANALYZE":
            if maintenance_id is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": (
                        "Maintenance ID is required "
                        "for maintenance analysis."
                    ),
                }

            analysis = maintenance_agent.analyze_maintenance(
                db,
                maintenance_id,
            )

            if analysis is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": "Maintenance record not found.",
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
                "The Maintenance AI Agent could not determine "
                "the required maintenance operation."
            ),
        }


maintenance_ai_agent = MaintenanceAIAgent()