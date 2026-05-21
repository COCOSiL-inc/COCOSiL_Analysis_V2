---
doc_id: task.f3.report-regenerate-api
title: TSK-API-009 F3.5 レポート再生成API（蓄積データ反映・課金ゲート）
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-21
github_issue: "#57"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#43-統合レポートf3-v2の核心
related_impl_plan: ""
---

# TSK-API-009：F3.5 レポート再生成API（蓄積データ反映・課金ゲート）

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#57](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/57)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

課金プラン限定のレポート再生成API（F3.5）。前回生成から30日経過判定・課金状態検証を経て、前回以降のF4チャット・F3.3しっくりきたマーカー・F5アクション記録をコンテキスト注入し、「今の自分」を織り込んだ更新版レポートを生成する（**蓄積データ反映型** — 設計判断D3）。生年月日ベースの3体系は不変のため、再生成の価値は蓄積データの反映で生まれる。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| F3フィーチャー要件 | [F3_integrated-report_features.md](../F3/F3_integrated-report_features.md) | §5（F3.5）/ §6（D3・D4・C1） |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.3 |
| 関連API | [TSK-API-002](TSK-API-002-f3-report-api.md) | 初回生成パイプラインを再利用 |
| 関連プロンプト | [TSK-PROMPT-001](TSK-PROMPT-001-f3-report-prompt.md) | `regenerate-prompt.ts` |

**受け入れ基準（F3フィーチャー要件より引用）**

- F3.5 AC-1: 「再生成ボタンは前回生成から30日経過後にのみ有効化され、月1回上限を超えて生成できないこと」
- F3.5 AC-2: 「無料プランからの再生成試行時は生成せず「有料プランで月1回再生成できます」の誘導を表示すること（言語設計準拠・禁止語0%）」
- F3.5 AC-3: 「再生成レポートは前回生成以降のF4チャット・F3.3マーカー・F5記録を入力に含み、初回と差分のある内容になること。蓄積データが乏しい場合も生成は破綻せず成立すること」

---

## 依存タスク

| 依存先 | 理由 |
|--------|------|
| [TSK-API-002](TSK-API-002-f3-report-api.md) | 初回生成パイプライン（OG描画・Storage保存）を再利用 |
| [TSK-API-005](TSK-API-005-f7-stripe-api.md) | 課金状態の検証（Stripe ⟺ Supabase profiles） |
| [TSK-API-008](TSK-API-008-f3-report-records-api.md) | F3.3マーカーが蓄積データ源 |
| [TSK-PROMPT-001](TSK-PROMPT-001-f3-report-prompt.md) | `regenerate-prompt.ts`（蓄積データ反映プロンプト） |

---

## 作成・変更ファイル一覧

```
app/api/reports/
  └── regenerate/route.ts              # POST /api/reports/regenerate

lib/reports/
  ├── regenerate.ts                    # 蓄積データ収集（F4/F3.3/F5）→ コンテキスト注入 → 生成
  ├── regenerate-gate.ts               # 30日経過判定・月次枠・課金状態検証
  └── schemas.ts                       # Zod 入力検証（zod/v4）— TSK-API-008 と共用

supabase/migrations/
  └── YYYYMMDDNNNNNN_f3_report_regenerate.sql
      # reports テーブルに last_generated_at / regenerate_count 等の月次管理カラム
      # （既存 reports スキーマに応じて調整）
```

> ⚠️ migration の適用はLayer 1のため人間が手動実行（AGENTS.md §7）。

---

## 実装ステップ

1. `regenerate-gate.ts`：前回生成（`last_generated_at`）から30日経過しているか判定。未経過なら次回可能日を返して終了
2. 課金状態を検証（TSK-API-005 の Supabase `profiles` 課金カラム参照）。無料プランなら生成せず「有料プランで月1回再生成できます」の誘導レスポンス（402相当 or 専用エラーコード・言語設計準拠）
3. `regenerate.ts`：前回生成以降の蓄積データを収集
   - F4チャット履歴の要約
   - F3.3 しっくりきたマーカー（`know_markers`）
   - F5 アクション記録
4. 収集した蓄積データを `regenerate-prompt.ts`（TSK-PROMPT-001）のコンテキストに注入
5. TSK-API-002 の生成パイプライン（OG描画・Markdownフォールバック・Storage保存）を再利用して更新版レポートを生成
6. 蓄積データが乏しい場合（チャット未利用等）も生成が破綻しないフォールバックを実装
7. 生成成功時に月次再生成枠を消費（`last_generated_at` 更新）。旧レポートはDB保持（履歴比較UIは作らない）
8. RLS・JWT・型安全・エラー境界の確認

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] 前回生成から30日未経過時は再生成不可（月1回上限・次回可能日を返却）
- [ ] 無料プランの再生成試行を「有料プランで月1回再生成」へ誘導（生成しない・禁止語0%）
- [ ] 蓄積データ（F4チャット・F3.3マーカー・F5記録）を注入し初回と差分のあるレポートを生成
- [ ] 蓄積データが乏しい場合も生成が破綻しない
- [ ] 全CRUD操作の RLS に `user_id = auth.uid()` が存在
- [ ] APIルート入力値が Zod スキーマで検証されている
- [ ] Gate 1（ヒラメ）確認完了：IDOR・JWT・型安全・N+1・エラー境界・課金ゲート分岐
- [ ] Gate 2（えんまさ）確認完了：有料誘導文言・蓄積データの注入方針

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-21 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成。F3要件精緻化 D3/D4 で確定した蓄積データ反映型・課金限定の再生成APIを新設） |
