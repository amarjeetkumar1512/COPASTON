from app.agents.orchestrator_agent import orchestrator_agent
from app.agents.evaluation_agent import evaluation_agent


test_cases = [
    {
        "request": "Show all products",
        "expected": "PRODUCT",
    },
    {
        "request": "Show all safety incidents",
        "expected": "SAFETY",
    },
    {
        "request": "Show all maintenance records",
        "expected": "MAINTENANCE",
    },
    {
        "request": "What should I do if the brake response is delayed?",
        "expected": "RAG",
    },
]


print("\nCOPASTON ORCHESTRATOR EVALUATION")
print("=" * 40)

passed = 0

for test in test_cases:
    actual = orchestrator_agent.understand_request(
        test["request"]
    )

    result = evaluation_agent.evaluate_decision(
        actual_decision=actual,
        expected_decision=test["expected"],
    )

    if result["passed"]:
        passed += 1
        status = "PASS"
    else:
        status = "FAIL"

    print(f"\nRequest: {test['request']}")
    print(f"Expected: {test['expected']}")
    print(f"Actual:   {actual}")
    print(f"Result:   {status}")


print("\n" + "=" * 40)
print(
    f"Evaluation Score: {passed}/{len(test_cases)} passed"
)