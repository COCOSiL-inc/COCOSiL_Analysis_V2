kecku-harness-bootstrap を使って、このrepoにCOCOSiL専用の最小AIコーディングハーネスを導入してください。

---

## プロジェクト概要

- **プロダクト名**：COCOSiL（性格診断・共感AIチャットサービス）
- **プロジェクトタイプ**：fullstack
- **リスクレベル**：R2+
  - 理由：Supabase（ユーザーDB＋診断履歴）＋Clerk（認証）＋AI診断コンテンツあり
  - 現時点で課金機能なし → 課金実装後はR3に昇格する
- **チーム**：えんまさ（フロントエンド担当）、ヒラメ（バックエンド・API担当）

---

## 技術スタック（検出を補完する情報）

- フレームワーク：Next.js App Router
- DB：Supabase（PostgreSQL、RLSあり）
- 認証：Clerk
- AI：OpenAI Agent Builder
- UI：shadcn/ui、v0によるコンポーネント生成
- パッケージマネージャー：npm または pnpm（package.jsonを確認して判断）

---

## 検証コマンド（存在を確認してから記載すること）

以下のコマンドがpackage.jsonに実在する場合のみ AGENTS.md に記載してください。
存在しないコマンドは捏造せず、HARNESS_HEALTH.md の Gap として記録すること。

確認候補：
- `next build`
- `next lint`
- `tsc --noEmit`（または `npx tsc --noEmit`）
- `pnpm lint` / `npm run lint`
- `pnpm build` / `npm run build`
- テストコマンド（なければ Gap として記録）

---

## 絶対にやらせたくない操作（hookでブロックすること）

### インフラ層（Layer 1）──即時ブロック
- `supabase db reset` — 本番DBが消える
- `supabase db push` — マイグレーション無断実行
- `supabase migration repair` — マイグレーション状態の強制書き換え
- `supabase gen types` を supabase/ 以外のパスに書き出す
- `DROP TABLE` / `TRUNCATE` を含むSQL実行
- `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` — RLS無効化
- `CREATE POLICY ... FOR ALL` — 全権限ポリシーの追加
- `.env` / `.env.local` / `.env.production` / `supabase/.env` の読み取り・編集
- `git push --force` / `git push -f`

### 認証層（Layer 1）──即時ブロック
- Clerk dashboardの設定変更（CLIやAPIキー直接操作）
- JWT secretの変更・ローテーション操作

### 注意：以下はブロックしないこと（開発フローを止めないため）
- `rm -rf node_modules`（依存の再インストールは通常作業）
- `src/components/` 以下への自由な書き込み（えんまさのUIフロー）
- `next build` / `next dev` の実行

---

## AGENTS.md の Protected areas に必ず明記すること

### Layer 1：インフラ層（変更禁止）
- `supabase/migrations/` — DBマイグレーションファイル
- `supabase/seed.sql` — シードデータ
- `.env*` すべて（.env, .env.local, .env.production, .env.example含む）
- Clerk関連の設定ファイル（middleware.ts内のclerkMiddleware設定含む）

### Layer 2：コンテンツ層（変更前に人間に確認）
- `src/data/` または診断コンテンツが置かれているディレクトリ
  （MBTI / 西洋占星術 / 動物占い60種 / 六星占術のナレッジデータ）
- AIプロンプトテンプレートファイル
- `src/prompts/` または `lib/prompts/`（存在する場合）

### Layer 3：開発層（AIに委任OK）
- `src/components/` — UIコンポーネント
- `src/app/` — App Routerのページ・レイアウト
- `src/lib/` — ユーティリティ（DB・認証設定を直接触らないもの）
- `src/hooks/` — カスタムフック

---

## 導入するSkill（.claude/skills/ に配置済みの前提）

🔴 必須：
- `kecku-harness-bootstrap`（このSkill自体）
- `code-change-verification`（変更後の検証）

🟡 推奨（利用可能なら追加）：
- `pr-draft-summary`（PR説明の自動生成）
- `harness-health-improver`（月次メンテナンス用）

---

## 生成してほしいファイル

以下を生成してください（スクリプトで自動生成できるものはスクリプトを使うこと）：

1. `AGENTS.md` — fullstackテンプレートベース。上記のProtected areas・検証コマンド・Skill参照を反映
2. `CLAUDE.md` — 1行目は `@AGENTS.md`
3. `.cursor/rules/project.mdc` — fullstackタイプのルール
4. `.claude/settings.json` — 最小hooks（PreToolUse: destructive block、PostToolUse: formatter、Stop: verify summary）
5. `.claude/hooks/prevent-destructive-command.js` — 上記ブロックパターンを実装
6. `.cursor/hooks.json` — Cursor用（version: 1）
7. `.cursor/hooks/prevent-destructive-command.js` — Cursor版
8. `docs/harness/HARNESS_DECISIONS.md` — リスク分類・設計判断の記録
9. `docs/harness/HARNESS_HEALTH.md` — 既知のGap（テストなし等）を記録
10. `evals/bootstrap.prompts.csv` — COCOSiL固有の評価プロンプト3件以上
11. `.github/workflows/agent-verify.yml` — CI placeholderのみ（実際のコマンドは確認後）

---

## 生成後に報告してほしいこと

1. 生成したファイルの一覧と各ファイルが必要な理由
2. 検出した検証コマンド（実在確認済みのもの）
3. テストコマンドの有無（なければGapとして記録したことを確認）
4. ブロックパターンの一覧（prevent-destructive-command.jsの中身）
5. HARNESS_HEALTH.md に記録したGapの一覧
6. 次の3改善候補

---

## 注意事項

- 存在しないコマンドを捏造しない
- AGENTS.md と CLAUDE.md はそれぞれ100行以内に収める
- hooksは PreToolUse / PostToolUse / Stop の3種類のみ
- 「過剰にしない」——R2+相当の制約のみ。R4水準の制約は不要
- 生成後、HARNESS_DECISIONS.md に「リスクレベルをR2+とした理由」を必ず記録する