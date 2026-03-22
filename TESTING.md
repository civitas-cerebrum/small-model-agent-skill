# Testing the small-model-agent Skill

## Test Framework

The `evals.json` file contains test cases that validate the skill triggers correctly when given specific prompts.

### Running Tests

```bash
node run-tests.js
```

This will:
1. Parse the test cases from `evals.json`
2. Check if the `SKILL.md` content contains the expected keywords
3. Report which tests pass or fail

### Test Structure

Each test case has:
- **id**: Test identifier
- **prompt**: The user prompt to test
- **expected_output**: Description of expected behavior
- **assertions**: Conditions to verify:
  - `content_contains`: Checks that a keyword appears in the response
  - `content_not_contains`: Checks that a keyword does NOT appear

### Example Test

```json
{
  "id": 1,
  "prompt": "I'm running Qwen2.5-Coder-32B through aider...",
  "expected_output": "Should trigger the skill. Response should include...",
  "assertions": [
    { "type": "content_contains", "value": "plan" },
    { "type": "content_not_contains", "value": "use a larger model" }
  ]
}
```

This test verifies that when a user asks about a small model failing, the skill response includes:
- Keywords like "plan", "verify", "grep", "one"
- Does NOT recommend switching to a larger model

## Adding New Tests

To add a new test:

1. Add a new object to the `evals` array in `evals.json`
2. Define the prompt that should trigger the skill
3. Specify expected keywords with `content_contains`
4. Specify forbidden keywords with `content_not_contains`
5. Run `node run-tests.js` to validate

## Current Tests

All 5 tests pass:
- ✅ Test 1: Qwen model coding issues
- ✅ Test 2: Ollama local model setup
- ✅ Test 3: Llama hallucinating function names
- ✅ Test 4: Large refactor across 12 files
- ✅ Test 5: Mistral model system prompt