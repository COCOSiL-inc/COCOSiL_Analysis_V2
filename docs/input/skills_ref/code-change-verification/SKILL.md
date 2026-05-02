---
name: code-change-verification
description: Run the repository's required verification stack when changes affect runtime code, tests, build behavior, schemas, API behavior, or release artifacts.
---

# Code Change Verification

Use this when code behavior changed.

## Steps

1. Identify changed files.
2. Classify change:
   - docs-only
   - frontend
   - backend
   - tests
   - infra
   - database
   - hardware/embedded
3. Select the minimum verification commands.
4. Run fast checks first.
5. If checks fail, fix and rerun once.
6. If unable to run, report why and record the gap.
