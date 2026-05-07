---
doc_id: task.f5.action-ui
title: TSK-UI-005 F5 アクション記録UI
doc_type: task
status: planned
author: まあみ
created_at: 2026-05-07
github_issue: "#40"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#45-アクション記録f5
related_impl_plan: ""
---

# TSK-UI-005：F5 アクション記録UI

> **ステータス**: planned
> **担当**: まあみ
> **Issue**: [#40](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/40)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

共感AIチャットの行動提案フェーズから生まれた行動を「できたこと」形式で記録するフロントエンドUI。UXシーケンス「行動」フェーズの実装。プレッシャーゼロ原則に従い、達成率/残件数/進捗バーを表示せず、「また来たね」のトーンで継続を歓迎する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.5 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体 |
| 関連API | [TSK-API-004](TSK-API-004-f5-action-api.md) | サーバー実装 |

---

## 作成・変更ファイル一覧

```
app/(auth)/actions/
  ├── page.tsx                     # タイムライン一覧
  └── retrospective/page.tsx       # F5.3 振り返り画面

components/actions/
  ├── ActionTimeline.tsx           # 日付グルーピングタイムライン
  ├── ActionCard.tsx               # 各アクションカード
  ├── DoneButton.tsx               # 「できた！」ワンタップ完了
  ├── ManualAddForm.tsx            # 手動追加フォーム
  ├── EmptyState.tsx               # 0件時の誘導（否定形なし）
  └── RetrospectiveView.tsx        # F5.3 振り返り表示
```

---

## 実装ステップ

1. タイムライン一覧（`ActionTimeline.tsx`）を日付降順で表示
2. 各アクションカード（`ActionCard.tsx`）に「できた！」ボタン配置（タップで PATCH API → アーカイブ移行）
3. 手動追加フォーム（`ManualAddForm.tsx`）で自由入力対応
4. 0件時の誘導文（`EmptyState.tsx`）— 「まだ記録がありません。チャットで話してみることから始めましょう」（否定形を使わない）
5. F5.3 振り返り画面（`RetrospectiveView.tsx`）— 「〇〇日前はこんなことを試みていましたね」のトーン
6. 達成率/残件数/進捗バーが含まれていないかセルフレビュー
7. 「未達成」「できていない」等の否定形チェック
8. 禁止語監査

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] タイムライン形式の記録一覧表示（日付で整理）
- [ ] 手動アクション追加フォーム（自由入力）
- [ ] 「できた！」ワンタップ完了マーク（完了後はアーカイブへ）
- [ ] F5.3 振り返り表示
- [ ] 0件時の誘導文（否定形を使わない）
- [ ] 達成率・残件数・進捗バーが表示されない
- [ ] 否定形（「未達成」「できていない」）が含まれない
- [ ] 禁止語チェック通過
- [ ] Gate 2（えんまさ）動作確認完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
