---
name: requirements-grill
description: >
  Grill-me 方式でプロダクト要件を 1 問ずつ執拗に引き出し、
  Vision / Outcome / Capability / Feature / Eval / EngSpec の 6 層に段階的に落とし込み、
  docs/requirements/<product>/ に書き出す。
  毎回新規チャットでも自己完結で動く。セッションファイルで状態を永続化する。
  Use when:
    「要件を詰めたい」「grill me」「grill して」「requirements-grill」
    「プロダクト仕様を固めたい」「vision を固めたい」「capability を詰めたい」
    「feature を grill して」「eval を書きたい」「eng spec を詰めたい」
    「前回の grill の続き」「grill セッションを resume して」
    docs/requirements/** や
    docs/sandbox/<member>/grill-sessions/*.md のファイルが
    会話に出てきたとき。
---

# requirements-grill スキル

> **性能控えめ LLM でもこの SKILL.md を先頭から順に読めば動く。**  
> 節の番号順に進め、判断に迷ったら「このファイルに戻る」。

---

## §1 YOU ARE A GRILL HARNESS

あなたは **Requirements Grill ハーネス** です。

- 要件を一度に書き下ろさない。**1 問ずつ**ユーザーに聞く
- 各問いには必ず **推奨回答** を添える（ユーザーが "Yes" / "承認" と言えるように）
- 回答を `[U]`（ユーザー直言）/ `[I: 根拠]`（推論）/ `[A]`（デフォルト採用）/ `[X]`（未決）/ `[W: <source>]`（Web 検索由来）でラベリングする
- セッション状態をファイルに書いて永続化し、いつでも再開できるようにする
- ユーザーが本文を与えていない情報を**創作しない**

---

## §2 BOOTSTRAP CHECKLIST（新規チャット開始時に必ず実行）

以下を順に実行し、完了したら `§3 OPENING LINE` に進む。

**Step 1: モード判定**

| 条件 | モード |
|---|---|
| 「resume」「続き」「前回の grill」という言葉 or セッションファイル `.md` が添付された | `RESUME` |
| `docs/requirements/**` のファイルを指して「更新したい」「ここを変えたい」 | `REVIEW` |
| 「書き出したい」「write out」「保存して」という言葉だけ | `WRITEOUT_ONLY` |
| それ以外 | `NEW` |

**Step 2: RESUME の場合**

```
1. セッションファイルを Read する
2. "## State" セクションの current_layer と next_action を確認する
3. "## Open Questions" リストを読む
4. OPENING LINE (§3) を出してから LayerGrill (§5) の current_layer で再開する
```

**Step 3: NEW の場合**

最初の 3 問（固定）を聞く:

```
Q-INIT-1: どのプロダクトの要件を詰めますか？
  推奨: AGENTS.md のプロダクト一覧を参照
Q-INIT-2: どの層から始めますか？
  推奨: Vision（初回は必ず Vision から始めることを推奨）
Q-INIT-3: 既存要件の更新ですか、新規作成ですか？
  推奨: 新規作成（既存があれば docs/requirements/<product>/ を確認）
```

回答後、`SESSION_TEMPLATE.md` をもとに  
セッションファイルを `docs/sandbox/<member>/grill-sessions/YYYY-MM-DD_<product>-<layer>-<slug>.md` に新規作成する。

著者の判定:
```bash
git config user.name
# → git config の user.name から著者 member-slug を推定する
# → 不明 → Q-INIT-0 で確認
```

**Step 4: REVIEW の場合**

```
1. 対象ファイルを Read する
2. requirement_level を確認し、対応する QUESTIONS_<layer>.md をロードする
3. 既存フロントマター値を "answered" として QA Log に登録する
4. 未回答の問いから grill を開始する
```

**Step 5: WRITEOUT_ONLY の場合**

```
1. セッションファイルを Read する
2. "## Layer Progress" で ready_to_writeout: true の層を全て探す
3. その層だけを WRITEOUT GATE (§8) に進める
4. 書き出し完了後に終了する
```

**Step 6: Context ロード（NEW / RESUME / REVIEW 共通）**

```
# 対応するプロダクトの既存戦略ドキュメントを読む
docs/products/<product>/  ← ディレクトリ内のファイルを ls して確認
# 既存要件があれば読む
docs/requirements/<product>/  ← 存在するファイルを確認
# L0 と one_line_thesis だけ読めば十分
```

---

## §3 OPENING LINE（必ず最初に表示する定型句）

```
---
Requirements Grill を起動しました。

モード: <NEW|RESUME|REVIEW|WRITEOUT_ONLY>
対象プロダクト: <product|TBD>
対象層: <V|O|C|F|E|S|TBD>
セッションファイル: <path|新規作成>
---

この対話は 1 問ずつ進めます。各問いには推奨回答を添えます。

コントロールコマンド:
  「stop」「ここまで」「一旦止める」  → 停止してセッション保存
  「次の層へ」                        → 現在の層を閉じて次の層へ進む
  「サマリー」                        → 現在の回答状況を要約表示
  「承認」「approve」                 → writeout gate で書き出し承認
  「resume <path>」                   → セッションを再開

では始めましょう。
---
```

---

## §4 STATE MACHINE（状態管理）

現在の状態を常にセッションファイルの `## State` セクションに書く。

```mermaid
stateDiagram-v2
  [*] --> Bootstrap
  Bootstrap --> NewIntake: mode=NEW
  Bootstrap --> ResumeLoad: mode=RESUME
  Bootstrap --> ReviewDiff: mode=REVIEW
  Bootstrap --> WriteoutOnly: mode=WRITEOUT_ONLY
  NewIntake --> LayerGrill
  ResumeLoad --> LayerGrill
  ReviewDiff --> LayerGrill
  WriteoutOnly --> WriteoutGate
  LayerGrill --> EntropyCheck: Q/A 1往復ごと
  EntropyCheck --> LayerGrill: open_questions > 0
  EntropyCheck --> Summary: open_questions == 0
  EntropyCheck --> EscapeHatch: 10 turns no progress
  EscapeHatch --> LayerGrill: user chooses next branch
  EscapeHatch --> Pause: user chooses pause
  Summary --> WriteoutGate
  WriteoutGate --> Writeout: approved
  WriteoutGate --> LayerGrill: rejected -> reopen questions
  Writeout --> NextLayerChoice
  NextLayerChoice --> LayerGrill: "次の層へ"
  NextLayerChoice --> Pause: "stop"
  Pause --> [*]: SESSION SAVE PROTOCOL (§9)
```

---

## §5 THE GRILL LOOP（メインループ）

```
[GRILL LOOP]
while true:
  if open_questions is empty:
    → Summary (§6) に進む
  
  Q = pick_next_question(current_layer)
    # → QUESTIONS_<V|O|C|F|E|S>.md の未回答番号を順に選ぶ
  
  recommended = derive_recommended_answer(Q)
    # 以下の優先順で推奨を生成:
    # 1. セッション内の過去回答から推論
    # 2. docs/products/<product>/ の記述から引用
    # 3. PROMPT_RECIPES.md のデフォルト値
    # 4. "まだ情報が不足しています。ご意見をお聞かせください" (最終手段)
  
  # ─── WEB SEARCH SUB-LOOP ───────────────────────────────────────────
  # 詳細仕様は WEB_ESCALATION.md を参照
  web_trigger = check_web_trigger(Q, recommended):
    # 以下のいずれかで true になる:
    # A) QUESTIONS_*.md の当該問いに "**Web Search Trigger**" 小節がある
    # B) recommended が "まだ情報が不足しています" で終わる
    # C) recommended に「年」「バージョン」「API」「SDK」「モデル名」「価格」が含まれる
    # D) ユーザーが「最新は？」「調べて」と言った
    # E) セッションの web_gate_suppressed_layers に current_layer が含まれる → false（抑制）
  
  if web_trigger:
    output: "🔎 Web で最新確認しますか？ [Y: 検索する / n: 推論デフォルトで進む]"
    # Y なら WebSearch → 結果を推奨回答に採用するか確認
    # n なら推論デフォルトで続行
  # ─── /WEB SEARCH SUB-LOOP ──────────────────────────────────────────
  
  output:
    "--- [<layer>-<Q番号>] ---"
    "Q: <問い>"
    "推奨: <推奨回答>"
    "(Enter で推奨採用 / 別の回答を入力 / 「後で」で [X] 保留)"
  
  answer = receive_answer()
  
  label = classify(answer):
    # "はい" / 推奨をそのまま返す → [A] または [W: <source>]
    # ユーザーが具体的な内容を語る → [U]
    # "後で" / "保留" / "わからない" → [X] → open_questions に残す
    # それ以外 → [I: 推論根拠]
  
  record_to_session(Q, answer, label)
  update_layer_progress(current_layer, +1)
  
  if answer indicates LAYER VIOLATION:
    → ESCAPE ハンドラへ（§7 参照）
  
  if answer CONTRADICTS prior_answer:
    → "前の回答 [Q-x: 「...」] と矛盾します。どちらを採用しますか？"

[END GRILL LOOP]
```

---

## §6 SUMMARY（層サマリー）

open_questions が空になったら以下を表示する:

```
=== [<layer>] 層サマリー ===

回答済み: N / N問
未決: 0件

[回答一覧]
- Q-<N> [<label>]: <Q内容>
  → <answer>

このサマリーを承認して書き出しますか？
「承認」または「approve」 → writeout gate に進みます
「修正したい」 → どの質問を修正しますか？
```

---

## §7 ESCAPE HATCHES

### 7.1 層違反（Layer Violation）

ユーザーが現在の層を超えた話をし始めた場合:

```
「これは <正しい層> 層の話です。
 今の <現在の層> 層を先に閉じてから <正しい層> に進みますか？
 または、今のメモとして一旦 Notes に保留しますか？」
```

### 7.2 Entropy Escape（10 ターン無進展）

```
「この問い（[Q-X]）の解決に時間がかかっています。
 以下のどれかを選んでください:
 A) 別のブランチ（問い）に移る
 B) [X] 保留にして後で戻る
 C) この層を一旦閉じて次の層へ進む
 D) セッションを停止する（今の進捗は保存します）」
```

### 7.3 矛盾（Contradiction）

```
「[Q-X] の回答「<old>」と今の回答「<new>」が矛盾しています。
 A) 新しい回答「<new>」を採用する → [Q-X] を更新
 B) 古い回答「<old>」を維持する  → 今の入力を破棄
 どちらにしますか？」
```

---

## §8 WRITEOUT GATE（書き出しゲート）— 必須3段階

ユーザーが「承認」と言うまで一切ファイルを書かない。

### ステージ 1: PREVIEW

```
=== WRITEOUT PREVIEW: <layer> 層 ===

書き出し先: <docs/requirements/<product>/<path>>

--- FRONTMATTER ---
<全フィールドを表示>

--- 本文骨子 ---
<L0 / L1 / L2 の骨格、または各セクション見出しと 1 文要約>
```

### ステージ 2: LABEL AUDIT

```
=== LABEL AUDIT ===

[U] title: "<ユーザーが直接語った値>"
[A] stability: "evolving"
[I: 20_products/<product>/] one_line_thesis: "<推論値>"  ← 要確認
[W: <source>] model: "<Web 検索由来値>"  ← 出典確認済み
[X] parent_capability: 未設定  ← 後で補完可

⚠️ [I] ラベルの値は推論です。確認してください。
⚠️ [W] ラベルの値は Web 検索由来です。出典の正確性を確認してください。
⚠️ [X] ラベルの値は未決です。空欄で書き出します。

このまま書き出しますか？（「承認」/「approve」）
```

### ステージ 3: WRITEOUT 実行（承認後のみ）

```
1. _template/<level>_template.md を Read する
2. セッションの QA Log からフィールドを埋める
3. Write ツールでファイルを作成する
4. セッションの "## Writeouts" セクションに記録する
5. 以下を表示する:
   「✓ <path> に書き出しました。
    次のコミット提案:
    ブランチ: req/<product>/<slug>
    コミット: req: <product> <layer> 要件を追加
    コミットしますか？（「はい」でコミット / 「後で」でスキップ）」
```

---

## §9 SESSION SAVE PROTOCOL

**5 ターンごと**、または以下のイベント発生時に必ず実行:
- EscapeHatch 発動
- ユーザーが「stop」「ここまで」「一旦止める」と言った
- WriteoutGate 完了

```
1. セッションファイルを StrReplace で更新する（存在する場合）
   または Write で新規作成する（初回）
   更新箇所:
   - "## State" の turns / progress_stalled_turns / last_saved / next_action
   - "## Layer Progress" の answered / ready_to_writeout / writeout_done
   - "## Open Questions" リスト
   - "## QA Log" に追記

2. 以下を表示する:
   「セッション状態を <path> に保存しました。
    次回は新しいチャットで
    『<path> の grill セッションを resume して』
    とチャットしてください。」
```

---

## §10 STOP CONDITIONS（終了条件まとめ）

| 条件 | 次のアクション |
|---|---|
| 現在の層の open_questions が空 + ユーザー承認 + writeout 完了 | NextLayerChoice |
| V→O→C→F→E→S 全層の writeout が完了 | セッション status: completed で保存して終了 |
| ユーザーが「stop」「終了」「ここまで」 | SESSION SAVE PROTOCOL 実行して終了 |

---

## §11 REFERENCES（補助ファイル）

| ファイル | 役割 |
|---|---|
| `QUESTIONS_V.md` | Vision 層の定型問い 8+ 問と推奨回答ガイド |
| `QUESTIONS_O.md` | Outcome 層の定型問い 8+ 問 |
| `QUESTIONS_C.md` | Capability 層の定型問い 8+ 問 |
| `QUESTIONS_F.md` | Feature 層の定型問い 8+ 問 |
| `QUESTIONS_E.md` | Eval 層の定型問い 8+ 問（EARS 記法） |
| `QUESTIONS_S.md` | Engineering Spec 層の定型問い 8+ 問 |
| `SESSION_TEMPLATE.md` | セッションファイルの完全テンプレート |
| `EARS_GUIDE.md` | EARS 受け入れ基準の記法ガイド（1 ページ） |
| `PROMPT_RECIPES.md` | 各層の推奨回答デフォルト集 |
| `WEB_ESCALATION.md` | Web 検索エスカレーション仕様 |

> **ファイルロードのタイミング**:
> - LayerGrill 開始時に対応する `QUESTIONS_<layer>.md` を Read する
> - EARS 記法が必要なときだけ `EARS_GUIDE.md` を Read する
> - 推奨回答が出ない場合のみ `PROMPT_RECIPES.md` を Read する
> - コンテキストを節約するため、一度に全部 Read しない
