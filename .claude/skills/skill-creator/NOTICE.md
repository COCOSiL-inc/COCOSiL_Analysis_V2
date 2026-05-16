# NOTICE

This skill is a fork of Anthropic's official `skill-creator` plugin and is
redistributed here under the Apache License, Version 2.0. See `LICENSE.txt`
for the full license text.

## Upstream

- Project: claude-plugins-official / skill-creator
- Author: Anthropic, PBC
- License: Apache License 2.0
- Local upstream copy on the maintainer's machine:
  `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/`

## Fork

- Hub: `cocosil-standard-skills`
- Path: `skills/skill-creator/`
- Forked on: 2026-05-14
- Maintainer: MasakiEndo44

## Modifications at fork time

No upstream files were modified. The following files were **added** alongside
the upstream tree to satisfy this hub's distribution conventions:

- `manifest.yaml`   — hub publishing metadata (consumed by `tools/validate-manifest.py`)
- `NOTICE.md`       — this file (Apache-2.0 attribution)
- `evals/evals.json` — seed trigger-detection scenarios for `/benchmark-skill`

If any upstream file is modified in a later commit, that change must be recorded
in this NOTICE per Apache-2.0 §4(b), and the affected file must carry a
"changed by fork" header.

## Apache-2.0 obligations recap

Per the license, any redistribution of this skill or derivative works must:

1. Include a copy of the Apache-2.0 license (kept here as `LICENSE.txt`).
2. Preserve all copyright, patent, trademark, and attribution notices from
   the upstream source.
3. Preserve this `NOTICE.md` (or an equivalent attribution notice).
4. State prominently in modified files that they have been changed.
