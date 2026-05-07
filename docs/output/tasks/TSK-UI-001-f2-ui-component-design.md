---
doc_id: task.ui.f2-ui-component-design
title: TSK-UI-001 F2 性格分析・自動診断 フロントUI改良＆UIコンポーネント定義
doc_type: task
status: in-progress
author: まあみ
created_at: 2026-05-07
github_issue: "#28"
branch: feature/28-f2-ui-component-design
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#42
related_impl_plan: ""
---

# TSK-UI-001：F2 性格分析・自動診断 フロントUI改良＆UIコンポーネント定義

> **ステータス**: 🟡 実装中  
> **担当**: まあみ（フロントエンド / Layer 3）  
> **Issue**: [#28](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/28)  
> **ブランチ**: `feature/28-f2-ui-component-design`

---

## 概要

F2（性格分析・自動診断）のフロントエンドUIを改良し、再利用可能なUIコンポーネントとして定義する。MBTI簡易診断フロー・3体系自動計算結果表示・診断完了→統合レポート遷移を対象とする。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.2（F2）— 業務フロー・例外系・F2.1a/b/c |
| F1詳細要件 | [f1_detailed_requirements.md](../F1/f1_detailed_requirements.md) | UIコンポーネント規約参考 |
| デザインフロー | [DESIGN_FLOW.md](../../harness/DESIGN_FLOW.md) | まあみの役割・UXシーケンス確認 |
| 言語設計 | `/language-design` スキル | UIコピー作成前に必ず確認 |

---

## 作成・変更ファイル一覧

```
app/
  ├── (auth)/diagnosis/
  │   ├── page.tsx              # MBTI診断ページ（Server Component）
  │   └── loading.tsx           # ローディング表示
  └── (auth)/diagnosis/result/
      └── page.tsx              # 4体系診断結果ページ

components/
  ├── diagnosis/
  │   ├── MbtiQuizForm.tsx      # MBTI選択式質問フォーム（8〜12問）
  │   ├── DiagnosisResultCard.tsx # 各体系の診断結果カード
  │   ├── AutoCalcResultBadge.tsx # 3体系自動計算バッジ（星座/動物/六星）
  │   └── DiagnosisProgress.tsx  # 診断進行状況プログレスバー
  └── ui/
      └── （既存コンポーネントの再利用・拡張）
```

---

## 実装ステップ

1. 要件定義書 §4.2 の業務フロー（正常系・例外系）を精読し、コンポーネント設計確認
2. `MbtiQuizForm.tsx` の実装
   - 8〜12問の選択式質問（4択または2択）
   - 進行状況バー付き
   - 「スキップ」ボタン（後から診断可能）
3. `AutoCalcResultBadge.tsx` の実装
   - 生年月日から自動算出された星座・動物・六星占術の結果表示
   - TSK-DB-001のAPIが完成するまではモックデータで開発
4. `DiagnosisResultCard.tsx` の実装
   - 4体系の診断結果を1枚のカードにまとめる
5. 診断完了 → 統合レポート生成ページへの遷移ロジック
6. えんまさへのUIコピー確認依頼（Gate 2）

---

## 完了定義

- [ ] `MbtiQuizForm.tsx`・`DiagnosisResultCard.tsx`・`AutoCalcResultBadge.tsx` 実装済み
- [ ] スマホ表示（375px）で崩れない
- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] UIコピー（診断結果テキスト・ラベル）に禁止語彙なし（占い・鑑定・運勢・霊感）
- [ ] Gate 2（えんまさ）：UIコピー確認完了・プレビューURL添付

---

## 注意事項

- **APIとの接続**: TSK-DB-001（#27）がマージされるまでは、モックデータで並行開発する（API-First設計方針 — AGENTS.md §1）
- **Server Component 優先**: `'use client'` は本当に必要な場合のみ。インタラクティブな部分（MbtiQuizForm）はClient Componentで可
- **UXシーケンス確認**: F2は「安心フェーズ」の前段。共感→安心の順序を崩さない（設計中枢 Q3）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ（AI） | 初版作成 |
