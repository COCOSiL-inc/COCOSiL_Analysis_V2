# COCOSiL V2

MBTI × 星座 × 動物占い × 六星占術 の統合性格分析 ＋ 共感AIチャット。  
「根拠のある共感」を届けるパーソナリティ分析 Web アプリ。

## 必要なツール

- Node.js 20+
- pnpm 10+（`npm install -g pnpm`）
- Supabase CLI（Homebrew: `brew install supabase/tap/supabase`）

## セットアップ

```bash
# 1. 環境変数を設定
cp .env.example .env.local
# .env.local を開き、Supabase の URL と Anon Key を記入

# 2. 依存関係をインストール
pnpm install

# 3. 開発サーバーを起動
pnpm dev
```

ブラウザで http://localhost:3000 を開く。

## 主要コマンド

| コマンド | 説明 |
|---|---|
| `pnpm dev` | 開発サーバー起動（Turbopack） |
| `pnpm build` | 本番ビルド |
| `pnpm lint` | ESLint 実行 |
| `supabase gen types typescript --local > lib/types/database.ts` | Supabase 型生成 |

## アーキテクチャメモ

- **`src/` ディレクトリは存在しない:** `@/*` はプロジェクトルート `./*` にマップされる（例: `@/lib/env`）
- **環境変数:** `lib/env.ts` で Zod バリデーション済み。アプリ内では `env` / `getServerEnv()` 経由で読む
- **Supabase 型:** 手書き禁止。`supabase gen types` で生成したファイルを `lib/types/database.ts` に配置

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [コンセプト資料](docs/concepts/コンセプト資料.md) | プロダクト仕様・機能要件・DBスキーマ |
| [アーキテクチャガイドライン](docs/concepts/antigravity_guideline_v2.md) | V2 設計方針 |
| [プラグイン構成](docs/setup/COCOSiL_plugin_setup.md) | Claude Code プラグイン・SKILL 設定 |
| [技術スタック議論ログ](docs/setup/議論ログ_技術スタック選定.md) | 技術選定の背景 |

## 技術スタック

Next.js 16 (App Router) / React 19 / TypeScript 5 / Tailwind CSS 4 / Supabase / Vercel / Zod 4 / pnpm
