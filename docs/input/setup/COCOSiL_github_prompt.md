# COCOSiL `.github` 一括生成プロンプト

> **使い方：** このプロンプト全文を Claude Code のチャット欄に貼り付けて実行する。
> プロジェクトルートで `claude` を起動した状態で使用すること。
> 既存ファイルがある場合は `--force` フラグを使うか、事前に確認する。

---

## ━━ プロンプト本文 ━━

以下の仕様に従って、COCOSiLリポジトリの `.github/` ディレクトリ配下に必要なファイルを**すべて新規作成**してください。

### プロジェクト情報（読み取り専用・変更しない）
- スタック：Next.js 15 (App Router) / TypeScript / Tailwind / Supabase / Clerk / OpenAI / Vercel
- パッケージマネージャ：pnpm
- テストフレームワーク：Vitest
- リポジトリ構成：`apps/web`（フロント）/ `apps/api`（Route Handler）/ `packages/diagnosis`（診断ロジック）/ `packages/chat`（共感チャット）
- チーム：@enma（CEO・言語設計）/ @hirame（バックエンド）/ @maami（フロントUI）

---

### 【Task 1】`.github/workflows/ci.yml` を作成する

以下の要件をすべて満たすこと。

**jobs の並列実行構成（`needs` なし・全jobを同時起動）：**
- `typecheck`：`pnpm typecheck`（`tsconfig.json` の `incremental: true` 前提）
- `lint`：`pnpm lint`（ESLintキャッシュ有効化 `--cache --cache-location .eslintcache`）
- `test`：`pnpm vitest run`（`--reporter=verbose`）
- `build`：`pnpm build`（`typecheck` job が green の場合のみ、`needs: [typecheck]` で接続）

**キャッシュ設定（全job共通）：**
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      node_modules
      apps/web/.next/cache
      .eslintcache
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

**pnpmセットアップ：**
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'
```

**トリガー：**
```yaml
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
```

**目標：全job合計2-3分以内**

---

### 【Task 2】`.github/workflows/security.yml` を作成する

以下のstepsを含む1つのjobとして実装すること（CIとは独立して並列実行）。

**Step 1 - Supabase RLS lint：**
```yaml
- name: Check Supabase RLS policies
  run: |
    npm install -g supabase
    supabase db lint --project-id ${{ secrets.SUPABASE_PROJECT_ID }} \
      --level warning 2>&1 | tee rls-report.txt
    if grep -q "RLS is disabled" rls-report.txt; then
      echo "::error::RLS未設定テーブルが検出されました。supabase/migrations/ を確認してください。"
      exit 1
    fi
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**Step 2 - 環境変数ハードコード検出：**
```yaml
- name: Scan for hardcoded secrets
  run: |
    # OPENAI_API_KEY / CLERK_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY の
    # ハードコードをsrcディレクトリ内で検索
    if grep -rn "sk-\|eyJh\|service_role" apps/ packages/ \
      --include="*.ts" --include="*.tsx" \
      --exclude-dir="node_modules" --exclude-dir=".next"; then
      echo "::error::APIキーまたはサービスロールキーのハードコードが検出されました"
      exit 1
    fi
```

**Step 3 - プロンプトスナップショット保護：**
```yaml
- name: Check prompt snapshot integrity
  run: |
    # packages/chat/src/prompts/ 配下の.tsファイルのSHA256を計算
    find packages/chat/src/prompts -name "*.ts" -exec sha256sum {} \; \
      | sort > /tmp/prompt-hashes-current.txt
    
    # ベースブランチのハッシュと比較
    git fetch origin ${{ github.base_ref }}
    git show origin/${{ github.base_ref }}:packages/chat/src/prompts \
      2>/dev/null || echo "新規ディレクトリ"
    
    if git diff --name-only origin/${{ github.base_ref }}...HEAD \
      | grep -q "packages/chat/src/prompts/"; then
      echo "::warning title=プロンプト変更検出::共感チャットのプロンプトファイルが変更されています。@enma によるレビューが必要です。"
      # PRにコメントを追加
      gh pr comment ${{ github.event.pull_request.number }} \
        --body "⚠️ **プロンプト変更検出**\n\n\`packages/chat/src/prompts/\` 配下のファイルが変更されています。\nえんまさのトーン・言語設計レビューが必要です。\n\n関連: [言語設計文書 v1.0](docs/language-design.md)"
    fi
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Step 4 - pnpm audit：**
```yaml
- name: Security audit
  run: pnpm audit --audit-level moderate
  continue-on-error: true  # 警告はPRコメントで通知、CIは落とさない
