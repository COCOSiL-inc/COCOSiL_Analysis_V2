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

PR body は `/pr-draft-summary` の形式に準拠して生成する（Summary・Test plan・関連Issue）:

```bash
gh pr create \
  --title "<PRタイトル>" \
  --body "$(cat <<'EOF'
## Summary
- <変更内容を箇条書き 1〜3項目>

## Test plan
- [ ] pnpm typecheck が通ること
- [ ] pnpm lint が通ること
- [ ] <機能固有のテスト項目>

## 担当ガード確認
- [ ] 変更ファイルが自分の担当レイヤーの範囲内であること
- [ ] UIコピー・AIプロンプトを含む場合は /language-design を確認済み

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
