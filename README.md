# Small Model Agent Skill

A set of protocols and patterns to help smaller language models (≤30B parameters) work effectively in agentic coding scenarios.

## What This Skill Does

This skill provides a structured framework for using limited-capacity models for real coding tasks. When working with models that have:
- Small context windows (4K–16K tokens)
- Weaker reasoning capabilities
- Limited memory (in self-hosted or local setups)
- Reduced output generation

This skill transforms how the agent plans, edits, and validates work—breaking everything into tiny, verifiable steps that won't overwhelm the model's constraints.

## Core Philosophy

**The fundamental rule:** Never trust the model's memory — trust only what's in the current context window.

Small models fail in predictable ways:
- They lose track of context mid-task
- They hallucinate file contents they read long ago
- They attempt multi-file refactors they can't hold in memory
- They generate plausible-but-broken code when instructions are complex

This skill prevents those failures by enforcing:
- **Tiny scope** — Each change is small and verifiable
- **Constant verification** — Every step is confirmed before moving on
- **Explicit state tracking** — Always know what you have and haven't seen

## The Workflow

Every task follows this loop: **PLAN → FOCUS → ACT → VERIFY**

1. **PLAN** — Decompose before touching anything
   - Break tasks into 2-file, sentence-length steps
   - Each step has a concrete verification
   - Never remember content from previous steps

2. **FOCUS** — Load only what you need
   - Read only the sections you need
   - Keep at most 2 files in working context
   - Never read a file all at once if it's >150 lines

3. **ACT** — Make small, surgical edits
   - Fewer than 30 lines per edit
   - Prefer `str_replace` over rewriting entire files
   - Never generate boilerplate from memory

4. **VERIFY** — Confirm every step
   - Run tests, grep for changes, read back
   - If verification fails, re-read and fix
   - Stop after 3 failures on the same step

## Key Components

### Task Size Boundaries
| Task size | Files | Lines changed | Approach |
|-----------|-------|---------------|----------|
| Tiny | 1 | <15 | Direct edit + verify |
| Small | 1–2 | 15–50 | Plan → 2–4 steps |
| Medium | 2–3 | 50–150 | Plan → sub-tasks |
| Large | 4+ | 150+ | Multiple independent tasks |

### Common Failure Modes
- **Context drift** — Re-read before every edit
- **Phantom APIs** — Grep before calling functions
- **Scope creep** — Stick to the written plan
- **Partial generation** — Incremental file building
- **Echo errors** — Verify after each step

## Usage

This skill is designed to work with any agentic coding framework:
- Claude Code
- aider
- continue.dev
- open-interpreter
- cursor agent
- ollama, llama.cpp, vllm
- llama.cpp, DeepSeek, CodeLlama, Llama, Mistral, Phi, Gemma, Qwen

### Integration Tips

**For framework-level support:**
- If truncating tool results, enable it (small models shouldn't see 500-line file reads)
- Include Planning Template and Working Memory Notebook in system prompts
- Enable conversation compaction every ~5 turns

**For local models:**
- Set `num_ctx` to the model's full capacity
- Set `num_predict` to ~1024 to prevent runaway generation

## Files

- **SKILL.md** — The complete protocol and guidelines
- **TESTING.md** — How to test this skill
- **failure-modes.md** — Detailed patterns of small model failures
- **language-tips.md** — Language/framework-specific guidance
- **evals.json** — Performance evaluation results
- **run-tests.js** — Test runner script

## Who This Is For

This skill is essential when:
- You're working with local/open-source models
- Hardware constraints limit model size
- You need reliable coding but can't afford large models
- Context windows are limited (mobile, edge, or constrained environments)

## Alternatives

For powerful models (Claude 3.5 Sonnet, GPT-4, etc.), this skill may feel overly cautious. The tradeoff of predictability and reliability for smaller models is worth the overhead.