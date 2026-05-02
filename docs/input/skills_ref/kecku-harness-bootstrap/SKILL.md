---
name: kecku-harness-bootstrap
description: Use when initializing or updating a repository's AI coding harness. Inspects the repo and generates minimal AGENTS.md, CLAUDE.md, Cursor rules, hooks, verification skills, and eval templates based on project risk and stack.
disable-model-invocation: true
---

# Kecku Harness Bootstrap Skill

## Purpose

Create the smallest useful AI coding harness for this repository.

Do not install a large generic harness.  
Do not add rules without a measurable reason.  
Prefer repo-specific verification over generic advice.

## Operating Principles

1. Read the repository before proposing harness files.
2. Keep always-loaded files short.
3. Put repeatable workflows into Skills.
4. Put deterministic checks into scripts, CI, or hooks.
5. Put long explanations into references.
6. Add evals before adding many new rules.
7. Protect secrets, production data, destructive commands, and main branch.
8. Record all harness decisions in `docs/harness/HARNESS_DECISIONS.md`.

## Procedure

### Step 1: Inspect the repository

Check ALL of the following. Do not skip items — if something does not exist, note its absence.

- package manager (npm / pnpm / yarn / pip / cargo / go mod / etc.)
- languages and their versions
- frameworks (React, Next.js, Django, FastAPI, Express, Rails, etc.)
- test commands (check package.json scripts, Makefile, pyproject.toml, Cargo.toml)
- lint / typecheck / build commands
- deployment target (Vercel, Railway, AWS, GCP, on-prem, Docker, etc.)
- existing CI configuration (.github/workflows, .gitlab-ci.yml, etc.)
- secrets handling (.env, .env.example, vault, etc.)
- database and migration scripts (prisma, alembic, drizzle, etc.)
- infra and ops scripts (terraform, pulumi, k8s manifests, etc.)
- hardware / embedded control scripts (ROS, ArduPilot, PX4, etc.)
- documentation structure (README, docs/, ADRs, etc.)
- current AI instruction files (AGENTS.md, CLAUDE.md, .cursor/rules/, .claude/)
- monorepo structure (workspaces, packages, apps, etc.)

### Step 2: Ask the user clarifying questions

After inspecting the repo, ask the user the following questions.  
Only ask questions whose answers cannot be reliably determined from the repo inspection.  
If the repo inspection already gives a clear answer, state what you detected and ask the user to confirm or correct it.

**Questions to ask:**

1. このrepoの主用途は次のどれに近いですか？  
   frontend / backend / fullstack / mobile / embedded / internal tool / data-pipeline / research / other

2. このrepoでAIに絶対させたくない操作はありますか？  
   例: .env変更、DB削除、main push、本番deploy、依存追加、migration実行

3. 完了判定として最低限必ず走らせたいコマンドはありますか？  
   例: pnpm test, pnpm build, pytest, cargo test

4. このrepoで最も怖い失敗は何ですか？  
   例: UI崩れ / data loss / secret leak / security bug / hardware damage / wrong legal text

5. このrepoで繰り返し発生する作業は何ですか？  
   例: PR要約 / 検証 / docs同期 / release / security review / UI review

**After clarifying questions — goal check:**

If the user has not stated a clear goal or outcome for their current task, and there is no
`docs/goals/` directory or PRD-equivalent file in the repo, recommend running `/goal-grill`
**before** generating harness files:

```
目標や受け入れ基準がまだ文書化されていないようです。
/goal-grill を先に実行して Vision / Outcome / Eval 基準を 3 層で明確化することを推奨します。
（「ゴールは明確」と言っていただければスキップしてハーネス生成に進みます）
```

For complex products needing full PRD-level decomposition (Capability / Feature / EngSpec を含む),
recommend `/requirements-grill` instead of `/goal-grill`.

**Detect from repo without asking:**

- package manager
- framework and language
- test / lint / build commands
- CI presence
- Docker presence
- DB migration presence
- frontend/backend structure
- monorepo or not

