---
doc_id: task.f3.report-records-api
title: TSK-API-008 F3 レポート付随API（しっくりきたマーカー・満足度アンケート）
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-21
github_issue: "#56"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#43-統合レポートf3-v2の核心
related_impl_plan: ""
---

# TSK-API-008：F3 レポート付随API（しっくりきたマーカー・満足度アンケート）

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#56](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/56)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F3統合レポート画面からの2つの記録API。(1) しっくりきたマーカー（F3.3）の記録/解除、(2) 満足度アンケート（F3.4）回答の記録。いずれも超低摩擦・プレッシャーゼロ設計を満たす軽量な記録エンドポイント。TSK-UI-003 の `KnowMarker.tsx` / `SatisfactionSurvey.tsx` が呼び出す先のAPIを実装する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| F3フィーチャー要件 | [F3_integrated-report_features.md](../F3/F3_integrated-report_features.md) | §3（F3.3）/ §4（F3.4） |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.3 |
| 関連UI | [TSK-UI-003](TSK-UI-003-f3-report-ui.md) | `KnowMarker.tsx` / `SatisfactionSurvey.tsx` |

**受け入れ基準（F3フィーチャー要件より引用）**

- F3.3 AC-3: 「マークした項目がDB記録されF4.3/F5.3から参照可能であること。かつ、未マークを責める表示（残件数・「0件です」等の否定形）を一切出さないこと」
- F3.3 AC-2: 「マーク／マーク解除がそれぞれ1タップで完了し…」（API側は記録/解除を冪等に処理）
- F3.4 AC-3: 「回答がDB記録され、F9.3 KPIダッシュボードの満足度指標（4.0/5.0目標）に集計可能であること」

---

## 作成・変更ファイル一覧

```
app/api/reports/
  ├── markers/route.ts                 # POST/DELETE しっくりきたマーカー記録・解除
  └── survey/route.ts                  # POST 満足度アンケート回答記録

lib/reports/
  ├── markers.ts                       # know_markers CRUD ロジック
  ├── survey.ts                        # 満足度アンケート記録ロジック
  └── schemas.ts                       # Zod 入力検証（zod/v4）

supabase/migrations/
  └── YYYYMMDDNNNNNN_f3_report_records.sql
      # know_markers テーブル（user_id / report_id / section_id / marked_text / created_at）
      # report_satisfaction テーブル または満足度カラム（score 1-5 / free_text / created_at）
      # 両テーブルに RLS: user_id = auth.uid()
```

> ⚠️ migration ファイルの作成は可。**適用（`supabase db push`）はLayer 1のため人間が手動実行**（AGENTS.md §7）。

---

## 実装ステップ

1. migration を作成：`know_markers` テーブル（`user_id` / `report_id` / `section_id` / `marked_text` / `created_at`）、満足度アンケート保存先（`report_satisfaction` テーブル：`score` 1-5 / `free_text` nullable / `created_at`）。両テーブルに RLS `user_id = auth.uid()` を全CRUDに付与
2. Zod スキーマ（`schemas.ts`）でマーカー記録・解除・アンケート回答の入力を検証
3. `POST /api/reports/markers`：Clerk JWT → `supabase.auth.getUser()` でユーザー特定 → `know_markers` に upsert（同一 section の重複記録を冪等処理）
4. `DELETE /api/reports/markers`：該当マーカーを削除（マーク解除）
5. `POST /api/reports/survey`：5段階スコア＋自由記述を `report_satisfaction` に記録。回答は任意（未送信を許容）
6. 満足度回答を F9.3 KPI 集計が参照できる形（`analytics_events` 連携 or 集計クエリ）で保存
7. エラー境界：Supabase エラーオブジェクトをそのままクライアントに返さない
8. しっくりきたマーカーが F4.3（過去参照）/ F5.3（振り返り）から SELECT 可能であることを確認

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] しっくりきたマーカーの記録（POST）/ 解除（DELETE）が各1リクエストで完結
- [ ] `know_markers` が F4.3 / F5.3 から参照可能
- [ ] 満足度アンケート（5段階＋自由記述）が記録され F9.3 集計対象になる
- [ ] 全CRUD操作の RLS に `user_id = auth.uid()` が存在
- [ ] APIルート入力値が Zod スキーマで検証されている
- [ ] Gate 1（ヒラメ）確認完了：IDOR・JWT・型安全・N+1・エラー境界
- [ ] Gate 2（えんまさ）確認完了（空状態・誘導文言が言語設計準拠を要する場合）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-21 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成。F3要件精緻化で判明した F3.3/F3.4 API欠落を補完） |
