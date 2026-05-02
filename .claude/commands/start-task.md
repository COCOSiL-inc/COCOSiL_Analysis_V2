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