### Step 3: Classify the project type

Choose one or more:

- frontend-app
- backend-api
- fullstack-app
- mobile-app
- embedded-uav
- internal-admin
- data-pipeline
- ai-agent-platform
- research-prototype
- defense/municipal-secure-system

### Step 4: Classify the risk level

Use the following levels. Refer to `references/project-risk-taxonomy.md` for per-level harness requirements.

- **R0**: throwaway prototype — minimal harness, no complex hooks
- **R1**: internal low-risk tool — lightweight harness, protect .env
- **R2**: customer-facing app — standard harness, lint/test/build/CI, PR summary, protect secrets
- **R3**: data-sensitive / admin / payment / production DB — strong harness, destructive command guard, migration review, auth/security review, dependency confirmation
- **R4**: hardware / drone / defense / municipal / safety-critical — strict harness, simulation-first, human approval for irreversible actions, safety envelope, ops log

### Step 5: Handle uncertainty

If the repo inspection is uncertain about any item, do NOT guess.

Instead:

1. State what you detected and why it is uncertain.
2. Record the uncertainty in `docs/harness/HARNESS_HEALTH.md` as a known gap.
3. Do not add rules or commands based on uncertain information.

Example:

```
Detected:
- package manager: pnpm likely (pnpm-lock.yaml exists)
- build command: pnpm build exists
- test command: unclear — package.json has no test script

Decision:
- Do not require tests yet
- Add gap in HARNESS_HEALTH.md: "define minimum test command"
```

### Step 6: Generate minimal files

Run the bootstrap scripts to auto-detect the stack and generate the harness files:

```bash
# From the kecku-harness-bootstrap skill directory (or wherever the scripts are installed)
npx tsx scripts/detect-stack.ts > /tmp/stack.json

# Inspect the detected stack before generating
cat /tmp/stack.json

# Generate files — adjust --project-type and --risk as needed
npx tsx scripts/generate-agent-files.ts \
  --detect-json /tmp/stack.json \
  --project-type <frontend|backend|fullstack|mobile|embedded|internal|research> \
  --risk <R0|R1|R2|R3|R4> \
  --out <path/to/target/repo>
```

Use `--dry-run` to preview what would be written before committing:

```bash
npx tsx scripts/generate-agent-files.ts \
  --detect-json /tmp/stack.json \
  --project-type <type> \
  --dry-run
```

Use `--force` to overwrite existing files (e.g., when updating a harness):

```bash
npx tsx scripts/generate-agent-files.ts \
  --detect-json /tmp/stack.json \
  --project-type <type> \
  --out <repo> \
  --force
```

The scripts generate:
- `AGENTS.md` — project type, verification commands, protected areas, skill references
- `CLAUDE.md` — first line is `@AGENTS.md`; Claude Code entrypoint
- `docs/harness/HARNESS_DECISIONS.md` — risk level, project type, decisions
- `docs/harness/HARNESS_HEALTH.md` — known gaps (auto-populated if no verify commands found)

`.cursor/rules/project.mdc` is now generated automatically by `generate-agent-files.ts` (via recursive template copy from `templates/<type>/.cursor/rules/`).
To refresh it independently after a product-type change, run:

```bash
npx tsx scripts/generate-cursor-rules.ts \
  --project-type <type> \
  --out <path/to/target/repo> \
  --force
```

**After script generation, add manually** (scripts do not generate these yet):
- `.claude/settings.json` — minimal hooks only
- `.claude/hooks/prevent-destructive-command.js` — block dangerous commands; output `permissionDecision: "deny"` JSON via stdout (Claude Code spec)
- `.cursor/hooks.json` — Cursor hook config with `"version": 1` (required for Cursor 3.x); uses `beforeShellExecution`
- `.cursor/hooks/prevent-destructive-command.js` — Cursor version; exit code 2 to block
- `evals/bootstrap.prompts.csv` — at least 3 eval prompts specific to this repo
- `.github/workflows/agent-verify.yml` — CI workflow placeholder

