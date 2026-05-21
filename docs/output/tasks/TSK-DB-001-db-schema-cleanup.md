---
doc_id: task.db.db-schema-cleanup
title: TSK-DB-001 DB構造整理 — profiles / chat_sessions / user_personality_weights スキーマ最終化
doc_type: task
status: review
author: ヒラメ
created_at: 2026-05-07
github_issue: "#27"
branch: feature/27-db-schema-cleanup
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#41-42
related_impl_plan: docs/output/roadmap/impl-plan-near-soft-feedback-loop.md
---

# TSK-DB-001：DB構造整理 — profiles / chat_sessions / user_personality_weights スキーマ最終化

> **ステータス**: 🟡 実装中  
> **担当**: ヒラメ（バックエンド / Layer 3）  
> **Issue**: [#27](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/27)  
> **ブランチ**: `feature/27-db-schema-cleanup`

---

## 概要

NEARフェーズ実装計画に従い、`profiles`・`chat_sessions`・`user_personality_weights` の3テーブルのスキーマを最終化する。MVPとNEARフェーズで使うすべてのカラムをDay 1から定義し、RLS・制約・インデックスを確定させる。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.1（F1）/ §4.2（F2） |
| 実装計画 | [impl-plan-near-soft-feedback-loop.md](../roadmap/impl-plan-near-soft-feedback-loop.md) | Step 1〜3 |
| ハーネス | [AGENTS.md](../../../AGENTS.md) | §7 Layer 1（migrations保護） |

---

## 作成・変更ファイル一覧

```
supabase/migrations/
  ├── 20260503000001_base_schema.sql          # profiles + chat_sessions
  └── 20260503000002_personality_weights.sql  # user_personality_weights

lib/
  ├── types/database.ts                       # pnpm db:types で再生成
  └── weights/
      ├── types.ts                            # WeightRecord / ResonanceScore 型
      ├── ewma.ts                             # EWMAアルゴリズム Pure function
      └── prompt-inject.ts                    # システムプロンプト文字列生成
```

> ⚠️ **Layer 1保護**: `supabase db push` はhookでブロックされる。  
> マイグレーションはSupabase Dashboard の SQL Editor から手動適用すること（AGENTS.md §7）。

---

## 実装ステップ

1. `supabase/migrations/20260503000001_base_schema.sql` の最終確認・調整
   - `profiles` テーブル（clerk_user_id UNIQUE、birth_date カラム）
   - `chat_sessions` テーブル（resonanceカラム群・feedback_score）
   - 各テーブルの RLS ポリシー（`auth.jwt() ->> 'sub'` で本人確認）
2. `supabase/migrations/20260503000002_personality_weights.sql` の最終確認
   - `user_personality_weights`（EWMA制約: SUM=1.0±0.01、各weight 0.15〜0.55）
3. Supabase Dashboard SQL Editor で手動適用
4. `pnpm db:types` で `lib/types/database.ts` を再生成
5. `lib/weights/` 配下の型定義・ロジック実装（impl-plan Step 2〜4 に詳細）
6. `app/api/chat/feedback/route.ts` の実装（impl-plan Step 5 に詳細）

---

## 完了定義

- [ ] 3テーブルのマイグレーションSQL確定・Supabase Dashboardで適用済み
- [ ] RLSポリシー（IDOR防御）：`user_id = auth.jwt() ->> 'sub'` が全テーブルに存在
- [ ] `pnpm db:types` で型生成成功（`lib/types/database.ts` 更新）
- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] Gate 1（ヒラメ署名）完了：IDOR / JWT / 型安全 / N+1 / エラー境界を確認

---

## 未解決事項

| # | 事項 | 内容 | 確認先 |
|---|------|------|--------|
| 1 | `utils/supabase/server.ts` | SSR用Supabaseクライアントが未存在。別PRで対応するか本PRに含めるか | ヒラメ判断 |
| 2 | `pnpm db:types` 接続設定 | `SUPABASE_ACCESS_TOKEN` が `~/.zshrc` に設定済みか | `.env.example` |
| 3 | `pg_cron` 利用可否 | Supabase無料枠でpg_cronが使えるか | Supabase Dashboard Extensions |

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ（AI） | 初版作成。実装計画から内容を集約 |
| 2026-05-17 | ヒラメ（AI） | F2バックエンド実装完了。lib/diagnostics/（星座・動物・六星占術）、lib/data/（animal-characters / destiny-number-database）、supabase/migrations/20260517000001_diagnoses.sql、app/api/diagnosis/auto-calc・route.ts を作成。Vitestユニットテスト74件全通過。認証は後日対応のため匿名MVPパターンで実装。PRレビュー待ち。 |
