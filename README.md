# Small Model Agent Skill

A skill that teaches AI coding agents how to work reliably within the constraints of smaller open-source models (≤30B parameters).

## The Problem

Small models fail in predictable ways when used as coding agents: they lose context mid-task, hallucinate APIs, attempt refactors they can't hold in memory, and generate plausible-but-broken code. These failures aren't random — they follow patterns that can be prevented with the right discipline.

## What This Skill Does

When loaded by an agent, this skill enforces a **PLAN → FOCUS → ACT → VERIFY** loop that breaks every task into tiny, verifiable steps. The agent reads less, edits less, and checks more — trading speed for reliability.

The skill includes:
- **SKILL.md** — The full protocol the agent follows (the core of this project)
- **failure-modes.md** — Catalogue of how small models fail, with specific countermeasures
- **language-tips.md** — Per-language strategies (TypeScript, Python, Rust, Go, Java, Kotlin, Swift, C#, Elixir, Zig, and more)

## Who This Is For

You, a human, who wants to use a local/open-source model as a coding agent and is tired of it breaking things. This skill is relevant when:
- You're running models via **ollama**, **llama.cpp**, or **vllm**
- Your model is ≤30B parameters (Qwen, Llama, Mistral, Phi, Gemma, DeepSeek, etc.)
- Context windows are limited (4K–32K tokens)
- You want reliable agentic coding without paying for large cloud models

## Setup

### With Claude Code + Ollama (recommended)

If you use the `lets-claude` launcher script, the skill triggers automatically — the script injects `"running claude code with a small model"` as the first message, which activates the skill.

```bash
lets-claude --model qwen
```

### With other frameworks

The protocol in `SKILL.md` works with any agentic coding framework (aider, continue.dev, cursor agent, open-interpreter, etc.). To integrate:

1. Include the content of `SKILL.md` in your system prompt or agent instructions
2. If the framework supports **tool result truncation**, enable it
3. If the framework supports **conversation compaction**, enable it aggressively (~5 turns for 8K context models)
4. Set `num_ctx` to the model's full capacity and `num_predict` to ~1024 to prevent runaway generation

## Files

| File | Audience | Purpose |
|------|----------|---------|
| `SKILL.md` | Agent | The complete protocol — this is what the agent reads and follows |
| `failure-modes.md` | Agent | Detailed failure patterns and countermeasures |
| `language-tips.md` | Agent | Per-language and per-framework guidance |
| `TESTING.md` | Human | How to run the eval suite |
| `evals.json` | Human | Test cases for validating skill triggers |
| `run-tests.js` | Human | Test runner script |

## Testing

```bash
node run-tests.js
```

See [TESTING.md](TESTING.md) for details.
