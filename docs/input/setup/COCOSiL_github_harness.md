# COCOSiL GitHub ハーネス整備ガイド
**「最初期に何を、なぜ、どの順番で整備するか」決定版**

> **ハーネスとは：** AIエージェント（Claude Code）が高速に実装するほど、
> 品質劣化・事故・役割衝突のリスクも等速で高まる。
> ハーネスはそのリスクを「構造で防ぐ」安全網の総称。
> 手動ルールや口頭合意ではなく、**Gitの仕組みそのものに組み込む**のが原則。

---

## 判断基準：「最初期」の定義

> 「最初のチームPRがmainにマージされる前」に必ず完成していること。
> それ以外は Week 1 以降でよい。

**なぜこの線引きか：**
ハーネスなしのPRが1件でもmainに入ると、以下が起きる：
- 型エラーやRLS未設定が本番に滲み出る
- 「誰がレビューすべきか」が曖昧なまま習慣化する
- ハーネスを後から入れるコストが「最初から入れる」より3〜5倍になる

---

## 全体マップ：3層構造

```
Layer 0 │ リポジトリ設定（GitHub UI）
        │  ブランチ保護 / Secrets登録
        │  ─── 所要時間: 20分 ─── ← Day 1 の最初にやる
        │
Layer 1 │ .github/ ファイル群（コードで管理）
        │  ci.yml / CODEOWNERS / pull_request_template.md
        │  ─── 所要時間: 2時間 ─── ← Day 1 中に完成
        │
Layer 2 │ 自動化の拡張（Week 1）
        │  security.yml / deploy.yml / dependabot.yml
        │  ─── 所要時間: 4時間 ─── ← Sprint 2 開始前までに
```

---

## Layer 0：リポジトリ設定（GitHub UI）

### 0-1. Branch Protection Rules（main）

> **Settings → Branches → Add rule → Branch name pattern: `main`**

設定する項目（チェックを入れるもの）:

```
☑ Require a pull request before merging
  └ Required approving review count: 1
  └ ☑ Dismiss stale pull request approvals when new commits are pushed
  └ ☑ Require review from Code Owners   ← CODEOWNERS と連動。最重要

☑ Require status checks to pass before merging
  └ ☑ Require branches to be up to date before merging
  └ Status checks（ci.yml 完成後に追加）:
      ci / typecheck
      ci / lint
      ci / test

☑ Block force pushes
```

**COCOSiL固有の理由：**
- `Require review from Code Owners` がないと、えんまさのレビューなしに
  共感チャットのプロンプトがmainに入る事故が起きる
- `Dismiss stale approvals` がないと、承認後に追加コミットが入っても
  レビューが有効なままになる

---

### 0-2. GitHub Secrets 登録

> **Settings → Secrets and variables → Actions → New repository secret**