```

**トリガー：** `pull_request`（mainへのPR時のみ）

---

### 【Task 3】`.github/workflows/deploy.yml` を作成する

**main pushのみでトリガー。以下の順序で実行：**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. CIが通過していることを確認（required status checks前提）
      
      # 2. Supabase マイグレーション適用
      - name: Apply Supabase migrations
        run: |
          npm install -g supabase
          supabase db push --project-id ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      # 3. Vercel本番デプロイ
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      # 4. デプロイ完了通知（Slackまたはコンソール）
      - name: Notify deployment
        run: |
          echo "✅ COCOSiL 本番デプロイ完了: $(date '+%Y-%m-%d %H:%M:%S JST')"
```

---

### 【Task 4】`.github/CODEOWNERS` を作成する

以下の仕様で作成すること。コメント（#）で役割説明を付ける。

```
# COCOSiL CODEOWNERS
# ドキュメント: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# ─── デフォルト（全員レビュー可） ───
*  @enma @hirame @maami

# ─── 言語設計・AIプロンプト → えんまさ必須 ───
# 共感チャットのトーン・システムプロンプトは非交渉のUXコア
packages/chat/src/prompts/   @enma
packages/chat/src/tones/     @enma
docs/empathetic-chat-*.md    @enma
docs/language-design.md      @enma

# ─── 診断ロジック → えんまさ + ヒラメ共同所有 ───
# ドメイン知識（MBTI×体癖）はえんまさ、実装はヒラメ
packages/diagnosis/          @enma @hirame

# ─── バックエンド・API・インフラ → ヒラメ必須 ───
apps/api/                    @hirame
supabase/                    @hirame
packages/chat/src/streaming/ @hirame

# ─── フロントエンドUI → まあみ必須 ───
apps/web/                    @maami
apps/web/components/         @maami
apps/web/app/                @maami

# ─── セキュリティ・CI設定 → 全員必須 ───
.github/                     @enma @hirame @maami
.env.example                 @enma @hirame @maami
next.config.*                @hirame @maami
supabase/config.toml         @hirame
```

---

### 【Task 5】`.github/dependabot.yml` を作成する

```yaml
version: 2
updates:
  # npm/pnpm パッケージ
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 5
    reviewers:
      - "hirame"
    labels:
      - "dependencies"
      - "automated"
    # セキュリティアップデートは即時
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]  # メジャーは手動

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    reviewers:
      - "hirame"
```

---

### 【Task 6】`.github/pull_request_template.md` を作成する

以下のチェックリストを含むテンプレートを作成。COCOSiLのドメイン知識と
役割分担に合わせた設計にすること。

