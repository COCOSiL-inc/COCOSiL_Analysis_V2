---
doc_id: task.f4.chat-ui
title: TSK-UI-004 F4 チャットUIコンポーネント
doc_type: task
status: planned
author: まあみ
created_at: 2026-05-07
github_issue: "#37"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#44-共感aiチャットf4-mvpの心臓部
related_impl_plan: ""
---

# TSK-UI-004：F4 チャットUIコンポーネント

> **ステータス**: planned
> **担当**: まあみ
> **Issue**: [#37](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/37)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

性格分析データに基づく「根拠のある共感」を提供する5フェーズ設計AIチャットのフロントエンドUI。UXシーケンス「共感→分析→行動」をチャット内で体現する。Vercel AI SDK の `useChat` を用いたストリーミングUI、フェーズインジケーター、腑落ちマーカー、Phase 5「記録する」ボタンを実装する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.4 / §6.3 |
| 関連API | [TSK-API-003](TSK-API-003-f4-chat-api.md) | サーバー実装 |
| 関連プロンプト | [TSK-PROMPT-002](TSK-PROMPT-002-f4-chat-prompt.md) | 5フェーズプロンプト |

---

## 作成・変更ファイル一覧

```
app/(auth)/chat/
  ├── page.tsx                        # チャット画面ルート
  └── [sessionId]/page.tsx            # セッション再開ルート

components/chat/
  ├── ChatThread.tsx                  # useChat ストリーミング表示
  ├── PhaseIndicator.tsx              # 5フェーズ進行表示
  ├── MessageBubble.tsx               # メッセージ表示（AI/user）
  ├── KnowMarkerInChat.tsx            # Phase 4 腑落ちマーカー
  ├── ActionRecordButton.tsx          # Phase 5「記録する」→ F5 API
  ├── PaywallModal.tsx                # 月5回上限到達モーダル
  └── ErrorRetry.tsx                  # OpenAIエラー時のリトライUI

lib/chat/
  └── phase-types.ts                  # ChatPhase 型（共有）
```

---

## 実装ステップ

1. `useChat`（Vercel AI SDK）でストリーミング応答を表示する基本UI
2. サーバーレスポンスから受け取る `phase` をフェーズインジケーターに反映
3. メッセージバブル（AI/user）スタイル — Tailwind + shadcn/ui
4. Phase 4 で腑落ちマーカーをメッセージ末尾に表示・タップ記録
5. Phase 5 で「記録する」ボタンを表示 → F5 アクション記録APIに POST
6. OpenAIエラー時に言語設計準拠の文言＋リトライ導線
7. チャット中断（タブ切替）→ 30分以内なら同セッションを再開（`[sessionId]` ルート）
8. 月5回上限到達時に `PaywallModal` を表示（有料プラン誘導文言）
9. 禁止語監査

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] Vercel AI SDK `useChat` でストリーミング応答が表示される
- [ ] サーバーから返却された `phase` をUIで反映
- [ ] Phase 4（洞察）で腑落ちマーカーがチャット内に表示・タップ記録可能
- [ ] Phase 5（行動提案）の提案をワンタップで F5 アクション記録APIに POST
- [ ] OpenAIエラー時に言語設計準拠の文言を表示・リトライ導線
- [ ] チャット中断後30分以内なら同セッションを再開
- [ ] 無料プラン月5回上限到達時に有料プラン誘導モーダル
- [ ] 禁止語チェック通過
- [ ] Gate 2（えんまさ）動作確認完了（プレビューURL + フェーズ別文言diff）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
