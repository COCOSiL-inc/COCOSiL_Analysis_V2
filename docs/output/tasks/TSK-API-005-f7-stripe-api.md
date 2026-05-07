---
doc_id: task.f7.stripe-api
title: TSK-API-005 F7 Stripe統合API
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-07
github_issue: "#43"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#47-課金サブスクリプションf7-stripe
related_impl_plan: ""
---

# TSK-API-005：F7 Stripe統合API

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#43](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/43)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F7課金・サブスクリプションのバックエンドAPI。Stripeを決済基盤として4プラン構造を実装。Payment Element / Billing Portal 連携、Webhook（署名検証 + idempotency_key）による認証-課金-DB 3点同期（Clerk → Stripe → Supabase `profiles.plan`）を担当する。法人格設立前は test_mode で全機能実装、法人設立時は API キー入れ替えのみで live_mode へ移行可能な設計とする。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.7 / §6.5 |

---

## 作成・変更ファイル一覧

```
app/api/stripe/
  ├── checkout/route.ts             # POST PaymentIntent / Subscription 作成
  ├── portal/route.ts               # POST Billing Portal セッション
  └── webhook/route.ts              # POST Webhook（署名検証 + idempotency_key）

lib/stripe/
  ├── client.ts                     # Stripe SDK 初期化
  ├── webhook-handlers.ts           # イベント別ハンドラー
  ├── plans.ts                      # 4プラン定義
  └── sync.ts                       # 3点同期ロジック

supabase/migrations/
  └── (profiles.stripe_customer_id / profiles.plan / webhook_events)
```

---

## 実装ステップ

1. Stripe SDK 初期化（`STRIPE_SECRET_KEY` を `getServerEnv()` 経由）
2. 4プラン定義（無料 / 有料3階層）— `plans.ts`
3. POST `/api/stripe/checkout` — PaymentIntent / Subscription 作成、Clerk userId と Stripe customerId をリンク
4. POST `/api/stripe/portal` — Billing Portal セッション生成・リダイレクトURL返却
5. POST `/api/stripe/webhook` — `stripe-signature` ヘッダー検証 → イベント別ハンドラー → Supabase `profiles.plan` 即時更新
6. `webhook_events` テーブルで idempotency_key 管理（重複処理防止）
7. 解約時のフロー：期間終了まで機能維持 → 終了時に自動ダウングレード
8. 決済失敗時：Stripe自動リトライ（3日間）に任せる
9. test_mode/live_mode は環境変数のみで切り替え

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] POST `/api/stripe/checkout` で Payment Element 連携
- [ ] POST `/api/stripe/portal` で Billing Portal リダイレクトURL返却
- [ ] POST `/api/stripe/webhook` が署名検証 + idempotency_key 対応
- [ ] Webhook受信時に Supabase `profiles.plan` を即時更新
- [ ] 解約時：期間終了まで機能維持 → 終了時に自動ダウングレード
- [ ] 決済失敗時：Stripe自動リトライに任せ、ユーザーへメール通知
- [ ] test_mode → live_mode 切り替えが APIキー入れ替えのみで完結
- [ ] Gate 1（ヒラメ）レビュー完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