```markdown
## 概要
<!-- このPRで何を変えたかを1-3行で。Issueがあれば Closes #xxx -->

## 変更の種類
- [ ] 機能追加（新機能）
- [ ] バグ修正
- [ ] リファクタリング（機能変更なし）
- [ ] 依存関係の更新
- [ ] ドキュメント更新
- [ ] CI/設定変更

## 実装チェックリスト

### 全員共通
- [ ] `pnpm typecheck` がローカルでパスしている
- [ ] `pnpm test` がローカルでパスしている
- [ ] `.env.example` に新しい環境変数を追記した（追加した場合）
- [ ] `CLAUDE.md` または `docs/` の更新が必要な変更でないか確認した

### バックエンド変更時（ヒラメ担当）
- [ ] 新規テーブルに RLS ポリシーを設定した
- [ ] Supabase マイグレーションファイルを `supabase/migrations/` に追加した
- [ ] `docs/supabase-schema.md` を更新した（スキーマ変更がある場合）
- [ ] 新規APIに Zod バリデーションを実装した
- [ ] Clerk の `auth()` で認証を確認している

### フロントUI変更時（まあみ担当）
- [ ] モバイル（375px）でレイアウトを確認した
- [ ] shadcn/ui の既存コンポーネントを使い回せないか確認した
- [ ] `'use client'` が本当に必要か確認した（Server Componentで代替可能でないか）
- [ ] `error.tsx` と `loading.tsx` を配置した（非同期ページの場合）

### 言語・プロンプト変更時（えんまさ担当）
- [ ] 「占い」禁止ワードを使用していない（言語設計文書 v1.0 確認済み）
- [ ] 共感チャットのトーンが「共感→安心→分析→行動」シーケンスに沿っている
- [ ] プロンプトスナップショットのレビュー依頼を関係者に送った

## スクリーンショット（UIの変更がある場合）
<!-- Before / After のスクリーンショットを貼る -->

## レビュアーへのメモ
<!-- レビュー時に特に見てほしい点、懸念点、背景情報など -->
```

---

### 【Task 7】`.github/ISSUE_TEMPLATE/` 配下に2ファイルを作成する

**`bug_report.yml`：**
```yaml
name: バグ報告
description: 不具合を報告する
title: "[BUG] "
labels: ["bug", "needs-triage"]
assignees: []
body:
  - type: textarea
    id: description
    attributes:
      label: バグの説明
      description: 何が起きているか説明してください
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: 再現手順
      placeholder: |
        1. 〇〇画面を開く
        2. 〇〇ボタンをタップ
        3. エラーが発生
    validations:
      required: true
  - type: dropdown
    id: area
    attributes:
      label: 影響範囲
      options:
        - 共感AIチャット
        - MBTI診断
        - 統合レポート（4体系）
        - SNSシェアカード
        - アクション記録
        - 認証（ログイン/登録）
        - その他
    validations:
      required: true
  - type: textarea
    id: environment
    attributes:
      label: 環境
      placeholder: ブラウザ、OS、デバイス種別など
```

**`feature_request.yml`：**
```yaml
name: 機能提案
description: 新機能や改善を提案する
title: "[FEAT] "
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: 解決したい問題
      description: |
        「〇〇として、〇〇したい、なぜなら〇〇だから」の形式で書くと助かります
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: 提案する解決策
    validations:
      required: true
  - type: dropdown
    id: user_segment
    attributes:
      label: 対象ユーザー
      multiple: true
      options:
        - 25-35歳 若手社会人（プライマリー）
        - MBTIに詳しいアーリーアダプター
        - 35-45歳 占いヘビーユーザー
        - 18-24歳 深夜感情発散層
        - 全員
```

---

### 【Task 8】GitHub Branch Protection Rules の設定ガイドを出力する

`.github/BRANCH_PROTECTION_GUIDE.md` として以下の内容を作成すること（自動化できないのでGitHub UI手順を明示）：

```markdown
# Branch Protection Rules 設定手順

> GitHub UIから手動で設定が必要。このファイルはその手順書。
> 設定場所: Settings > Branches > Branch protection rules > Add rule

## main ブランチ

### Protect matching branches: `main`

**Require a pull request before merging:**
- [x] Require a pull request before merging
- Required number of approvals before merging: **1**
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from Code Owners ← 最重要・必ず有効化

**Require status checks to pass before merging:**
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- 必須status checks（検索して追加）：
  - `ci / typecheck`
  - `ci / lint`
  - `ci / test`
  - `security / security-check`

**Restrict pushes:**
- [x] Restrict pushes that create files with a path that matches this rule
- Block force pushes: [x]

### develop ブランチ（任意）

Require status checks のみ（レビュー不要でスピード優先）：
- `ci / typecheck`
- `ci / test`

---

## GitHub Secrets の設定

> Settings > Secrets and variables > Actions > New repository secret

必須シークレット一覧：
| Secret名 | 取得場所 | 担当 |
|---|---|---|
| `SUPABASE_PROJECT_ID` | Supabase > Project Settings | ヒラメ |
| `SUPABASE_ACCESS_TOKEN` | Supabase > Account > Access tokens | ヒラメ |
| `VERCEL_TOKEN` | Vercel > Settings > Tokens | えんまさ |
| `VERCEL_ORG_ID` | Vercel > Settings > General | えんまさ |
| `VERCEL_PROJECT_ID` | Vercel > Project > Settings > General | えんまさ |
| `OPENAI_API_KEY` | OpenAI Platform > API Keys | えんまさ |
| `CLERK_SECRET_KEY` | Clerk > API Keys | えんまさ |
```

