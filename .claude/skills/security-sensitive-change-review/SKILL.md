---
name: security-sensitive-change-review
description: Review changes affecting authentication, authorization, secrets, data access, database migrations, infrastructure, deployment, or destructive operations.
---

# Security Sensitive Change Review

Check:

- secrets exposure
- auth/authz boundaries
- data access
- migration safety
- deployment risk
- destructive operations
- audit logging

## COCOSiL 固有チェック項目

- **Supabase RLS**: 新規テーブル・ポリシー変更時は `SELECT/INSERT/UPDATE/DELETE` 4アクション全てのポリシーが意図通りか確認する
- **Clerk 認証境界**: `proxy.ts` 内の `clerkMiddleware` 設定変更は Layer1 保護対象。`publicRoutes` / `ignoredRoutes` の変更は意図外公開を招く可能性がある
- **Next.js API route のデータアクセス**: `app/api/**` の全ルートで `getServerEnv()` 経由の環境変数読み込みか確認。`process.env` 直参照は禁止
- **Layer2 保護領域の変更**: `lib/prompts/**` / `lib/data/**` / `lib/diagnostics/**` を変更する場合は えんまさ 承認が必要
- **環境変数の露出**: クライアントコンポーネントで `NEXT_PUBLIC_` 以外の変数を参照していないか確認