| Secret名 | 取得場所 | 担当 | 用途 |
|---|---|---|---|
| `SUPABASE_PROJECT_ID` | Supabase → Project Settings | ヒラメ | security.yml の RLS lint |
| `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access tokens | ヒラメ | supabase CLI 認証 |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens | えんまさ | deploy.yml |
| `VERCEL_ORG_ID` | Vercel → Project → Settings | えんまさ | deploy.yml |
| `VERCEL_PROJECT_ID` | Vercel → Project → Settings | えんまさ | deploy.yml |

> ⚠️ **Secrets は `.env` に書かない・コードに書かない。**
> `security-guidance` プラグインと `ci.yml` のハードコード検出で二重に防ぐ。

---

## Layer 1：.github/ ファイル群（Day 1 完成目標）

### ファイル構成

```
.github/
├── workflows/
│   └── ci.yml                    ← Day 1 最優先
├── CODEOWNERS                    ← Day 1 必須
└── pull_request_template.md      ← Day 1 必須
```

---

### 1-1. `.github/workflows/ci.yml`

**目的：** 全PRで型・Lint・テスト・ビルドを自動実行。手動確認をゼロにする。

**設計方針：**
- `typecheck` / `lint` / `test` を **並列実行**（`needs` なし）→ 合計2〜3分以内
- `build` は `typecheck` 通過後のみ（`needs: [typecheck]`）
- `pnpm` + `actions/cache@v4` でキャッシュ → 2回目以降は `pnpm install` が8秒以下に

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  typecheck:
    name: TypeScript
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - uses: actions/cache@v4
        with:
          path: |
            ~/.pnpm-store
            node_modules
            apps/web/.next/cache
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: ${{ runner.os }}-pnpm-
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  lint:
    name: ESLint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - uses: actions/cache@v4
        with:
          path: |
            ~/.pnpm-store
            node_modules
            .eslintcache
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: ${{ runner.os }}-pnpm-
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint --cache --cache-location .eslintcache

  test:
    name: Vitest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - uses: actions/cache@v4
        with:
          path: |
            ~/.pnpm-store
            node_modules
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: ${{ runner.os }}-pnpm-
      - run: pnpm install --frozen-lockfile
      - run: pnpm vitest run --reporter=verbose
    env:
      # テスト用のダミー環境変数（実際の値はSecretに入れない）
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_dummy
      CLERK_SECRET_KEY: sk_test_dummy
      NEXT_PUBLIC_SUPABASE_URL: https://dummy.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy_anon_key

  build:
    name: Next.js Build
    runs-on: ubuntu-latest
    needs: [typecheck]          # 型が通った後のみビルド
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - uses: actions/cache@v4
        with:
          path: |
            ~/.pnpm-store
            node_modules
            apps/web/.next/cache
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: ${{ runner.os }}-pnpm-
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
    env:
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_dummy
      CLERK_SECRET_KEY: sk_test_dummy
      NEXT_PUBLIC_SUPABASE_URL: https://dummy.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy_anon_key
```

**ポイント解説：**

| 設計 | 理由 |
|---|---|
| `--frozen-lockfile` | lockfileと不一致のインストールをCIで禁止。Claudeが `pnpm install <package>` を忘れてもCIが落ちる |
| ダミー環境変数 | ClerkとSupabaseはAPIキーなしで起動しないが、テストには実値不要。CIでSecretを使わない設計 |
| `vitest run --reporter=verbose` | 何のテストが落ちたか一目で分かる |
| `build` は `needs: [typecheck]` | 型エラーがあるままビルドを走らせない（時間節約） |

---

### 1-2. `.github/CODEOWNERS`

**目的：** 「誰のコードが変わったら誰がレビューするか」をGitで宣言する。
Branch Protectionの `Require review from Code Owners` と連動して強制力を持つ。

```
# .github/CODEOWNERS
# COCOSiL — ドメイン境界に基づくレビュー責任者定義
# 書式: <パス> <@GitHubユーザー名>
# 優先度: 下の行が上の行を上書きする

# ── デフォルト（全員がレビュー可能）──────────────────────────
*                                    @enma @hirame @maami

# ── 言語設計・AIプロンプト ── えんまさ必須 ──────────────────
# 共感チャットのトーンとシステムプロンプトは非交渉のUXコア。
# Claudeが「改善」という名目で変更した場合も検知・レビュー必須。
packages/chat/src/prompts/           @enma
packages/chat/src/tones/             @enma
packages/diagnosis/src/archetypes/  @enma
docs/empathetic-chat-*.md            @enma
docs/language-design.md              @enma
docs/mbti-mapping.md                 @enma

# ── 診断ロジック ── えんまさ + ヒラメ 共同所有 ───────────────
# ドメイン知識（MBTI×体癖）はえんまさ、型・実装はヒラメ
packages/diagnosis/                  @enma @hirame

# ── バックエンドAPI・インフラ ── ヒラメ必須 ──────────────────
apps/api/                            @hirame
supabase/                            @hirame
packages/chat/src/streaming/         @hirame

# ── フロントエンドUI ── まあみ必須 ───────────────────────────
apps/web/                            @maami
apps/web/components/                 @maami
apps/web/app/                        @maami

# ── セキュリティ・CI・設定変更 ── 全員必須 ───────────────────
# .github/ の変更は誰か一人が気づかないと危険
.github/                             @enma @hirame @maami
.env.example                         @enma @hirame @maami
next.config.*                        @hirame @maami
supabase/config.toml                 @hirame
```

