# Tool Surface Decision

Where to put each kind of content in an AI coding harness.

## Decision table

| Location | Use for | Avoid |
|---|---|---|
| `AGENTS.md` | Short, always-applicable cross-agent working agreements | Long procedures, detailed background |
| `CLAUDE.md` | Claude Code entrypoint, short prohibitions, pointers to skills | Thousands of lines of spec |
| `.cursor/rules/*.mdc` | Cursor-specific split rules per domain | Long tool-agnostic content |
| `Skill` | Repeatable multi-step workflows | Constant prerequisites |
| `hooks` | Deterministic, fast controls | Ambiguous judgment calls |
| `scripts` | Mechanically detectable or generatable operations | Anything requiring LLM judgment |
| `evals` | Prompts and graders that measure improvement | Aspirational wishes |
| `docs` | Human-readable explanations and decision history | Content AI needs every session |

## Decision rules

```
Always needed       → AGENTS.md / CLAUDE.md
Occasionally needed → Skill
Gets long           → references/
Mechanical          → scripts / hooks / CI
Ambiguous           → review Skill / LLM judge
Failed once         → add to evals
Repeated 2+ times   → consider Skill
Detection only      → Sensor
Prevention          → Guide
```
