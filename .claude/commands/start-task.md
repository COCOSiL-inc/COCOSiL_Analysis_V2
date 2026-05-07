---
description: タスクの着手準備（事前チェック + ブランチ作成）
allowed-tools: Read, Glob, Grep, Bash(git checkout *), Bash(git branch *), Bash(git status *), Bash(git fetch *), Bash(git log *)
argument-hint: "<タスク説明 または Issue番号>"
---

以下の手順でタスク着手準備を行ってください。$ARGUMENTS にタスクの説明またはIssue番号が入っています。

## Step 1: Pre-flight チェック

```bash
git status --short
```

次に現在のブランチ名を確認して、diverged状態をチェック:

```bash
git log HEAD..origin/$(git branch --show-current) --oneline 2>/dev/null || true
git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || true
```

以下の問題が検出された場合は、解決を促してから続行確認を取る:

**Uncommitted changes がある場合:**
```
⚠️ 未コミットの変更があります。
作業中の変更を確認してください。stash してから着手することを推奨します:
  git stash
続けますか？（変更を残したまま新しいブランチに着手する場合は「はい」）
```

**Diverged branch が検出された場合:**
```
⚠️ 現在のブランチ (〈ブランチ名〉) がリモートと diverged しています。
解決策:
  git pull --rebase origin 〈ブランチ名〉  # リベース（推奨）
  git pull --no-rebase origin 〈ブランチ名〉  # マージ
先に解決してから着手することを推奨します。続けますか？
```

---

## Step 2: タスクの理解

`$ARGUMENTS` を読んで以下を推定する:
- タスクの目的（何を実現したいか）
- 変更が予想されるファイルパス
- AGENTS.md セクション7 の担当ガードで該当するレイヤーと担当者

関連するスペックやドキュメントがある場合は Read で確認する。

---

## Step 2.5: 設計中枢 承認ゲート（自動実行・スキップ不可）

> 詳細: `docs/input/concepts/COCOSiL設計中枢.md`（Layer 0 — すべての判断の最上位基準）
>
> ⚠️ **これは「初期見立て」です** — 実装着手前に逆方便（Must違反）を弾くための事前ゲート。
> PR作成時の判定（`.github/pull_request_template.md` の独立判定列）は**実装後に再判定**する役割で、ここでの判定とは独立している。
> 役割の関係：このStep 2.5 = 「着手判断」、PR template = 「マージ判断」。
> 設計根拠: `docs/output/decisions/harness-redesign-proposal-2026-05-05.md` 原則②

タスクの内容・変更予定ファイル・担当レイヤーをもとに、5問のリトマス試験紙を適用して判定結果を出力する。

**適用除外の判断**:
- Layer 1（インフラ修正）でUXへの直接影響がない場合: Q3・Q5を「N/A」として扱い、Q1・Q2のみ評価
- バグ修正でUI/コピー/プロンプトに変更がない場合: Q3・Q4・Q5を「N/A」として扱い、Q1・Q2のみ評価

**判定・出力フォーマット**:

```
🧪 設計中枢 チェック

Q1 無明を晴らすか？           <○/△/×/N/A> — <根拠を1行>
Q2 三毒を増幅しないか？       <○/△/×/N/A> — <根拠を1行>
Q3 順序（共感→安心→分析→行動）を守れるか？  <○/△/×/N/A> — <根拠を1行>
Q4 大我への移行を支援するか？  <○/△/×/N/A> — <根拠を1行>
Q5 良い人間関係に寄与するか？  <○/△/×/N/A> — <根拠を1行>
```

**判定ルール（必ず適用）**:

| 状態 | 処理 |
|---|---|
| Must（Q1〜Q3）が1つでも **×** | ⛔ ブランチを作成しない。タスクの再設計を提案してユーザーの判断を待つ |
| Must が ×、ユーザーが「えんまさ承認済み」と明示 | 承認記録をコメントに残してStep 3へ進む |
| Must が全て ○/△/N/A、Should が × | ⚠️ 警告を表示。「戦略的意味の明文化」をユーザーに求める。明文化後にStep 3へ進む |
| Must が全て ○/△/N/A、Should が ○/△/N/A | ✅ 承認。Step 3へ進む |

