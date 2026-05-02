---
name: docs-sync
description: Update repository documentation when public behavior, setup, API contracts, architecture, or operational procedures change.
---

# Docs Sync Skill

## Purpose

Keep documentation aligned with code changes.  
Do not rewrite docs for unchanged behavior.  
Do not invent facts not present in the code.

## When to use

- Public API or interface changed
- Setup or installation procedure changed
- Architecture or system diagram is outdated
- Operational procedure changed

## Procedure

1. Identify changed files.
2. List affected documentation targets:
   - `README.md`
   - `docs/` files
   - API reference docs
   - ADRs if architecture changed
   - `AGENTS.md` / `CLAUDE.md` if working agreements changed
3. For each target, update only the sections that describe changed behavior.
4. Do not add new documentation sections unless required by the change.
5. Report updated docs and why each was changed.
