---
name: goal-grill
description: >
  Use BEFORE writing code on a new feature, repo, or task when the goal, outcome,
  or acceptance criteria are unclear or undocumented. Clarifies Vision, Outcome,
  and Eval criteria in 3 lightweight layers. 1 question at a time.
  Use when: "目標を詰めたい" "何を作るか決めたい" "ゴールが曖昧" "受け入れ基準がない"
  "実装前に整理したい" "goal grill" "goal を grill して" "新機能の目標を確認したい"
  "acceptance criteria を決めたい" — or when starting any non-trivial implementation
  without existing docs/goals/ or a PRD-equivalent file.
  For full 6-layer PRD (Vision/Outcome/Capability/Feature/Eval/EngSpec),
  use requirements-grill instead.
---

# goal-grill Skill

> 3 層 × 最小問数でゴールを固める。1 問ずつ進める。

---

## §1 PURPOSE

このSkillは **Vision / Outcome / Eval** の 3 層を最小限明確化する。

- 実装前に「何のために作るか」「完了をどう判定するか」を固める
- 重い 6 層 PRD が不要な単一機能・タスクに使う
- セッション内で完結することを基本とする（長くなった場合は途中保存を申し出る）

---

## §2 BOOTSTRAP

新規チャット開始時に以下を実行する。

**Step 1: モード判定**

| 条件 | モード |
|---|---|
| 「resume」「続き」「前回のゴール」という言葉 or セッションファイル（`*-session.md`）が示された | `RESUME` |
| `docs/goals/` 内の既存ゴールファイルを指して「更新したい」 | `REVIEW` |
| それ以外 | `NEW` |

**Step 2: 既存コンテキストの確認（NEW / REVIEW 時）**

以下を順に確認する。存在すれば内容を把握してから質問を始める。

```
docs/goals/           ← 既存ゴールファイルがあれば読む
docs/harness/HARNESS_DECISIONS.md  ← プロジェクト種別・リスクを把握
AGENTS.md             ← repo 全体契約を確認
```

**Step 2.5: RESUME 処理**

モードが `RESUME` の場合:

```
1. 指示されたセッションファイル（docs/goals/<slug>-session.md）を Read する
   ファイルが指定されていない場合は docs/goals/ を ls して最新の *-session.md を探す

2. ## State セクションを確認:
   - current_layer → ここから再開する
   - next_action   → 最初のアクション
   - web_gate_suppressed_layers → Web ゲート抑制層を引き継ぐ

3. ## Open Questions を確認して未回答リストを復元する

4. ## QA Log を確認して回答済み内容を把握する

5. OPENING LINE を表示し、current_layer の未回答問いから再開する
```

**Step 3: OPENING LINE を表示する**

```
---
Goal Grill を起動しました。

モード: <NEW|RESUME|REVIEW>
対象タスク/機能: <ユーザーの説明 or TBD>
書き出し先: docs/goals/<slug>.md（承認後）
---

Vision → Outcome → Eval の順に 1 問ずつ進めます。
各問いには推奨回答を添えます。

コントロール:
  「stop」「一旦止める」 → 中断してファイルに保存
  「スキップ」           → その問いを [X] 保留にして次へ
  「サマリー」           → 現在の回答を要約
  「承認」               → 書き出しゲートへ

では始めましょう。
---
```

---

## §3 GRILL LOOP

各層の問いを1問ずつ出す。問いの詳細は `references/layers.md` を参照。