**COCOSiL固有の設計判断：**

```
packages/chat/src/prompts/ → @enma のみ

なぜ：共感チャットのシステムプロンプトは「言語設計文書 v1.0」に
      定義された非交渉のトーン・安全設計が含まれる。
      ヒラメがAPIを改修した際に誤ってプロンプトを変更しても、
      えんまさのレビューが必須になる。
```

---

### 1-3. `.github/pull_request_template.md`

**目的：** PRを出す前に「何を確認したか」を構造化する。
Claude Codeが実装した内容のセルフチェックを強制する役割を持つ。

```markdown
## 概要
<!-- 何を変えたか1〜3行で。Issue番号があれば: Closes #xxx -->

## 変更の種類
- [ ] 機能追加
- [ ] バグ修正
- [ ] リファクタリング（機能変更なし）
- [ ] ドキュメント更新
- [ ] CI・設定変更

---

## セルフチェック（マージ前に全員確認）

### 共通
- [ ] `pnpm typecheck` がローカルで通っている
- [ ] `pnpm test` がローカルで通っている
- [ ] `.env.example` に新しい環境変数を追記した（追加した場合）

### バックエンド変更時（ヒラメ）
- [ ] 新規テーブルに **RLS ポリシー**を設定した
- [ ] `supabase/migrations/` にマイグレーションファイルを追加した
- [ ] 新規APIに **Zod バリデーション**を実装した
- [ ] `auth()` で userId を取得し、未認証は 401 を返している

### フロントエンドUI変更時（まあみ）
- [ ] **モバイル（375px）** でレイアウトを確認した
- [ ] `'use client'` が本当に必要か確認した
- [ ] 非同期ページに `error.tsx` を配置した

### 言語・プロンプト変更時（えんまさ）
- [ ] 「占い」「鑑定」「運勢」「当たる」を使っていない（言語設計文書 v1.0）
- [ ] 「共感 → 安心 → 分析 → 行動」の順序を守っている

---

## スクリーンショット（UIの変更がある場合）
| Before | After |
|---|---|
|  |  |
```

---

## Layer 2：自動化の拡張（Week 1 完成目標）

### ファイル構成（追加分）

```
.github/
├── workflows/
│   ├── ci.yml                    ← Layer 1 で完成済み
│   ├── security.yml              ← Week 1 追加
│   └── deploy.yml                ← Week 1 追加
├── CODEOWNERS                    ← Layer 1 で完成済み
├── pull_request_template.md      ← Layer 1 で完成済み
└── dependabot.yml                ← Week 1 追加（30分で終わる）
```

---

### 2-1. `.github/workflows/security.yml`

**目的：** Claude Codeが起こしやすい事故に特化したゲート。
ci.yml とは **独立して並列実行**（CI通過しても security が落ちたらマージ不可）。