---

### 実行完了後に確認すること

上記8つのタスクを全て実行した後、以下のコマンドで作成ファイルを確認してください：

```bash
find .github -type f | sort
```

期待される出力：
```
.github/BRANCH_PROTECTION_GUIDE.md
.github/CODEOWNERS
.github/ISSUE_TEMPLATE/bug_report.yml
.github/ISSUE_TEMPLATE/feature_request.yml
.github/dependabot.yml
.github/pull_request_template.md
.github/workflows/ci.yml
.github/workflows/deploy.yml
.github/workflows/security.yml
```

全ファイルが存在することを確認したら、以下のバリデーションを実行してください：

```bash
# YAMLの構文チェック
pnpm dlx js-yaml .github/workflows/ci.yml > /dev/null && echo "ci.yml: OK"
pnpm dlx js-yaml .github/workflows/security.yml > /dev/null && echo "security.yml: OK"
pnpm dlx js-yaml .github/workflows/deploy.yml > /dev/null && echo "deploy.yml: OK"
pnpm dlx js-yaml .github/dependabot.yml > /dev/null && echo "dependabot.yml: OK"
echo "✅ 全ファイルの構文チェック完了"
```

エラーがある場合は修正してから `git add .github/ && git commit -m "ci: .github 初期設定"` でコミットしてください。

---

## ━━ プロンプト本文 終わり ━━

---

## 補足：Hooksとの役割分担チートシート

このプロンプトで生成するGitHub Actionsと、既存のClaude Code Hooksの
役割分担を以下に整理する。実装時の判断基準として使うこと。

| 施策 | 実装場所 | 理由 |
|---|---|---|
| prettier/eslint自動修正 | **Hooks (PostToolUse)** | 書いた直後に直す・CI時間を節約 |
| TypeScriptエラー確認 | **両方** | Hooksでローカル確認、CIでチーム確認 |
| Supabase RLS lint | **GitHub Actions (security.yml)** | ローカルに認証情報を置かない |
| `.env`書き込みブロック | **Hooks (PreToolUse)** | 即時・ローカルで防ぐ |
| プロンプトスナップショット | **GitHub Actions (security.yml)** | ベースブランチとの比較が必要 |
| pnpm test実行 | **Hooks (Stop)** | 完了前確認、CIでも必須 |
| Vercelデプロイ | **GitHub Actions (deploy.yml)** | Secrets管理・本番環境 |
| ハードコードシークレット検出 | **GitHub Actions (security.yml)** | スキャン対象が広い |
| ブランチ保護 | **Branch Protection Rules** | GitHub UI設定のみ |

## 補足：段階的導入ロードマップ

| フェーズ | 期間 | 対象ファイル | 所要時間 |
|---|---|---|---|
| Phase 1 | Day 1 | `ci.yml` + Branch Protection設定 | 1.5時間 |
| Phase 2 | Day 2 | `CODEOWNERS` + `pull_request_template.md` | 1時間 |
| Phase 3 | Day 3 | `security.yml`（RLS lint + ハードコード検出） | 2時間 |
| Phase 4 | Day 4 | `deploy.yml` | 1-2時間 |
| Phase 5 | Week 1 | `dependabot.yml` + Issue templates | 30分 |
| Phase 6 | Month 1 | プロンプトスナップショット完全版 | 3時間 |