**Must × ブロック時のフォーマット**:
```
⛔ 設計中枢 チェック — ブロック

Q<N> <問い>: × — <理由>

このタスクはMust条件（Q<N>）を満たしていません（逆方便と判定）。
→ タスクを再設計するか、えんまさに確認してください。
→ えんまさ承認済みの場合は「えんまさ承認済み」と伝えてください。
```

**Should × 警告時のフォーマット**:
```
⚠️ 設計中枢 チェック — 警告

Q<N> <問い>: × — <理由>

Should条件（Q<N>）を満たしていません。
→ このタスクにおける戦略的意味を1〜2行で明文化してください。
→ 明文化された内容はPRの「設計中枢メモ」欄に記録されます。
```

---

## Step 2.6: GitHub Issue ↔ TSK ファイル紐づけ

> TSK ID形式: `TSK-[分類]-[番号3桁]`（分類: DB/UI/API/PROMPT/DOCS/CHORE）  
> 参照: `docs/TASK-INDEX.md` / `docs/output/tasks/`

**タスク説明にIssue番号（例: `#27`）が含まれる場合:**

```bash
gh issue view <番号>
```

Issue内容を表示し、`docs/output/tasks/` 配下に対応するTSKファイル（`TSK-*-<番号>*.md` または `TSK-[分類]-NNN-*.md`）が存在するかチェックする。

- **存在する** → TSKファイルパスをStep 5の着手レポートに記載
- **存在しない** → 以下を提示して確認:
  ```
  ⚠️ TSKファイルが見つかりません。
  → docs/output/tasks/ に TSK-[分類]-NNN-<slug>.md を作成しますか？（y/n）
  → 分類: DB/UI/API/PROMPT/DOCS/CHORE から選択
  → y の場合: _TEMPLATE.md ベースで生成し、Issue番号・ブランチ名・参照要件を埋める
  ```

**タスク説明にIssue番号がない場合:**

```bash
gh issue list --limit 10 --state open
```

未着手Issueを表示し、以下を確認:

```
対応するIssue番号は？
  番号を入力（例: 27）/ 「新規作成」 / 「スキップ」
```

- **番号入力** → 上記「Issue番号あり」の処理へ
- **「新規作成」** → タイトル・本文・ラベルを提案して `gh issue create` 実行（ユーザー確認後）
- **「スキップ」** → Step 3 へ進む（Issueなしの小修正・docs作業等）

**ブランチ名（Step 3）にはIssue番号を反映する**: `feature/<番号>-<slug>` 形式

---

## Step 3: ブランチ名の提案（1回のみ確認）

タスクの内容と変更予定ファイルから、以下の命名規則に基づいてブランチ名を1つ推論する:

| prefix | 用途 |
|--------|------|
| `feature/` | 新機能開発 |
| `fix/` | バグ修正 |
| `docs/` | ドキュメント・仕様書 |
| `chore/` | 設定・依存関係・CI変更 |
| `refactor/` | リファクタリング |

**バリデーション:** 必ず `/^(feature|fix|docs|chore|refactor)\/[a-z0-9][a-z0-9-]*$/` を満たすこと。
**Issue番号:** $ARGUMENTS に数字のIssue番号が含まれる場合は `feature/42-<slug>` 形式で含める。
**slug:** kebab-case で3〜5単語以内。日本語・大文字・アンダースコア禁止。

提案フォーマット（選択肢は絶対に出さない）:

```
ブランチ名: `fix/cta-button` でよいですか？
（変更する場合は希望のブランチ名を入力してください）
```

ユーザーの返答をブランチ名として確定する。ユーザーが「はい」「OK」「yes」など肯定した場合は提案名をそのまま使う。

---

## Step 4: ブランチ作成

```bash
git fetch origin main
git checkout -b <確定ブランチ名> origin/main
```

---

## Step 5: 着手レポート

以下のフォーマットで出力する:

```
✅ ブランチ作成完了

ブランチ: <ブランチ名>
タスク: <タスクの目的を1〜2文で要約>

担当ガード:
  Layer: <Layer 1 / 2 / 3>
  担当者: <えんまさ / まあみ / ヒラメ>
  変更予定エリア: <app/api/**, components/** など>

次のステップ:
  1. <最初に確認・実装すべきこと>
  2. 実装完了後は /finish-task で品質チェック → PR作成
```
