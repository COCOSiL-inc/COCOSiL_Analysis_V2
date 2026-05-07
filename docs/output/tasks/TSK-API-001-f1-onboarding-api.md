---
doc_id: task.f1.onboarding-api
title: TSK-API-001 F1 オンボーディングAPI
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-07
github_issue: "#33"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#41-オンボーディング登録f1
related_impl_plan: ""
---

# TSK-API-001：F1 オンボーディングAPI

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#33](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/33)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F1オンボーディングのバックエンドAPI。Clerk認証完了後の生年月日保存、プロファイル初期化、F2自動算出（星座・動物・六星）のトリガー、F1.3「ようこそ」共感対話セッション初期化を担当する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.1 / §4.2.1 / §6.2 |
| Protected Areas | [AGENTS.md §7](../../../AGENTS.md) | Layer 1 境界（Clerk JWT・RLS） |

---

## 作成・変更ファイル一覧

```
app/api/onboarding/
  └── profile/route.ts               # POST /api/onboarding/profile

lib/onboarding/
  ├── schemas.ts                     # Zod（共有: birth_date 検証）
  └── service.ts                     # ビジネスロジック（プロファイル作成 + F2 トリガー）

lib/diagnostics/
  ├── orchestrator.ts                # 3体系（星座・動物・六星）並列算出
  └── (existing animal.ts / six-star.ts / zodiac.ts を呼び出し)

lib/supabase/
  └── server.ts                      # Clerk JWT → Supabase クライアント生成（既存利用）

supabase/migrations/
  └── (必要に応じて RLS ポリシー追加)
```

---

## 実装ステップ

1. Zod スキーマで `birth_date: YYYY-MM-DD` を定義し、未来日付・1900年以前を ValidationError として返す
2. `POST /api/onboarding/profile` を実装：Clerk JWT 検証 → `supabase.auth.getUser()` でユーザー特定 → `profiles` へ INSERT/UPDATE
3. F2.1 a/b/c（星座・動物・六星）のバックグラウンド算出をトリガーし `diagnoses` テーブルへ保存。算出失敗時は該当カラムを `null` 保存
4. F1.3 用 `chat_sessions` を `phase=1`（傾聴）で初期化
5. RLS ポリシー（`user_id = auth.uid()`）を全 CRUD 操作で確認・追加
6. エラー境界処理：Supabase エラーをラップし、`ValidationError` / `InternalError` の2種に正規化してクライアントへ返却

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] POST `/api/onboarding/profile` が生年月日を保存し F2 バックグラウンド算出をトリガー
- [ ] 生年月日異常値（未来日付・1900年以前）を ValidationError で弾く
- [ ] SNS認証後の生年月日スキップ時は「未設定」状態として保持
- [ ] F2.1 算出失敗時は該当カラムを `null` 保存（手動補正導線対応）
- [ ] RLSポリシーで自分のデータのみアクセス可能を確認
- [ ] Gate 1（ヒラメ）レビュー完了：IDOR防御・JWT連携・型安全・N+1・エラー境界の5点

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