```yaml
# .github/workflows/security.yml
name: Security

on:
  pull_request:
    branches: [main]

jobs:
  security-check:
    name: Security Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0          # git log / diff のために全履歴を取得

      # ── Step 1: APIキーのハードコード検出 ──────────────────────────
      - name: Scan for hardcoded secrets
        run: |
          echo "=== Scanning for hardcoded secrets ==="
          # OpenAI / Clerk / Supabase のキーパターンを検索
          FOUND=$(grep -rn \
            -e "sk-[a-zA-Z0-9]\{20,\}" \
            -e "eyJh[a-zA-Z0-9_-]\{50,\}" \
            -e "service_role" \
            --include="*.ts" --include="*.tsx" --include="*.js" \
            --exclude-dir=node_modules --exclude-dir=.next \
            apps/ packages/ 2>/dev/null || true)
          if [ -n "$FOUND" ]; then
            echo "::error::APIキーまたはサービスロールキーのハードコードが検出されました"
            echo "$FOUND"
            exit 1
          fi
          echo "✅ シークレットのハードコードなし"

      # ── Step 2: Supabase RLS lint ──────────────────────────────────
      # マイグレーションファイルに変更があった場合のみ実行
      - name: Check Supabase migrations changed
        id: check-migrations
        run: |
          CHANGED=$(git diff --name-only origin/${{ github.base_ref }}...HEAD \
            | grep "^supabase/migrations/" || true)
          echo "changed=$CHANGED"
          if [ -n "$CHANGED" ]; then
            echo "has_migration_change=true" >> $GITHUB_OUTPUT
          else
            echo "has_migration_change=false" >> $GITHUB_OUTPUT
          fi

      - name: Supabase RLS Lint
        if: steps.check-migrations.outputs.has_migration_change == 'true'
        run: |
          echo "=== Checking RLS policies in migration files ==="
          # 新規テーブル定義（CREATE TABLE）にRLSが続いているか確認
          NEW_TABLES=$(grep -rn "CREATE TABLE" supabase/migrations/ || true)
          if [ -n "$NEW_TABLES" ]; then
            echo "新規テーブルを検出しました。RLSポリシーを確認します..."
            # ENABLE ROW LEVEL SECURITY が同ファイル内に存在するか
            for file in supabase/migrations/*.sql; do
              if grep -q "CREATE TABLE" "$file"; then
                if ! grep -q "ENABLE ROW LEVEL SECURITY\|enable row level security" "$file"; then
                  echo "::error file=$file::RLS が有効化されていないテーブルがあります"
                  echo "::error::ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY; を追加してください"
                  exit 1
                fi
              fi
            done
          fi
          echo "✅ RLSポリシー確認完了"

      # ── Step 3: プロンプトファイル変更の検知 ──────────────────────
      - name: Detect prompt file changes
        run: |
          CHANGED=$(git diff --name-only origin/${{ github.base_ref }}...HEAD \
            | grep "packages/chat/src/prompts/" || true)
          if [ -n "$CHANGED" ]; then
            echo "::warning title=プロンプト変更検出::共感チャットのプロンプトファイルが変更されています"
            # PRにコメントを追加
            gh pr comment ${{ github.event.pull_request.number }} \
              --body "⚠️ **共感プロンプト変更を検出**

\`packages/chat/src/prompts/\` 配下のファイルが変更されています。
えんまさ（言語設計オーナー）のレビューが必須です。

変更ファイル:
\`\`\`
$CHANGED
\`\`\`

確認事項（えんまさ）:
- [ ] 「占い」「鑑定」等の禁止語彙が混入していないか
- [ ] 共感→安心→分析→行動のシーケンスが維持されているか
- [ ] 安全ガード（医療助言禁止・自殺念慮検知）が保持されているか" || true
          fi
          echo "✅ プロンプト変更チェック完了"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # ── Step 4: pnpm audit ─────────────────────────────────────────
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - name: Security audit
        run: pnpm audit --audit-level high
        # high以上の脆弱性のみCIを落とす（moderate は警告のみ）
```

**各Stepの設計根拠：**

| Step | 防ぐ事故 | Claude Code固有度 |
|---|---|---|
| ハードコード検出 | OpenAI/Supabase/Clerk keyをコードに直書き | ★★★（Claudeはたまにやらかす） |
| RLS lint | 新テーブルが全公開になる | ★★★（性格診断データ・チャット履歴が危険） |
| プロンプト変更検知 | 共感チャットのトーンが意図せず変わる | ★★★（COCOSiL固有） |
| pnpm audit | 古い脆弱パッケージをClaudeが追加する | ★★ |

---

### 2-2. `.github/workflows/deploy.yml`

