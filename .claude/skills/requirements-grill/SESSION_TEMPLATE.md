---
doc_id: grill.<product>.<layer>.<slug>
doc_type: grill_session
product: [<product>]
layer: sandbox
status: in_progress
as_of: YYYY-MM-DD
owners: [<author>]
grill_target:
  product: <product>
  layers: [V, O, C, F, E, S]
  current_layer: V
  writeout_paths:
    V: docs/requirements/<product>/vision.md
    O: docs/requirements/<product>/outcomes.md
    C: docs/requirements/<product>/capabilities/
    F: docs/requirements/<product>/features/
    E: docs/requirements/<product>/evals/
    S: docs/requirements/<product>/engineering/
---

# Grill Session: <product> / <layers>

---

## State

- turns: 0
- progress_stalled_turns: 0
- last_saved: YYYY-MM-DDTHH:MM:SSZ
- next_action: "Bootstrap → Q-INIT-1 を聞く"
- mode: NEW | RESUME | REVIEW | WRITEOUT_ONLY
- web_gate_suppressed_layers: []
- web_gate_refusal_count: {}

---

## Layer Progress

- V: { answered: 0/8, ready_to_writeout: false, writeout_done: false }
- O: { answered: 0/8, ready_to_writeout: false, writeout_done: false }
- C: { answered: 0/8, ready_to_writeout: false, writeout_done: false, items: [] }
- F: { answered: 0/8, ready_to_writeout: false, writeout_done: false, items: [] }
- E: { answered: 0/8, ready_to_writeout: false, writeout_done: false, items: [] }
- S: { answered: 0/8, ready_to_writeout: false, writeout_done: false }

---

## Open Questions

<!-- open_questions が空になったら Summary へ進む -->
- [V-1] このプロダクトは誰の・何の痛みを解きますか？
- [V-2] 3年後、このプロダクトが世界にあるのとないのでは何が違いますか？
- [V-3] 競合ではなく我々がやる必然性は？
- [V-4] 絶対に目指さない方向は？（Non-goals）
- [V-5] 中心に置くユーザーは誰ですか？
- [V-6] このプロダクトが最初に狙うドメイン・対象領域は？
- [V-7] 成功したとき顧客が言う1文は？（North Star Quote）
- [V-8] このビジョンを1文で言うと？（one_line_thesis）

---

## QA Log

<!-- 1問1ターン。回答をここに追記する。ラベル: [U] [I: 根拠] [A] [X] -->

### V-1: ...
- Q: このプロダクトは誰の・何の痛みを解きますか？
- recommended: （20_products/<product>/から引用 or デフォルト）
- answer: （ユーザーの回答）
- label: [U]
- at: YYYY-MM-DDTHH:MM:SSZ

---

## Decisions (Resolved)

<!-- 複数問の回答から導いた確定事項 -->
<!-- - D1: <decision summary> (sources: [V-1, V-7]) -->

---

## Conflicts

<!-- 矛盾を検知したときに記録 -->
<!-- - C1: "V-3で「特定ドメイン特化」と言ったが、V-6で「幅広いドメイン」と回答。解決: 〇〇を主軸に確定 (at: ...)」 -->

---

## Writeouts

<!-- WriteoutGate 通過後にここへ記録 -->
<!-- - V -> docs/requirements/<product>/vision.md (written at YYYY-MM-DDTHH:MM:SSZ) -->

---

## Web Searches

<!-- grill 中に実行した Web 検索のログ。再現性と出典管理のため記録する -->
<!-- 詳細仕様: .cursor/skills/requirements-grill/WEB_ESCALATION.md -->
<!--
- WS-1: Q=S-5 / query="Anthropic Claude latest model 2026"
  tool=WebSearch / at=YYYY-MM-DDTHH:MM:SSZ
  result_summary: "Claude 3.7 Sonnet (released 2025-02) が現時点の最新 Sonnet。..."
  source: anthropic.com
  adopted: true / adopted_as: "[W: anthropic.com] claude-3-7-sonnet を推奨"

- WS-2: Q=E-7 / query="LLM hallucination rate acceptable threshold enterprise 2026"
  tool=WebSearch / at=YYYY-MM-DDTHH:MM:SSZ
  result_summary: "..."
  source: example.com
  adopted: false
-->

---

## Notes

<!-- 自由メモ。層違反で飛んできたアイデア・次回確認事項など -->
