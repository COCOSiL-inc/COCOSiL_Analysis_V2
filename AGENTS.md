<!-- BEGIN:nextjs-agent-rules -->
# このNext.jsは知っているNext.jsではない

このバージョンには破壊的変更が含まれており、API・規約・ファイル構造がトレーニングデータと異なる場合がある。コードを書く前に `node_modules/next/dist/docs/` の関連ガイドを必ず読むこと。非推奨警告に従うこと。
<!-- END:nextjs-agent-rules -->

# COCOSiL V2 エージェント向けガイドライン

## 1. API-First 設計 & 型安全な契約

- **厳格ルール:** APIリクエスト/レスポンスの型定義をTypeScriptで完成させmainブランチにマージするまで、フロントエンド実装を開始してはならない。
- **コントラクト駆動開発:** 型定義が確定するまで、フロントエンドは合意済みの型に基づいたモックデータで開発を進める。実装の手戻りを防ぐため。

## 2. レイヤードアーキテクチャ（役割分担）

- **バックエンド/インフラ層:** Supabaseセットアップ・DBスキーマ設計・RLS設定・API型定義・コアロジックを担当。データ構造とセキュリティを保証する。
- **フロントエンド/要件層:** 詳細要件・UI/UX実装・Next.js App Router Server Componentsを活用した効率的なフロントエンド開発を担当。

## 3. 技術スタック & SOP

- **スタック:** Next.js 16（App Router必須）, Supabase, Vercel, Tailwind CSS 4, TypeScript 5。
- **実行環境:** Unixベース環境（Mac または WSL2）のみ。
- **環境変数:** `.env.local` で管理。リポジトリには絶対にコミットしない。アプリケーションコード内では `@/lib/env` 経由でのみ読む。`process.env` の直接参照禁止。

## 4. リソース制約 & データベース戦略

- **ストレージ上限:** Supabaseは無料枠（最大0.5GB）。テキストデータ（チャット履歴等）はインデックスを最小化し、上限超過を防ぐための積極的な**削除/アーカイブ戦略**を初日から実装すること。
- **プロジェクト数制限:** 古い・未使用のSupabaseプロジェクトは一時停止し、V2のリソースを確保する。

## 5. 開発環境 — 絶対に守るルール

- **パッケージマネージャ:** `pnpm` のみ使用。`npm install` / `yarn add` は禁止。常に `pnpm add` / `pnpm install` を使う。
- **`src/` ディレクトリは存在しない:** パスエイリアス `@/*` は `./*`（プロジェクトルート）にマップされる。ファイルは `app/`・`lib/`・`public/` 直下に置く。`src/app/` や `src/lib/` は存在しない。
- **環境変数の読み方:** `@/lib/env` の `env`（クライアント用）または `getServerEnv()`（サーバー用）を使う。アプリケーションコードで `process.env.XXX` を直接読まない。
- **Supabase型定義:** `pnpm db:types` で生成する（リモートプロジェクト接続）。手書き禁止。
- **Zodのimport:** `zod/v4` サブパスを使う: `import { z } from 'zod/v4'`。
- **Supabase MCP:** `.mcp.json` でプロジェクト共有設定済み。使用にはシェル環境変数 `SUPABASE_ACCESS_TOKEN` が必要（`~/.zshrc` に `export SUPABASE_ACCESS_TOKEN=sbp_...` を追記）。トークンは https://supabase.com/dashboard/account/tokens から取得。

## 6. ドメイン言語 — 禁止表現

ユーザーが目にする文言（UIコピー・AIプロンプト・エラーメッセージ・シェアカード）を書く前に、`language-design` スキルを必ず読み込む。

- **禁止語:** 占い、鑑定、運勢、占い師、当たる、霊感、霊視
- **代替表現:** 性格分析、パーソナリティ診断、統合レポート、傾向、特徴
- **例外:** コード内の変数名・DBカラム名では正式名称（動物占い、六星占術）の使用可。

## 7. Protected Areas（AIエージェント操作境界）

リスクレベル **R2+**（Supabase + Clerk + AI診断データ・課金なし）。判定根拠は `docs/harness/HARNESS_DECISIONS.md` 参照。
詳細は `cocosil-domain` skill / `cocosil-work` command と整合。

### Layer 1：インフラ層（hookで自動ブロック・人間が手動でのみ実行）

`.claude/hooks/prevent-destructive-command.js` が以下のBashコマンドを実行時にブロックする：
- `supabase db reset` / `supabase db push` / `supabase migration repair`
- SQL: `DROP TABLE` / `TRUNCATE` / RLS無効化 / `CREATE POLICY ... FOR ALL`
- `.env` / `.env.local` / `.env.production` / `supabase/.env` の `cat`等読み取り
- `git push --force` / `git reset --hard`

ファイルパスとしての保護対象：
- `supabase/migrations/**`、`supabase/seed.sql`
- `.env*` すべて（`.env.example` 含む）
- `proxy.ts` 内の `clerkMiddleware` 設定
- `lib/clerk/**`（将来予定地）

### Layer 2：コンテンツ層（変更前に意味設計担当 = えんまさ承認必須）

- `lib/prompts/**` — AIプロンプトテンプレート（チャット3フェーズ・統合レポート・シェアカード）
- `lib/data/**` — 4体系ナレッジ（MBTI / 星座 / 動物性格診断 / 六星占術）
- `lib/diagnostics/**` — 診断計算ロジック（実装はヒラメ、内容承認はえんまさ）

### Layer 3：開発層（AI委任OK）

- `app/(auth)/**` / `app/(public)/**` — ページ・レイアウト（まあみ担当）
- `components/**` — UIコンポーネント（まあみ担当）
- `app/api/**` — API ルート（ヒラメ担当・PR レビュー前提）

### 検証コマンド

- `pnpm typecheck` — `tsc --noEmit`（型整合性チェック）
- `pnpm lint` — ESLint
- `pnpm build` — Next.js build（GitHub Secrets登録後にCI追加予定）
- テストコマンドは未整備（`docs/harness/HARNESS_HEALTH.md` の Gap として記録）
