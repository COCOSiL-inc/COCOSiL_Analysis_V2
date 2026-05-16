# skill-shipper Session Template

セッション保存用の雛形。実際のセッションは `docs/skill-shipper-sessions/<slug>-session.md` に保存。

---

## State

```
session_id: <YYYY-MM-DD>-<slug>
mode: publish | install | update | list | init
target_skill: <skill-name>
target_version: <version or "latest">
central_repo:
  name: <repo name or null>
  git_url: <url or null>
  local_path: <path or null>
  status: accessible | not-found | not-configured
current_step: 1-9 (mode 別)
turns: 0
last_saved: <YYYY-MM-DD HH:MM>
next_action: <次に実行すること>
```

---

## Mode Progress

```
publish:
  step_1_select: pending | done
  step_2_inventory: pending | done
  step_3_abstraction: pending | done
  step_4_manifest: pending | done
  step_5_changelog: pending | done
  step_6_preview: pending | approved | rejected
  step_7_clone: pending | done
  step_8_write: pending | done
  step_9_pr: pending | created (#N)

install:
  step_1_select: pending | done
  step_2_clone: pending | done
  step_3_manifest_parse: pending | done
  step_4_dep_resolve: pending | done
  step_5_config: pending | done
  step_6_preview: pending | approved
  step_7_copy: pending | done
  step_8_pr: pending | created (#N)

update:
  step_1_select: ...
  ...

(他モードも同様)
```

---

## Abstraction Analysis (publish mode のみ)

```
A. hardcoded_paths: <count> 件
  - <file:line> "<original>" → "<placeholder>"

B. project_names: <count> 件

C. secrets (REDACT): <count> 件 ⚠️

D. framework_hardcode: <count> 件

E. local_ids: <count> 件
```

---

## Dependencies (install / update mode)

```
target_skill_dependencies:
  skills:
    - <name>@<version>: <status: install pending | installed>
  external:
    - <cli>: <required version> [installed: <actual version>]
```

---

## Notes

<セッション中の補足、警告、未解決事項>

---

## Resume Hint

```
次回再開コマンド:
  「skill-shipper を resume / docs/skill-shipper-sessions/<slug>-session.md を続き」

再開時の起点:
  mode: <mode>
  current_step: <N>
  next_action: <action>
```
