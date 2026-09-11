from app.database import SessionLocal
from app.agents.orchestrator_agent import orchestrator_agent
from app.agents.evaluation_agent import evaluation_agent


test_cases = [
    {
        "name": "Product Analysis",
        "request": "Analyze product 1",
        "product_id": 1,
        "expected_keywords": [
            "product",
            "serial_number",
            "status",
            "recommendation",
        ],
    },
    {
        "name": "Safety Analysis",
        "request": "Analyze safety incident 2",
        "incident_id": 2,
        "expected_keywords": [
            "incident",
            "severity",
            "status",
            "recommendation",
        ],
    },
    {
        "name": "Maintenance Analysis",
        "request": "Analyze maintenance record 2",
        "maintenance_id": 2,
        "expected_keywords": [
            "maintenance",
            "due_date",
            "status",
            "recommendation",
        ],
    },
    {
        "name": "RAG Knowledge",
        "request": "What should I do if the brake response is delayed?",
        "expected_keywords": [
            "brake",
            "safety",
        ],
    },
]


print("\nCOPASTON RESPONSE EVALUATION")
print("=" * 50)

db = SessionLocal()

passed = 0

try:
    for test in test_cases:

        result = orchestrator_agent.run(
            db=db,
            request=test["request"],
            product_id=test.get("product_id"),
            incident_id=test.get("incident_id"),
            maintenance_id=test.get("maintenance_id"),
        )

        evaluation_text = str(result)

        evaluation = evaluation_agent.evaluate_response(
            response=evaluation_text,
            expected_keywords=test["expected_keywords"],
        )

        if evaluation["passed"]:
            passed += 1
            status = "PASS"
        else:
            status = "FAIL"

        print(f"\nTest: {test['name']}")
        print(f"Request: {test['request']}")
        print(f"Result: {status}")
        print(
            f"Matched: "
            f"{evaluation['matched_keywords']}"
        )
        print(
            f"Expected: "
            f"{evaluation['expected_keywords']}"
        )

finally:
    db.close()


print("\n" + "=" * 50)

print(
    f"Response Evaluation Score: "
    f"{passed}/{len(test_cases)} passed"
)