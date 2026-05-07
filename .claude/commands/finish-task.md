---
description: タスクの完了処理（品質チェック + commit + PR作成）
allowed-tools: Bash(pnpm typecheck), Bash(pnpm lint), Bash(git add *), Bash(git commit *), Bash(git status *), Bash(git diff *)
argument-hint: "<PR タイトル（省略可）>"
---

以下の手順でタスク完了処理を行ってください。$ARGUMENTS にPRタイトルの候補が入っている場合はそれを参考にする。

## Step 1: 変更内容の確認

```bash
git status --short
git diff --stat HEAD
```

変更されたファイルの一覧と差分サマリーをユーザーに提示する。

---

## Step 1.5: TSK ファイル鮮度チェック

> 手動実装・AI実装問わず、PR作成前にTSKファイルの存在と鮮度を確認する。  
> 参照: `docs/TASK-INDEX.md` / `docs/output/tasks/`

現在のブランチ名からIssue番号を推定する（例: `feature/27-db-schema-cleanup` → `#27`）。

```bash
ls docs/output/tasks/ 2>/dev/null | grep -i "TSK-" | head -20
```

**Issue番号が推定できた場合 — `docs/output/tasks/` 内でIssue番号に対応するTSKファイルを検索:**

- **TSKファイルが存在しない場合**:
  ```
  ⚠️ TSKファイルが見つかりません（Issue #<番号> または対応TSKなし）。
  → docs/output/tasks/TSK-[分類]-NNN-<slug>.md を作成しますか？（y/n）
  → y: _TEMPLATE.md ベースで生成（手動実装のキャッチアップ用）
  → n: 「TASKなし」として Step 2 へ進む（PR template の「TASKなし」にチェック）
  ```

- **TSKファイルが存在する場合**:
  1. front-matter の `status` フィールドを確認
  2. 「実装状況（更新ログ）」セクションが当該PRの変更内容を反映しているか確認を促す:
     ```
     📋 TSKファイル: docs/output/tasks/<ファイル名>
     現在のstatus: <planned/in-progress/review/done>
     
     実装状況を更新しましたか？
     → status を「review」に変更しましたか？（PR作成前の推奨）
     → 実装状況ログに今回の変更内容を追記しましたか？
     ```
  3. `docs/TASK-INDEX.md` の該当行のフェーズ更新を促す（🟡実装中 → 🔴レビュー中）

**Issue番号が不明な場合 / docsのみ変更の場合:**

```
対応するTSKファイルはありますか？
→ TSKファイル名を入力 / 「TASKなし」でスキップ
```

---

## Step 2: 品質チェック

順番に実行し、**どちらかが失敗したら中断して修正を促す**:

```bash
pnpm typecheck
```

```bash
pnpm lint
```

エラーがある場合:
```
❌ <typecheck / lint> が失敗しました。
以下のエラーを修正してから再度 /finish-task を実行してください:

<エラー内容>
```

両方が通った場合のみ Step 3 に進む。

---

## Step 3: コミット

変更内容を分析して Conventional Commits 形式でコミットメッセージを生成する:

- `feat:` — 新機能
- `fix:` — バグ修正
- `docs:` — ドキュメント
- `chore:` — 設定・依存関係
- `refactor:` — リファクタリング
- `style:` — フォーマット・スタイルのみの変更

スコープの例: `(api)`, `(ui)`, `(auth)`, `(db)`, `(prompt)`

```bash
git add <変更された関連ファイル（.env* は絶対に含めない）>
git commit -m "<生成したコミットメッセージ>"
```

**注意:** `.env*` ファイルは絶対に `git add` しない。

---

## Step 4: push と PR 作成

push と PR 作成はデフォルトで確認ダイアログが出る（このコマンドの allowed-tools に含まれていないため）。

push 前に以下を提示する:

```
📤 push と PR 作成の準備ができました。

ブランチ: <現在のブランチ名>
PR タイトル: <$ARGUMENTS または コミットメッセージから生成>

push して PR を作成しますか？
```

ユーザーが承認した場合、以下を順番に実行する:

```bash
git push -u origin <現在のブランチ名>
```

PR body は `/pr-draft-summary` の形式に準拠して生成する（Summary・Test plan・関連Issue）。
`/start-task` の Step 2.5 で記録された設計中枢の判定結果を「設計中枢メモ」として引き継ぐ:

```bash
gh pr create \
  --title "<PRタイトル>" \
  --body "$(cat <<'EOF'
## Summary
- <変更内容を箇条書き 1〜3項目>

## 設計中枢チェック（/start-task 時の判定結果）

| 問い | 判定 | 根拠 |
|---|---|---|
| Q1 無明を晴らすか？ | <○/△/N/A> | <1行> |
| Q2 三毒を増幅しないか？ | <○/△/N/A> | <1行> |
| Q3 順序を守れるか？ | <○/△/N/A> | <1行> |
| Q4 大我への移行支援か？ | <○/△/×/N/A> | <1行> |
| Q5 良い人間関係への寄与か？ | <○/△/×/N/A> | <1行> |

<!-- Should が × の場合は戦略的意味をここに記録: -->

## Test plan
- [ ] pnpm typecheck が通ること
- [ ] pnpm lint が通ること
- [ ] <機能固有のテスト項目>

## 担当ガード確認
- [ ] 変更ファイルが自分の担当レイヤーの範囲内であること
- [ ] UIコピー・AIプロンプトを含む場合は /language-design を確認済み

## TASK 紐づけ
- TSK ファイル: `docs/output/tasks/<TSK-[分類]-[番号3桁]-slug>.md`（または「TASKなし」）
- 対応 Issue: #<番号>（または「なし」）
- TASK-INDEX.md 行フェーズ: 🔴 レビュー中（または「更新不要」）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Step 5: 完了レポート

```
✅ PR 作成完了

PR URL: <URL>
ブランチ: <ブランチ名>
変更ファイル: <ファイル数> ファイル

次のステップ:
  - レビュアーに PR を共有する
  - CI（typecheck・lint）が GitHub Actions で通ることを確認する
```
