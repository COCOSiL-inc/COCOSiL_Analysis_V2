---
doc_id: task.f5.action-api
title: TSK-API-004 F5 アクション記録API
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-07
github_issue: "#41"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#45-アクション記録f5
related_impl_plan: ""
---

# TSK-API-004：F5 アクション記録API

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#41](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/41)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F5アクション記録のバックエンドAPI。アクション追加（Phase 5チャットからのワンタップ追加・手動追加の両方）、一覧取得、完了マーク、振り返り取得を提供する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.5 |
| 関連UI | [TSK-UI-005](TSK-UI-005-f5-action-ui.md) | クライアント実装 |

---

## 作成・変更ファイル一覧

```
app/api/actions/
  ├── route.ts                          # POST / GET
  ├── [id]/complete/route.ts            # PATCH 完了マーク
  └── retrospective/route.ts            # GET 振り返り

lib/actions/
  ├── service.ts                        # ビジネスロジック
  ├── schemas.ts                        # Zod 入出力検証
  └── retrospective.ts                  # 振り返り集計

supabase/migrations/
  └── (RLS policy: actions テーブル)
```

---

## 実装ステップ

1. Zod スキーマで入出力検証（追加 / 完了 / 振り返り）
2. `POST /api/actions` — チャット由来 / 手動の両方に対応（`source: "chat" | "manual"`）
3. `GET /api/actions` — タイムライン形式（日付降順）でレスポンス
4. `PATCH /api/actions/:id/complete` — 完了マーク・アーカイブ移行
5. `GET /api/actions/retrospective` — 振り返り用データ（過去N日のアクション + chat_messages 抜粋 + know_markers）をJOINで取得（N+1防止）
6. RLSポリシー：`user_id = auth.uid()` を全 CRUD 操作に適用
7. エラー境界処理

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] POST `/api/actions` がチャット由来 / 手動の両方に対応
- [ ] GET `/api/actions` がタイムライン形式（日付降順）でレスポンス
- [ ] PATCH `/api/actions/:id/complete` で完了マーク・アーカイブ移行
- [ ] GET `/api/actions/retrospective` で振り返り用データ返却（N+1なし）
- [ ] RLSポリシーで自分のデータのみアクセス可能
- [ ] Gate 1（ヒラメ）レビュー完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
