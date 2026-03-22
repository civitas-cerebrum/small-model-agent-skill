# Language and Framework Tips for Small Model Agents

Specific strategies for each language/framework, tuned for models with limited reasoning.

---

## TypeScript / JavaScript

**Leverage the type-checker as a co-pilot.** After every edit, run `npx tsc --noEmit` (or the project's type-check command). The type-checker catches: wrong argument types, missing properties, incorrect return types, and bad imports. This is the single most valuable verification for TS projects with small models.

**Import verification pattern:**
```bash
# Before writing an import, check what's actually exported
grep "export" src/target-module.ts | head -20
# Check how others import from this module
grep -r "from.*target-module" src/ | head -10
```

**Async traps to watch for:**
- Never write `async` code without a corresponding `await` — grep for bare promises: `grep -n "async\|await\|\.then\|Promise" <file>`
- Error handling: if the existing code uses try/catch, match that; if it uses `.catch()`, match that. Don't mix styles.

**React-specific:**
- Edit ONE component per step. Never change a component and its parent in the same edit.
- After editing a component, check the console for errors (or run tests) before touching anything else.
- For state changes: read the current useState/useReducer setup first. Don't add new state without verifying the component's existing state shape.
- Props drilling: always check the parent to confirm the prop name and type match.

---

## Python

**Test early and often.** Python has no compiler to catch errors, so running the code IS the verification. After every edit:
```bash
# Run the specific test
python -m pytest tests/test_target.py::test_specific -x -v
# Or at minimum, check syntax
python -c "import ast; ast.parse(open('target.py').read())"
```

**Virtual environment awareness:**
- Before installing anything, check what's already installed: `pip list | grep <package>`
- Before importing, verify the package name matches the import name (they often differ): `python -c "import <module_name>"`

**Common Python model hallucinations:**
- Inventing `pandas` methods that don't exist (e.g., `df.transform_columns()`) — always check with `dir(df)` or grep for usage
- Wrong `datetime` formatting codes — check existing usage in the project
- Mixing up `os.path` and `pathlib` — match the project's style

**Django/Flask/FastAPI:**
- Read the existing route pattern before adding a new one
- Check existing model fields before adding migrations
- Verify serializer/schema definitions match the model

---

## Rust

**The compiler is your best friend.** After every edit, run `cargo check`. Rust's compiler messages are extremely informative — when an edit fails `cargo check`, the error message usually contains the exact fix needed.

**Borrow checker strategy:**
- Don't try to reason about lifetimes abstractly. Write the simplest version (using `.clone()` if needed), verify it compiles, then optimize.
- If a borrow-checker error appears, paste the exact error message into your working memory and address it directly.

**Pattern matching exhaustiveness:**
- After adding a new enum variant, `cargo check` will show every match that needs updating. Fix them one at a time.

---

## Go

**`go vet` and `go build` after every edit.** Go's compilation is fast and catches most issues.

**Common model mistakes in Go:**
- Forgetting to handle errors (Go's `err` return values). After editing, grep for unhandled errors: `grep -n "_ =" <file>`
- Wrong struct field tags (json, db, etc.) — check existing structs for the tag format
- Interface satisfaction — when implementing an interface, read the interface definition first and implement methods one at a time

---

## Shell Scripts / Bash

**Extra caution needed.** Shell scripts are the most dangerous for small models because there's no type-checker and errors are subtle (wrong quoting, word splitting, globbing).

**Verification approach:**
- Use `shellcheck <script.sh>` after every edit if available
- Test with `bash -n <script.sh>` (syntax check) before running
- For complex scripts, test each section independently

**Small model shell pitfalls:**
- Quoting: always use `"$variable"` not `$variable` — models frequently forget quotes
- `[[ ]]` vs `[ ]` — check which the script already uses and match it
- Exit codes: always check `$?` or use `set -e` — models frequently chain commands without error checking

---

## SQL

**Never run a model-generated query without reviewing it first.** Especially:
- Any DELETE, UPDATE, DROP, or ALTER statement
- Any query without a WHERE clause
- Any query joining more than 2 tables

**Verification approach:**
- For SELECT queries: run with `LIMIT 5` first to sanity-check the output shape
- For mutations: wrap in a transaction and verify before committing
- For schema changes: dump the current schema first, make the change, diff the result

---

## CSS / Styling

Small models are surprisingly bad at CSS. Common issues:
- Generating properties that don't exist or are deprecated
- Wrong selector specificity reasoning
- Generating pixel values that look plausible but are wrong

**Strategy:** Find the closest existing example in the codebase and modify it, rather than generating CSS from scratch. Read the existing design tokens / CSS variables first.

---

## General Principles Across All Languages

1. **Copy existing patterns.** The safest code a small model can write is a close adaptation of existing code in the project. `grep` for similar functionality before writing anything new.

2. **Prefer standard library over external packages.** Small models hallucinate third-party APIs much more than standard library APIs.

3. **One concept per edit.** Don't add a new function AND call it in the same edit. Add the function → verify → add the call → verify.

4. **When in doubt, be explicit.** Small models do better with `if (condition === true)` than `if (condition)`, with explicit type annotations than inferred types, with named variables than inline expressions. Clarity over cleverness.