```
[GRILL LOOP]

current_layer の open_questions が空になるまで:

  Q = pick_next_question(current_layer)
    # references/layers.md の未回答問いを順に選ぶ

  recommended = derive_recommended_answer(Q)
    # 優先順:
    # 1. 既存 docs/goals/ や HARNESS_DECISIONS.md から推論
    # 2. ユーザーの前回答から推論
    # 3. references/layers.md のデフォルト値
    # 4. "まだ情報が不足しています。ご意見をお聞かせください"（最終手段）

  # WEB SEARCH GATE（references/web-escalation.md を参照）
  if web_trigger(Q, recommended):
    "🔎 Web で最新確認しますか？"
    "   対象: <何を確認するか>"
    "   [Y: 検索する / n: 推論で進む]"
    # 詳細は references/web-escalation.md

  output:
    "--- [<layer>-<Q番号>] ---"
    "Q: <問い>"
    "推奨: <推奨回答>"
    "(Enter で推奨採用 / 別の回答を入力 / 「スキップ」で [X] 保留)"

  answer = receive_answer()

  label = classify(answer):
    # Enter / 推奨をそのまま返す → [A]（Web 採用時は [W: source]）
    # ユーザーが具体的な内容を語る → [U]
    # 「スキップ」「後で」          → [X] 保留
    # 推論を要する場合              → [I: 根拠]

  record(Q, answer, label)

現在の層の open_questions が空になったら:
  → §4 LAYER TRANSITION へ
```

---

## §4 LAYER TRANSITION

各層完了時に確認する。

```
=== [<layer>] 層 完了 ===

回答済み: N / N問
未決 [X]: M件

次の層へ進みますか？
  「はい」→ 次の層（V→O→E の順）へ
  「修正したい」→ どの問いを修正しますか？
  「stop」→ 中断してファイルに保存
```

全 3 層完了後 → §5 WRITEOUT GATE へ。

---

## §5 WRITEOUT GATE

ユーザーが「承認」と言うまでファイルを書かない。

**Stage 1: PREVIEW**

```
=== WRITEOUT PREVIEW ===

書き出し先: docs/goals/<slug>.md

--- Vision ---
<V 層の回答サマリー>

--- Outcome ---
<O 層の回答サマリー（指標・期間・対象）>

--- Eval criteria ---
<E 層の合格基準リスト>

未決 [X]: <件数>件（空欄で書き出し）
```

**Stage 2: LABEL AUDIT**

```
=== LABEL AUDIT ===
[U] problem_statement: "<ユーザー直言>"
[A] target_user: "<推奨採用>"
[I: HARNESS_DECISIONS] project_type: "<推論>"  ← 要確認
[X] deadline: 未決  ← 空欄で書き出し

⚠️ [I] は推論です。確認してください。
⚠️ [X] は未決です。空欄で書き出します。

このまま書き出しますか？（「承認」/「approve」）
```

**Stage 3: WRITEOUT 実行（承認後のみ）**

```
1. docs/goals/<slug>.md を Write で作成
2. 以下を表示:
   「✓ docs/goals/<slug>.md に書き出しました。

    このファイルを AGENTS.md に参照追記しますか？
    「はい」→ AGENTS.md の Read first 節に 1 行追記
    「いいえ」→ スキップ」
```

---

## §6 SESSION SAVE PROTOCOL

以下のいずれかで必ず実行する:

- ユーザーが「stop」「一旦止める」「後で続ける」と言ったとき
- 各層の LAYER TRANSITION 完了時
- WRITEOUT GATE 完了時
- 5 ターン連続でセッションが進んだとき（任意、長いセッションのための安全網）

```
1. docs/goals/<slug>-session.md を StrReplace（既存）または Write（初回）で保存する
   SESSION_TEMPLATE.md のフォーマットに従い、以下を更新する:
   - ## State: current_layer / turns / last_saved / next_action / web_gate_suppressed_layers
   - ## Layer Progress: answered / ready_to_transition / transition_done / writeout_done
   - ## Open Questions: 現在の未回答リスト（[X] 保留含む）
   - ## QA Log: 今回のターンで回答した Q/A を追記
   - ## Notes: 層違反・矛盾などがあれば追記

2. 以下を表示する:
   「セッションを保存しました: docs/goals/<slug>-session.md

    次回は新しいチャットで以下をそのまま入力して再開できます:
    「docs/goals/<slug>-session.md の goal grill を resume して」」
```

---

## §7 REFERENCES

| ファイル | 役割 | ロードタイミング |
|---|---|---|
| `references/layers.md` | 3 層の問い一覧とデフォルト値 | LayerGrill 開始時 |
| `references/web-escalation.md` | Web 検索ゲートの発動条件・手順 | Web trigger 判定時のみ |
| `SESSION_TEMPLATE.md` | セッションファイルの雛形 | RESUME 時・初回 SESSION SAVE 時 |
