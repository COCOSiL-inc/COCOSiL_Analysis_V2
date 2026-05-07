---
doc_id: task.f8.data-export-delete-api
title: TSK-API-006 F8 データエクスポート/削除API
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-07
github_issue: "#45"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#48-データオーナーシッププライバシーf8
related_impl_plan: ""
---

# TSK-API-006：F8 データエクスポート/削除API

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#45](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/45)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F8データオーナーシップ・プライバシーのバックエンドAPI。ユーザー自身がデータをエクスポート（JSON/Markdown ZIP）する機能と、アカウント削除（論理削除7日後物理削除 + Stripe解約 + Clerk削除）の機能を提供する。Phase 3実装スコープ。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.8 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 削除確認文言 |

---

## 作成・変更ファイル一覧

```
app/api/account/
  ├── export/route.ts               # POST データエクスポート
  └── delete/route.ts               # POST アカウント削除

lib/account/
  ├── export-builder.ts             # JSON / Markdown ZIP生成
  ├── deletion-orchestrator.ts      # Supabase → Stripe → Clerk 順序実行
  └── schemas.ts                    # Zod 入出力検証

supabase/functions/
  └── physical-delete-batch/        # 7日後物理削除バッチ（Edge Function）

supabase/migrations/
  └── (deleted_at カラム追加 / 物理削除対象テーブルの整理)
```

---

## 実装ステップ

1. POST `/api/account/export` — Supabaseから診断・チャット履歴・アクション記録を収集 → JSON/Markdown ZIP生成 → ダウンロードURL返却
2. POST `/api/account/delete` — 順序実行：
   - Supabase 関連データに `deleted_at = now()` で論理削除
   - Stripe アクティブサブスクリプションを即時キャンセル
   - Clerk アカウント削除
3. 部分失敗時のロールバック戦略実装（リトライキュー or 監視ログ）
4. Supabase Edge Function で7日経過の論理削除レコードを物理削除（Cron スケジュール）
5. 削除確認ダイアログの文言は言語設計準拠（「この操作は元に戻せません」）
6. RLSポリシー：自分のデータのみエクスポート/削除可能

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] POST `/api/account/export` が診断・チャット履歴・アクション記録をZIP生成
- [ ] JSON / Markdown 両形式での出力
- [ ] POST `/api/account/delete` が論理削除 + Stripe解約 + Clerk削除を順序実行
- [ ] 7日後物理削除バッチが動作（Vercel Cron / Supabase Edge Function）
- [ ] 削除確認ダイアログの文言が言語設計準拠
- [ ] Gate 1（ヒラメ）レビュー完了
- [ ] Gate 2（えんまさ）削除確認文言レビュー完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
