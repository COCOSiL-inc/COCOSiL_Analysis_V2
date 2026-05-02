<!-- BEGIN:nextjs-agent-rules -->
# このNext.jsは知っているNext.jsではない

このバージョンには破壊的変更が含まれており、API・規約・ファイル構造がトレーニングデータと異なる場合がある。コードを書く前に `node_modules/next/dist/docs/` の関連ガイドを必ず読むこと。非推奨警告に従うこと。
<!-- END:nextjs-agent-rules -->

# COCOSiL V2 エージェント向けガイドライン

## 0. プロダクト哲学（なぜこのプロダクトを作るか）

COCOSiLは「現代の無明（むみょう）」を解消するために存在する。現代人は職場・恋愛・家族との関係で繰り返し消耗するが、その根因は「自分も相手も、なぜそうなるかを知らない」ことにある。東洋哲学が2500年追求した「自己認識による解放」をAIで民主化する。

### 非交渉のUXシーケンス

```
共感 → 安心 → 分析 → 行動
```

この順序は絶対に変えない。分析を先に出すと共感が壊れ、7日以内再訪率30%というPMF仮説が成立しなくなる。

### PMF成功基準

- 7日以内再訪率 **30%以上**
- この基準を割るような実装判断（共感スキップ・診断結果の即時表示など）はえんまさの承認なしに行ってはならない。

## 1. API-First 設計 & 型安全な契約

- **厳格ルール:** APIリクエスト/レスポンスの型定義をTypeScriptで完成させmainブランチにマージするまで、フロントエンド実装を開始してはならない。
- **コントラクト駆動開発:** 型定義が確定するまで、フロントエンドは合意済みの型に基づいたモックデータで開発を進める。実装の手戻りを防ぐため。

## 2. レイヤードアーキテクチャ（役割分担）

- **バックエンド/インフラ層:** Supabaseセットアップ・DBスキーマ設計・RLS設定・API型定義・コアロジックを担当。データ構造とセキュリティを保証する。
- **フロントエンド/要件層:** 詳細要件・UI/UX実装・Next.js App Router Server Componentsを活用した効率的なフロントエンド開発を担当。

## 3. 技術スタック & SOP

- **スタック:** Next.js 16（App Router必須）, Supabase, Clerk（認証）, OpenAI（F3 共感AIチャット）, Gamma API（F2 統合レポート生成）, Vercel, Tailwind CSS 4, TypeScript 5。
- **Gamma API注意：** F2（統合レポート）の主要依存。レート制限・コスト構造はSprint 3前に必ず確認すること。
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
  - 禁止の理由：COCOSiLはスピリチュアルサービスではなく「根拠のある性格分析プロダクト」。混入するとターゲット層（25-35歳若手社会人）の信頼を失い、SNS拡散もしない。
- **代替表現:** 性格分析、パーソナリティ診断、統合レポート、傾向、特徴
- **例外:** コード内の変数名・DBカラム名では正式名称（動物占い、六星占術）の使用可。
- UIコピー・AIプロンプトを書く前に `language-design` スキルを必ず読み込む。

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

## 8. ブランチ管理規則

**ブランチは必ず `/start-task <タスク説明>` で作成する。** 手動で `git checkout -b` するのではなく、コマンドに任せることで命名規則・事前チェック・担当ガード確認が自動化される。

### 命名規則

| プレフィックス | 用途 | 担当者例 |
|---|---|---|
| `feature/<slug>` | 新機能開発 | ヒラメ・まあみ |
| `fix/<slug>` | バグ修正 | 全員 |
| `docs/<slug>` | ドキュメント・仕様書 | えんまさ |
| `chore/<slug>` | 設定・依存関係・CI変更 | 全員 |
| `refactor/<slug>` | リファクタリング | 全員 |

- `<slug>` は kebab-case（例：`feature/42-mbti-result-page`）
- 日本語・スペース禁止（エンコード問題回避）
- Issue番号プレフィックスは任意（`feature/42-xxx`）
- `/start-task` がタスク説明から prefix と slug を推論して提案する（手入力不要）

### 自動化ルール（3原則）

- **Merge Once, Delete Immediately**：PR マージ後ブランチは自動削除（GitHub Settings「Automatically delete head branches」ON）
- **Name First, Automate Second**：命名規則はここで宣言し、違反はPRコメントで警告のみ（マージブロックなし）
- **Long-term Branches are Explicit**：長期育成ブランチは `.github/PROTECTED_BRANCHES.txt` に明示的に列挙する

### 今やらないこと

- 古いブランチの定期自動削除（6ヶ月後に墓地が問題になったら再検討）
- Issue連動ブランチ自動作成（Issueの使い方が固まってから）

---

## 9. スキル使い分けガイド

### ワークフローコマンド（タスクの入口・実装中・出口）

| タイミング | コマンド | やること |
|------------|----------|----------|
| **タスク着手時（最初に必ず）** | `/start-task <タスク説明>` | pre-flightチェック + ブランチ作成 + 担当ガード確認 |
| **実装中（迷ったとき・変更前に）** | `/cocosil-work` | 担当ガード・品質基準・UXシーケンス確認 |
| **実装完了時（PRを出す前に）** | `/finish-task [PRタイトル]` | typecheck/lint + commit + push/PR作成 |

### いつ何を使うか

| 場面 | スキル | 備考 |
|------|--------|------|
| UIコピー・AIプロンプト・エラーメッセージを書く前 | `/language-design` | **必須**。禁止語チェック・トーン・確定フレーズを確認 |
| COCOSiLのドメイン判断（UXシーケンス・担当境界・4体系）が必要 | `/cocosil-domain` | 実装前の「COCOSiLらしいか」確認にも使う |
| 議論・ブレスト・複数視点での検討 | `/expert-misaki-discussion` | 「議論して」「ブレストして」「複数視点で」が目安 |
| 実装前のゴール確認（単一機能・タスク） | `/goal-grill` | Vision / Outcome / Eval の 3 層。成果物: `docs/output/goals/<slug>.md` |
| 全機能のシステム要件定義・PRD | `/requirements-doc-creator` | Stage 1 → レビュー → Stage 2 の 2 段階。goal-grill より重厚 |
| 認証・DB migration・API route 変更時 | `/security-sensitive-change-review` | **必須**。RLS・Clerk・env var の変更を含む |
| スキル自体の出力がイマイチだった・改善したい | `/skill-improver` | スキル使用後の不満・改善要望に使う |

### トリガーワード早見

- `「着手する」「ブランチ切る」「始める」` → `/start-task <タスク説明>`
- `「完了」「PR出す」「コミットする」` → `/finish-task`
- `「議論して」「ブレストして」「複数視点で」` → `/expert-misaki-discussion`
- `「要件定義」「仕様書」「Requirements」` → `/requirements-doc-creator`
- `「目標を詰めたい」「ゴールが曖昧」「受け入れ基準がない」` → `/goal-grill`
- `「このスキルを改善したい」「出力が期待と違った」` → `/skill-improver`