If scripts are not available, see `references/manual-placeholder-fallback.md` for manual placeholder replacement instructions.

**CLAUDE.md size guidance:**  
Target under 200 lines per file. If the project CLAUDE.md grows large, split instructions into `.claude/rules/*.md` files with optional `paths` frontmatter to scope them to specific file types (e.g., `paths: ["**/*.ts"]`). Splitting into `@path` imports does NOT reduce context; path-scoped rules do.

**Per-project-type customization:**

For frontend-app, also consider:
- UI state coverage: empty / loading / error / mobile
- Prefer existing components and design tokens
- Visual regression if available

For backend-api, also consider:
- API contract / schema diff
- Auth/permission boundary checks
- DB migration review
- OpenAPI/Swagger sync

For embedded-uav / hardware, also consider:
- Simulation-first rule: never actuate real hardware without human approval
- Safety envelope checks
- Calibration value protection
- Flight/actuation test protocol

For defense / municipal-secure-system, also consider:
- Offline compatibility
- Audit log requirements
- Data classification
- No external network dependencies
- No unauthorized data transmission

### Step 7: Set up verification

Prefer commands already present in the repo.

Common verification commands by ecosystem:

- `npm run lint` / `pnpm lint` / `yarn lint`
- `npm run typecheck` / `pnpm typecheck`
- `npm test` / `pnpm test` / `yarn test`
- `npm run build` / `pnpm build`
- `pytest` / `ruff check`
- `cargo test` / `cargo clippy`
- `swift test`
- `go test ./...`
- `docker compose config`

**NEVER invent a command that does not exist in the repo's package files or config.**  
If a command does not exist, record the gap in `HARNESS_HEALTH.md` and do not add it to `AGENTS.md`.

### Step 8: Add hooks only when deterministic

Initial hooks should be limited to:

- **Claude Code** (`.claude/settings.json`):
  - `PreToolUse` / `Bash`: block destructive commands — output `permissionDecision: "deny"` JSON via stdout, exit 0
  - `PostToolUse` / `Edit|Write`: run fast formatter if one is configured
  - `Stop`: summarize verification status
- **Cursor** (`.cursor/hooks.json`, requires `"version": 1`):
  - `beforeShellExecution`: block destructive commands — output `{"permission": "deny", "user_message": "..."}` and exit 2

Hook output format summary:

| Tool | Block mechanism |
|---|---|
| Claude Code PreToolUse | stdout JSON `{"hookSpecificOutput": {"permissionDecision": "deny", ...}}` + exit 0 |
| Cursor beforeShellExecution | stdout JSON `{"permission": "deny", "user_message": "..."}` + exit 2 |

Do NOT add:
- Full test suite after every edit
- LLM review before every bash command
- Long report generation at every stop
- Security review on every file change
- Multi-agent debate on every PR

### Step 9: Create eval seed

Create 3-5 eval prompts in `evals/bootstrap.prompts.csv` that test:

- Correct skill activation for this project
- Correct project type classification
- Correct verification command discovery (not invented)
- No over-harnessing
- No suggestion of unsafe destructive commands

### Step 10: Search for latest tool information (if needed)

If you are unsure about the latest syntax or features for Claude Code hooks, Cursor rules, Codex AGENTS.md, or Agent Skills, search the web for current documentation. Refer to `source-registry.yml` for the official URLs.

Do not assume outdated formats. Verify current hook event names, settings schema, and rule formats.

### Step 11: Report

Return:

- Files created or updated (with paths)
- Why each file was needed
- Verification commands detected (and which ones are missing)
- Hooks added
- Risks intentionally left for manual handling
- User's answers to clarifying questions
- Next 3 improvements to consider

**Recommended next steps (always include):**

```
次のステップ:
- 目標・受け入れ基準が未文書化なら → /goal-grill を実行してください
- 大型プロダクトで PRD が必要なら → /requirements-grill を実行してください
- HARNESS_HEALTH.md に Open Gaps が蓄積したら → /harness-health-improver を実行してください
```
