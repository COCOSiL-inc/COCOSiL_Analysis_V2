# Changelog

All notable changes to this skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
-

### Changed
-

---

## [0.1.0] - 2026-05-16 - Initial publish

### Added
- Initial publish to cocosil-standard-skills
- 6-layer grill loop: Vision / Outcome / Capability / Feature / Eval / EngSpec
- 1-question-at-a-time prompting with `[U] / [I] / [A] / [X] / [W]` label system
- Session file persistence under `<grill_session_path>` for resume across chats
- WriteoutGate (Preview → Label Audit → Approval) before file writes
- EscapeHatches: layer violation, entropy escape (10-turn stall), contradiction detection
- Web search escalation (`WEB_ESCALATION.md`) with `[W: <source>]` label for time-sensitive fields (tech stack, model selection, hallucination thresholds)
- Layer-specific question banks: `QUESTIONS_V/O/C/F/E/S.md` (8+ questions each)
- EARS / GEARS notation guide for Eval layer
- Prompt recipes (`PROMPT_RECIPES.md`) with default vocab/profiles for each layer
- Example session (`EXAMPLES/example_session.md`) and regression pack (`REGRESSION/regression_pack.md`)
- 4 `config_required` placeholders for KB path overrides
