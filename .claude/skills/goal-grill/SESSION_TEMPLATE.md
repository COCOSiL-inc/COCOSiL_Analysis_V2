# goal-grill Session Template

このファイルをセッションファイルの雛形として使う。  
実際のセッションファイルは `docs/output/goals/<slug>-session.md` に保存する。

---

## State

```
session_id: <YYYY-MM-DD>-<slug>
task: <タスク/機能名>
mode: NEW | RESUME | REVIEW
current_layer: V | O | E | done
turns: 0
last_saved: <YYYY-MM-DD HH:MM>
next_action: <次に実行すること>
web_gate_suppressed_layers: []
```

---

## Layer Progress

```
V (Vision):
  answered: 0
  total: 4
  ready_to_transition: false
  transition_done: false

O (Outcome):
  answered: 0
  total: 4
  ready_to_transition: false
  transition_done: false

E (Eval):
  answered: 0
  total: 4
  ready_to_transition: false
  writeout_done: false
```

---

## QA Log

各回答を記録する。フォーマット:

```
[<layer>-<Q番号>] <ラベル>
Q: <問いの内容>
A: <回答>
Source（Web採用の場合）: <URL>
```

<!-- QA Log here -->

---

## Open Questions

まだ回答されていない問い（[X] 保留含む）を列挙する。

```
- [<layer>-<Q番号>] <問い内容>
```

<!-- Open questions here -->

---

## Notes

層違反・矛盾・補足情報など、QA Log 以外のメモ。

<!-- Notes here -->

---

## Writeouts

書き出し完了済みファイルの一覧。

```
- [ ] V層: 未完了
- [ ] O層: 未完了
- [ ] E層（最終）: docs/output/goals/<slug>.md → 未完了
```
