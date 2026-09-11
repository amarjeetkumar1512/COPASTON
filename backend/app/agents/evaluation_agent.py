class EvaluationAgent:
    """
    Evaluation Agent for COPASTON.

    Tests AI agent decisions and responses
    against expected results.
    """

    name = "Evaluation Agent"

    def evaluate_decision(
        self,
        actual_decision: str,
        expected_decision: str,
    ):
        passed = (
            actual_decision.upper().strip()
            == expected_decision.upper().strip()
        )

        return {
            "passed": passed,
            "actual_decision": actual_decision,
            "expected_decision": expected_decision,
        }

    def evaluate_response(
        self,
        response: str,
        expected_keywords: list[str],
    ):
        response_text = response.lower()

        matched_keywords = [
            keyword
            for keyword in expected_keywords
            if keyword.lower() in response_text
        ]

        passed = len(matched_keywords) == len(
            expected_keywords
        )

        return {
            "passed": passed,
            "expected_keywords": expected_keywords,
            "matched_keywords": matched_keywords,
            "response": response,
        }


evaluation_agent = EvaluationAgent()