**目的：** `main` マージ後の本番デプロイを自動化。
手動デプロイによるオペレーションミスをゼロにする。

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Production Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # ── Supabase マイグレーション適用 ─────────────────────────────
      - name: Apply Supabase migrations
        uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: |
          supabase db push \
            --project-id ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      # ── Vercel 本番デプロイ ────────────────────────────────────────
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Notify deploy complete
        run: |
          echo "✅ 本番デプロイ完了: $(TZ=Asia/Tokyo date '+%Y-%m-%d %H:%M JST')"
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
```

**設計のポイント：**
- Supabase マイグレーションを **Vercelデプロイより先に** 実行する
  （アプリが新スキーマを期待しているのにDBが古い状態で動くのを防ぐ）
- `main` への push のみ。PRのpreviewはVercelが自動で行う（設定不要）

---

### 2-3. `.github/dependabot.yml`

**目的：** 依存関係の更新を自動PRで通知。設定30分・効果は継続的。

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 3   # 溜まりすぎ防止
    reviewers:
      - "hirame"                  # 依存関係はヒラメが見る
    labels:
      - "dependencies"
    # メジャーバージョンアップは手動（自動マージしない）
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    reviewers:
      - "hirame"
```

---

## 整備の全体タイムライン

```
Day 1（Sprint 1 初日）
  [0h00] Layer 0: Branch Protection + Secrets登録（20分）
  [0h20] Layer 1-a: ci.yml 作成・pushして動作確認（60分）
  [1h20] Layer 1-b: CODEOWNERS 作成（20分）
  [1h40] Layer 1-c: pull_request_template.md 作成（20分）
  [2h00] ✅ 「最初のチームPR」を受け入れられる状態が完成

Week 1（Sprint 1 後半〜Sprint 2 初日）
  security.yml 作成・テスト（120分）
  deploy.yml 作成・Secrets確認・テストデプロイ（90分）
  dependabot.yml 作成（30分）
  ✅ 自動化ハーネスが完成
```

---

## ハーネス全体の役割分担サマリー

```
┌─────────────────────────────────────────────────────────────────┐
│  Claude Code Hooks（ローカル・アドバイザリ）                      │
│                                                                 │
│  PreToolUse   → .env書き込みブロック・危険コマンドブロック         │
│  PostToolUse  → prettier / eslint --fix（書いた直後に修正）       │
│  Stop         → pnpm test 確認プロンプト                         │
│  SessionStart → git status / TODO の自動注入（kizami）           │
│                                                                 │
│  ※ここで防げなかったものは下の「決定的層」で止める               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ git push
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions（リモート・決定的）                               │
│                                                                 │
│  ci.yml        → typecheck / lint / test / build（並列・2〜3分） │
│  security.yml  → ハードコード / RLS / プロンプト変更 / audit      │
│  deploy.yml    → Supabase migration → Vercel本番（main pushのみ）│
│                                                                 │
│  ※CIが落ちればマージ不可（Branch Protectionで強制）              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ PR approve
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  CODEOWNERS × Branch Protection（レビュー・役割ゲート）           │
│                                                                 │
│  packages/chat/src/prompts/ → @enma 必須レビュー                 │
│  apps/api/                  → @hirame 必須レビュー               │
│  apps/web/                  → @maami 必須レビュー                │
│  .github/                   → 全員必須レビュー                   │
│                                                                 │
│  ※誰がどのPRに責任を持つかをコードで宣言                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## よくある失敗と対処

| 失敗 | 原因 | 対処 |
|---|---|---|
| CIが5分以上かかる | `pnpm install` をキャッシュしていない | `actions/cache@v4` で `~/.pnpm-store` をキャッシュ |
| `Required status checks` に追加できない | ci.yml が一度も動いていない | ダミーPRを出してCIを1回走らせる |
| CODEOWNERS が効いていない | `Require review from Code Owners` がOFFのまま | Branch Protection Rules で有効化 |
| security.yml が毎回落ちる | RLS検出の正規表現が厳しすぎる | `ALTER TABLE`と`ENABLE ROW LEVEL SECURITY`の組み合わせで判定 |
| deploy.yml でマイグレーションが失敗 | `SUPABASE_ACCESS_TOKEN` が未設定 | Secrets を確認。supabase CLIのバージョンも確認 |

---

## 参照

- 詳細な生成プロンプト（Claude Code に渡す全YAMLを生成）:
  `COCOSiL_github_prompt.md`
- プラグイン構成との役割分担:
  `COCOSiL_plugin_setup.md`
- Claude Code Hooks との二重防衛設計:
  `COCOSiL_Claude_Code_Operations_Best_Practices.md`
