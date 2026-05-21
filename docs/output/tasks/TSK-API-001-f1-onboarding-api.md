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

F1オンボーディングのバックエンドAPI。Clerk認証完了後の生年月日の必須取得・永続化（スキップ不可・D4）、プロファイル初期化、F2自動算出（星座・動物・六星）のトリガー、F1.3「ようこそ」共感対話セッション初期化を担当する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| F1要件書 | [F1_onboarding_features.md](../F1/F1_onboarding_features.md) | Capability / Feature / EARS 全体（grill成果物） |
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

1. Zod スキーマで `birth_date: YYYY-MM-DD` を定義し、**3条件**を ValidationError として返す：未来日付（EARS-I1）／1900年1月1日より前（EARS-I2・D5）／暦上存在しない無効日付（2/29等・EARS-I3）
2. `POST /api/onboarding/profile` を実装：Clerk JWT 検証 → `supabase.auth.getUser()` でユーザー特定 → `profiles` へ INSERT/UPDATE。生年月日は必須（スキップ不可・D4。受領しない限り後続を実行しない）
3. 永続化成功時に F2.1 a/b/c（星座・動物・六星）のバックグラウンド算出をトリガーし `diagnoses` テーブルへ保存。算出失敗時は該当カラムを `null` 保存
4. 永続化成功をもって F1.3 用 `chat_sessions` を `phase=1`（傾聴）で初期化（EARS-N1：生年月日永続化完了 → F1.3 起動）
5. 認証失敗時の挙動（EARS-I4）：Clerk認証エラー時は後続処理を実行せず、言語設計準拠トーンのエラーを返す
6. `birth_date_submitted` 計測イベントを永続化成功時に発火（30秒計測の終点・C1）
7. RLS ポリシー（`user_id = auth.uid()`）を全 CRUD 操作で確認・追加
8. エラー境界処理：Supabase エラーをラップし、`ValidationError` / `InternalError` の2種に正規化してクライアントへ返却

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] POST `/api/onboarding/profile` が生年月日を永続化し F2 バックグラウンド算出をトリガー
- [ ] 生年月日異常値（未来日付・1900年1月1日より前・無効日付2/29等）を ValidationError で弾く（EARS-I1〜I3）
- [ ] 生年月日は必須・スキップ不可。永続化成功までF1.3を起動しない（D4 / EARS-N1）
- [ ] 認証失敗時は後続処理を実行せず言語設計準拠トーンのエラーを返す（EARS-I4）
- [ ] F2.1 算出失敗時は該当カラムを `null` 保存（手動補正導線対応）
- [ ] RLSポリシーで自分のデータのみアクセス可能を確認
- [ ] Gate 1（ヒラメ）レビュー完了：IDOR防御・JWT連携・型安全・N+1・エラー境界の5点

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
| 2026-05-21 | えんまさ | F1要件グリル反映：D4（生年月日必須・スキップ不可）/ EARS-I1〜I4・N1 / D5（下限を1900-01-01に厳密化）/ C1（birth_date_submitted計測イベント）/ F1要件書を参照に追加 |
