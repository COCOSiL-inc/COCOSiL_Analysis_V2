# Manual Placeholder Fallback

Use this guide when `scripts/detect-stack.ts` or `scripts/generate-agent-files.ts`
cannot be run (e.g., no Node.js runtime available, CI environment without tsx).

## Placeholder reference

| Placeholder | What to substitute |
|---|---|
| `{{PROJECT_TYPE}}` | Detected project type and main framework, e.g. `frontend — Next.js / TypeScript` |
| `{{VERIFY_COMMANDS}}` | Newline-separated list of commands verified to exist in the repo |
| `{{RISK_LEVEL}}` | Risk level from taxonomy: `R0` / `R1` / `R2` / `R3` / `R4` |
| `{{DETECTED_DATE}}` | Today's date in `YYYY-MM-DD` format |
| `{{DATE}}` | Same as `{{DETECTED_DATE}}` (used in older minimal template) |
| `R{{LEVEL}}` | Same as `{{RISK_LEVEL}}` (used in HARNESS_DECISIONS.md risk line) |

## Steps

1. Choose the template directory that matches the project type:
   `templates/frontend/`, `templates/backend/`, `templates/fullstack/`,
   `templates/mobile/`, `templates/embedded/`, `templates/internal/`, `templates/research/`

2. Copy all 4 files to the target repo:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `docs/harness/HARNESS_DECISIONS.md`
   - `docs/harness/HARNESS_HEALTH.md`

3. Replace all `{{...}}` placeholders in each copied file.
   Do **not** leave placeholders unreplaced.
   If a value is unknown, use a descriptive comment and record it as a gap in `HARNESS_HEALTH.md`.

4. For `{{VERIFY_COMMANDS}}`: only include commands that actually exist in
   `package.json scripts`, `Makefile`, `pyproject.toml`, or `Cargo.toml`.
   **Never invent a command.**

5. After replacement, confirm no `{{` or `}}` remain in the generated files.

## When to record a gap

If `{{VERIFY_COMMANDS}}` would be empty, add this row to the "Known gaps" table
in `docs/harness/HARNESS_HEALTH.md`:

```
| <date> | No automated test command | Cannot verify repo changes programmatically | Define verify commands | Open |
```
