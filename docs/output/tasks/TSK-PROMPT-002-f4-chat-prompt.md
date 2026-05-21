---
doc_id: task.f4.chat-prompt
title: TSK-PROMPT-002 F4 5フェーズ共感プロンプト
doc_type: task
status: planned
author: えんまさ
created_at: 2026-05-07
github_issue: "#39"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#44-共感aiチャットf4-mvpの心臓部
related_impl_plan: ""
---

# TSK-PROMPT-002：F4 5フェーズ共感プロンプト

> **ステータス**: planned
> **担当**: えんまさ
> **Issue**: [#39](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/39)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F4共感AIチャットの中核となる5フェーズプロンプト設計。傾聴→共感→深掘り→洞察→行動提案の遷移ロジックをプロンプト内のシステム指示で制御する。4体系診断データ・過去会話要約・しっくりきたマーカー・アクション記録のコンテキスト注入テンプレートも本タスクで設計する。MVPの心臓部であり、PMF成功基準（7日以内再訪率30%以上）を支える最重要レイヤー。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.4 |
| 設計中枢 | [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md) | Why → How → So What |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体 |
| Constitution | [lib/constitution/banned-words.ts](../../../lib/constitution/banned-words.ts) | 禁止語の正 |
| Constitution | [lib/constitution/ux-sequence.ts](../../../lib/constitution/ux-sequence.ts) | UXシーケンスの正 |

---

## 作成・変更ファイル一覧

```
lib/prompts/chat/
  ├── system-base.ts                  # 全フェーズ共通システム指示
  ├── phase-1-listening.ts            # Phase 1 傾聴
  ├── phase-2-empathy.ts              # Phase 2 共感
  ├── phase-3-depth.ts                # Phase 3 深掘り
  ├── phase-4-insight.ts              # Phase 4 洞察（4体系結びつけ）
  ├── phase-5-action.ts               # Phase 5 行動提案
  ├── phase-transition.ts             # フェーズ遷移判定指示
  ├── context-injection.ts            # 4体系 + 過去会話要約のテンプレート
  ├── revisit-opening.ts              # 再訪時オープニング
  └── __tests__/
      ├── banned-words.test.ts
      ├── ux-sequence.test.ts
      ├── three-poisons.test.ts       # 三毒増幅チェック
      └── phase-coverage.test.ts      # 5フェーズ全網羅

docs/output/prompts/F4/
  ├── samples-phase-1.md              # 各フェーズ3件サンプル
  ├── samples-phase-2.md
  ├── samples-phase-3.md
  ├── samples-phase-4.md
  └── samples-phase-5.md
```

---

## 実装ステップ

1. 全フェーズ共通システム指示（`system-base.ts`）— トーン・禁止行動・COCOSiL哲学
2. Phase 1〜5 各フェーズのシステムプロンプト（AIの役割・トーン・遷移条件）
3. フェーズ遷移ロジック（`phase-transition.ts`）— 「次フェーズへの移行条件」をプロンプト内で記述
4. 4体系コンテキスト注入テンプレート（MBTI・星座・動物・六星）
5. 過去会話要約注入テンプレート（再訪時の前回内容反映）
6. 再訪時オープニング（「また来てくれましたね…」）
7. ユニットテスト追加：
   - 禁止語チェック
   - UXシーケンス順序チェック
   - 三毒増幅チェック（Phase 3「深掘り」が瞋・貪を煽らないか）
   - 5フェーズ全網羅
8. AI応答サンプル各フェーズ3件を生成して `docs/output/prompts/F4/` に保存
9. 設計中枢5問のリトマス試験紙通過確認

---

## 完了定義

- [ ] `lib/prompts/chat/` 配下にプロンプトファイル配置
- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] 禁止語ユニットテスト通過
- [ ] UXシーケンス順序テスト通過
- [ ] 三毒増幅チェックテスト通過
- [ ] 5フェーズ全網羅テスト通過
- [ ] 4体系コンテキスト注入テンプレートが正しく差し込まれる
- [ ] 再訪時オープニングのトーン確認
- [ ] AI応答サンプル各フェーズ3件をPRに添付（合計15件）
- [ ] 設計中枢5問のMust（Q1〜Q3）すべて◯
- [ ] Gate 2（えんまさ）承認完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
