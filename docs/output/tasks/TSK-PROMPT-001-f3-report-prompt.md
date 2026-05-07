---
doc_id: task.f3.report-prompt
title: TSK-PROMPT-001 F3 統合レポートプロンプト
doc_type: task
status: planned
author: えんまさ
created_at: 2026-05-07
github_issue: "#36"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#43-統合レポートf3-v2の核心
related_impl_plan: ""
---

# TSK-PROMPT-001：F3 統合レポートプロンプト

> **ステータス**: planned
> **担当**: えんまさ
> **Issue**: [#36](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/36)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F3統合レポートの中核となるAIプロンプト設計。4体系（MBTI・星座・動物60アニマル・六星占術）を統合し、UXシーケンス「共感→安心→分析→行動」の順序を保持したリッチレポートコンテンツを生成する。F3.2「安心」フェーズのサブテキスト（承認・脱判定化・招待の3要素・100字以内）も本タスクで設計する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.3 |
| 設計中枢 | [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md) | Why → How → So What・5問試験紙 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体 |
| Constitution | [lib/constitution/banned-words.ts](../../../lib/constitution/banned-words.ts) | 禁止語の正 |
| Constitution | [lib/constitution/ux-sequence.ts](../../../lib/constitution/ux-sequence.ts) | UXシーケンスの正 |

---

## 作成・変更ファイル一覧

```
lib/prompts/report/
  ├── system-prompt.ts                # 4体系統合システムプロンプト
  ├── reassurance-subtext.ts          # F3.2 サブテキスト生成プロンプト
  ├── regenerate-prompt.ts            # 再生成プロンプト（差分強調）
  ├── few-shot-examples.ts            # Few-Shot 事例（共感→安心→分析→行動）
  └── __tests__/
      ├── banned-words.test.ts        # 禁止語ユニットテスト
      ├── ux-sequence.test.ts         # UXシーケンス順序テスト
      └── reassurance-subtext.test.ts # 100字以内・3要素検証

docs/output/prompts/F3/
  ├── samples-before.md               # AI応答サンプル（before）3件
  └── samples-after.md                # AI応答サンプル（after）3件
```

---

## 実装ステップ

1. システムプロンプト（`system-prompt.ts`）を4体系統合・共感→安心→分析→行動の順序で設計
2. F3.2 サブテキストプロンプト（`reassurance-subtext.ts`）を承認・脱判定化・招待の3要素・100字以内で設計
3. 再生成プロンプト（`regenerate-prompt.ts`）を前回との差分強調・「30日後の自分」視点で設計
4. Few-Shot事例（`few-shot-examples.ts`）を3〜5件用意（多様な4体系組合せ）
5. ユニットテスト追加：
   - 禁止語チェック（占い・鑑定・運勢・当たる・霊感・霊視を含まない）
   - UXシーケンス順序チェック（共感→安心→分析→行動）
   - F3.2 サブテキスト100字以内・3要素含有
6. AI応答サンプル3件を生成して `docs/output/prompts/F3/samples-{before,after}.md` に保存
7. 設計中枢5問のリトマス試験紙を通過確認（Q1〜Q3 Must / Q4〜Q5 Should）

---

## 完了定義

- [ ] `lib/prompts/report/` 配下にプロンプトファイル配置
- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] 禁止語ユニットテスト通過（`expect(prompt).not.toContain("占い")` 等）
- [ ] UXシーケンス順序テスト通過
- [ ] F3.2 サブテキストが100字以内・承認/脱判定化/招待の3要素を含む（テスト化）
- [ ] AI応答サンプル3件をPRに添付（before/after）
- [ ] 設計中枢5問のMust（Q1〜Q3）すべて◯
- [ ] Gate 2（えんまさ）承認完了

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
