# Failure Modes of Small Model Agents

A detailed catalogue of how models ≤30B parameters fail during agentic coding, with specific countermeasures.

---

## 1. Context Drift

**What happens:** The model reads file A, then reads file B, then tries to edit file A based on stale or partially-remembered content. The edit is wrong because the model is working from a hallucinated version of file A.

**Frequency:** Very high. This is the #1 failure mode.

**Countermeasures:**
- Always re-read the exact lines being edited immediately before the edit. Not 3 tool calls ago — immediately before.
- Use `str_replace` with the exact existing text, never "rewrite the function that does X" from memory.
- If you need information from two files simultaneously (e.g., a function signature from one file to use in another), extract the key fact into a short note in the working memory notebook, then work from that note.

**Example of failure:**
```
1. Read src/api.ts (200 lines) 
2. Read src/types.ts (100 lines)
3. Edit src/api.ts — WRONG: model remembers api.ts incorrectly
```

**Correct approach:**
```
1. Read src/types.ts:15-25 (just the type definition needed)
2. Note: "UserInput type has fields: name (string), email (string), age (number?)"
3. Read src/api.ts:40-60 (just the function to edit)
4. Edit src/api.ts:45-50 using the noted type info
5. Re-read src/api.ts:40-60 to verify
```

---

## 2. Phantom APIs (Hallucinated Interfaces)

**What happens:** The model generates code that calls functions, methods, or uses APIs that don't exist. It is confidently wrong — the function name sounds plausible but isn't real.

**Frequency:** High, especially with less popular libraries or project-specific utilities.

**Countermeasures:**
- Before writing a function call, `grep -r "function_name"` in the codebase.
- Before writing an import, check that the module exports what you think it does.
- For external library APIs, find an existing usage in the codebase and copy its pattern rather than generating from memory.
- If no existing usage exists, read the library's actual type definitions or docs.

**Example of failure:**
```python
# Model generates:
from utils import validate_email  # This function doesn't exist in utils.py
```

**Correct approach:**
```
1. grep -r "validate" src/utils.py
2. Discover the actual function is called "check_email_format"
3. Use the real function name
```

---

## 3. Scope Creep / Cascade Edits

**What happens:** The model starts a small edit, notices something related, and starts "fixing" that too, then notices another thing, and spirals into a multi-file refactor that breaks coherence.

**Frequency:** Medium-high. Triggered especially by tasks like "fix this bug" where the model finds adjacent issues.

**Countermeasures:**
- The plan is sacred. If a step says "edit line 45 of api.ts," only edit line 45 of api.ts.
- If you notice something else that needs fixing, add it to the plan as a new step — don't do it now.
- After completing the planned edit, run the verification before doing anything else.
- If the model starts a response with "while I'm here, I'll also..." — that's the danger signal.

---

## 4. Partial Generation / Truncated Output

**What happens:** The model runs out of output tokens partway through generating a file or function. The result is syntactically broken (unclosed braces, missing return statements, incomplete logic).

**Frequency:** Medium. More likely with larger files and smaller `max_tokens` settings.

**Countermeasures:**
- Never generate a new file longer than ~80 lines in one shot. Build incrementally:
  1. Write the skeleton (imports, class/function signatures, empty bodies)
  2. Fill in one function body at a time
  3. Verify after each addition
- For edits, use `str_replace` to change only the affected lines rather than regenerating the entire function.
- Set `max_tokens` / `num_predict` appropriately: 1024 for edits, 2048 for new file sections.

---

## 5. Echo Errors (Error Propagation)

**What happens:** The model makes a mistake in step 2. In step 4, it reads back its own mistake, accepts it as correct, and builds on it. The error compounds.

**Frequency:** Medium. Insidious because it looks like the model is working correctly.

**Countermeasures:**
- Verify after every step, not just at the end. Catch mistakes before they become the model's "ground truth."
- When verification fails, re-read the file from disk (the actual file), not from the conversation context.
- Consider running a linter or type-checker as an automated verification — it doesn't suffer from echo errors.

---

## 6. Import/Dependency Confusion

**What happens:** The model writes imports that are wrong — importing from the wrong path, using named imports that don't exist, or mixing up similar packages (e.g., `lodash` vs `lodash/fp`, `path` vs `node:path`).

**Frequency:** Medium. Higher in JavaScript/TypeScript where import styles vary.

**Countermeasures:**
- Before writing imports, check how the target module is imported elsewhere in the project: `grep -r "from.*module_name" src/`
- For project-internal imports, verify the export exists: `grep "export" src/target-file.ts | head -20`
- Copy the exact import style used in neighboring files.

---

## 7. Stale Test Expectations

**What happens:** The model edits code but forgets to update the corresponding test expectations, or updates tests based on what it thinks the code does rather than what it actually does.

**Frequency:** Medium.

**Countermeasures:**
- If the plan involves editing code, include a step to check and update tests.
- After editing code, run the tests before modifying them — the test failure message tells you exactly what changed.
- Never update a test expectation without first running the test to see the actual output.

---

## 8. Multi-Step Logic Errors

**What happens:** The model can implement each step of an algorithm individually, but when the steps need to interact (shared state, sequencing, error handling), the composition is wrong.

**Frequency:** Medium. Higher for async code, state machines, and complex control flow.

**Countermeasures:**
- Break complex logic into named, testable functions rather than inline code.
- Write the simplest possible version first (even if it's inefficient), verify it works, then optimize.
- For async code: get the synchronous version working first, then add async.
- Write a simple test case before writing the implementation. Seeing the test helps the model stay focused on the contract.

---

## 9. Off-by-One / Boundary Errors

**What happens:** Small models are weak at reasoning about boundaries — array indices, string slicing, range endpoints, pagination offsets.

**Frequency:** Medium.

**Countermeasures:**
- When writing boundary logic, add a concrete example as a comment: `// For input [a, b, c], start=1, end=2 → should return [b]`
- Immediately test with edge cases: empty input, single element, full range.
- Prefer high-level operations (`.slice()`, `.filter()`, list comprehensions) over manual index arithmetic.

---

## 10. Inconsistent Naming

**What happens:** The model uses `userId` in one place and `user_id` in another, or `getData` in the interface and `fetchData` in the implementation.

**Frequency:** Low-medium. Higher across file boundaries.

**Countermeasures:**
- Before introducing a new name, grep for existing conventions: `grep -r "user.*[Ii]d" src/`
- When editing a file, check its naming style in the first 20 lines and match it.
- In the working memory notebook, note the naming convention: "This project uses camelCase for variables, PascalCase for types."
