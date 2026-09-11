
import requests

from sqlalchemy.orm import Session

from app.agents.safety_agent import safety_agent


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:0.5b"


class SafetyAIAgent:
    """
    AI Decision Layer for Safety Agent.

    Uses Ollama to understand the user's request
    and routes the request to the appropriate
    Safety Agent operation.
    """

    name = "Safety AI Agent"

    def understand_request(self, request: str) -> str:
        text = request.lower().strip()

        # Reliable keyword detection for clear requests.
        # This prevents the small Ollama model from returning
        # UNKNOWN for obvious safety operations.

        if any(keyword in text for keyword in [
            "analyze safety",
            "analyze safety incident",
            "safety analysis",
            "incident analysis",
            "severity analysis",
            "risk assessment",
            "safety risk",
            "corrective action",
            "safety recommendation",
            "analyze incident",
            "analyze",
            "analysis",
            "recommendation",
            "risk",
        ]):
            return "ANALYZE"

        if any(keyword in text for keyword in [
            "show all safety",
            "show safety incidents",
            "show all incidents",
            "list safety",
            "list safety incidents",
            "list incidents",
            "all safety incidents",
            "all incidents",
            "safety records",
            "incident list",
        ]):
            return "LIST"

        if any(keyword in text for keyword in [
            "get safety incident",
            "get incident",
            "safety incident details",
            "incident details",
            "safety incident detail",
            "incident detail",
            "details of safety incident",
            "details of incident",
            "specific safety incident",
        ]):
            return "GET"

        prompt = f"""
You are the Safety AI Agent of COPASTON.

Classify the user's request into exactly ONE action.

Allowed actions:

LIST
GET
ANALYZE
UNKNOWN

Rules:

LIST:
User wants to see all safety incidents,
safety records, or incident list.

GET:
User wants details or information about
one specific safety incident.

ANALYZE:
User wants safety incident analysis,
severity analysis, recommendation,
risk assessment, or corrective action.

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

        # Handle extra text from the local model.
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
        incident_id: int | None = None,
    ):
        decision = self.understand_request(request)

        if decision == "LIST":
            incidents = safety_agent.list_incidents(db)

            return {
                "agent": self.name,
                "decision": decision,
                "result": {
                    "count": len(incidents),
                    "incidents": incidents,
                },
            }

        if decision == "GET":
            if incident_id is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": (
                        "Incident ID is required to get "
                        "a specific safety incident."
                    ),
                }

            incident = safety_agent.get_incident(
                db,
                incident_id,
            )

            if incident is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": "Safety incident not found.",
                }

            return {
                "agent": self.name,
                "decision": decision,
                "result": incident,
            }

        if decision == "ANALYZE":
            if incident_id is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": (
                        "Incident ID is required "
                        "for safety analysis."
                    ),
                }

            analysis = safety_agent.analyze_incident(
                db,
                incident_id,
            )

            if analysis is None:
                return {
                    "agent": self.name,
                    "decision": decision,
                    "message": "Safety incident not found.",
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
                "The Safety AI Agent could not determine "
                "the required safety operation."
            ),
        }


safety_ai_agent = SafetyAIAgent()