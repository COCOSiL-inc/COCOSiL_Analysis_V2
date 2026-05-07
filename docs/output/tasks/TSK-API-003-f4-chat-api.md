---
doc_id: task.f4.chat-api
title: TSK-API-003 F4 チャットAPIルート
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-07
github_issue: "#38"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#44-共感aiチャットf4-mvpの心臓部
related_impl_plan: ""
---

# TSK-API-003：F4 チャットAPIルート

> **ステータス**: planned
> **担当**: ヒラメ
> **Issue**: [#38](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/38)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F4共感AIチャットのバックエンドAPI。Vercel AI SDK `streamText()` + Edge Runtime でストリーミング応答を実装。5フェーズ状態は `chat_sessions.phase` に永続化（クライアント側に持たせない）。4体系診断データ + 過去会話要約をシステムプロンプトに常時注入し、再訪時は履歴・アクション記録・腑落ちマーカーをコンテキスト取り込みする。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.4 / §6.3 |
| 関連UI | [TSK-UI-004](TSK-UI-004-f4-chat-ui.md) | クライアント実装 |
| 関連プロンプト | [TSK-PROMPT-002](TSK-PROMPT-002-f4-chat-prompt.md) | 5フェーズプロンプト |

---

## 作成・変更ファイル一覧

```
app/api/chat/
  └── route.ts                        # POST /api/chat（Edge Runtime + streamText）

lib/chat/
  ├── phase-controller.ts             # ChatPhase 遷移管理
  ├── context-builder.ts              # 4体系 + 過去会話要約のコンテキスト構築
  ├── rate-limit.ts                   # 月5回上限チェック
  ├── schemas.ts                      # Zod 入出力検証
  └── session.ts                      # chat_sessions / chat_messages CRUD

lib/supabase/
  └── (RLS policy: chat_sessions / chat_messages)
```

---

## 実装ステップ

1. POST `/api/chat` を Edge Runtime（`export const runtime = 'edge'`）で実装
2. Clerk JWT 検証 → `supabase.auth.getUser()`
3. `chat_sessions` を取得（既存セッション or 新規作成）→ `phase` 読み出し
4. 4体系診断データ + 過去会話要約 + 腑落ちマーカー + アクション記録をシステムプロンプトに注入
5. 無料プラン月5回上限の判定（`profiles.plan` + 当月メッセージ数）
6. Vercel AI SDK `streamText()` でOpenAIにストリーミング要求
7. レスポンス完了後、メッセージを `chat_messages` に保存し `chat_sessions.phase` を更新
8. 30分セッションタイムアウト判定（Last-Active から30分超過なら新規セッション）
9. RLS policy 整備：`user_id = auth.uid()` を chat_sessions / chat_messages に適用
10. エラー境界：OpenAIエラーをフレンドリーエラーへ正規化

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] POST `/api/chat` が Vercel AI SDK `streamText()` でストリーミング応答
- [ ] Edge Runtime で動作
- [ ] `chat_sessions.phase` がサーバー側で更新・永続化される
- [ ] 4体系診断データ + 過去会話要約をシステムプロンプトに注入
- [ ] 再訪時は履歴・アクション記録・腑落ちマーカーをコンテキスト取り込み
- [ ] 無料プラン月5回上限のサーバー側レート制限
- [ ] OpenAI障害時のフレンドリーエラー返却
- [ ] 30分以内のセッション再開対応
- [ ] Gate 1（ヒラメ）レビュー完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
