---
doc_id: task.f3.report-ui
title: TSK-UI-003 F3 統合レポートUI
doc_type: task
status: planned
author: まあみ
created_at: 2026-05-07
github_issue: "#34"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#43-統合レポートf3-v2の核心
related_impl_plan: ""
---

# TSK-UI-003：F3 統合レポートUI

> **ステータス**: planned
> **担当**: まあみ
> **Issue**: [#34](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/34)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

4体系診断結果をAIで統合し、「安心」フェーズを経てリッチなレポートをユーザーに届けるフロントエンドUI。COCOSiLのUXシーケンス「安心→分析」の中核実装。F3.2「安心」フェーズ → レポート本体 → しっくりきたマーカー → 満足度アンケート → 再生成導線までを担当する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| F3フィーチャー要件 | [F3_integrated-report_features.md](../F3/F3_integrated-report_features.md) | §1〜§5（F3.1〜F3.5 体験定義・受け入れ基準） |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.3 |
| 設計中枢 | [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md) | UXシーケンス・三毒 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体 |

---

## 作成・変更ファイル一覧

```
app/(auth)/
  └── report/
      ├── page.tsx                      # F3.2 安心フェーズ → レポート本体
      ├── reassurance.tsx               # F3.2 安心フェーズ表示
      └── success-survey.tsx            # F3.4 満足度アンケート

components/report/
  ├── BreathAnimation.tsx               # 呼吸アニメーション（4〜8秒）
  ├── ReportImage.tsx                   # Vercel OG PNG表示 / Markdown フォールバック
  ├── KnowMarker.tsx                    # F3.3 しっくりきたマーカーボタン
  ├── SatisfactionSurvey.tsx            # F3.4 5段階+自由記述
  └── RegenerateButton.tsx              # F3.5 再生成ボタン（30日経過判定）

lib/report/
  └── reassurance-timer.ts              # 15秒最大タイマー
```

---

## 実装ステップ

1. F3.2 安心フェーズUI（`reassurance.tsx`）を実装：呼吸アニメ4〜8秒・60字以内テキスト・AIサブテキスト100字以内・Thumb Zone内CTA「読んでみる→」
2. 15秒最大タイマー → CTAタップまたはタイムアウトでレポート本体へ遷移
3. レポート本体表示（`ReportImage.tsx`）：Vercel OG PNG（1024×1792）優先、失敗時はMarkdown+CSSフォールバック
4. F3.3 しっくりきたマーカー（`KnowMarker.tsx`）を各セクション末に配置・タップで `know_markers` 保存API呼び出し
5. F3.4 満足度アンケート（`SatisfactionSurvey.tsx`）を末尾配置・5段階+自由記述・送信API呼び出し
6. F3.5 再生成ボタン（`RegenerateButton.tsx`）：30日未満はグレーアウト・有料プラン誘導モーダル表示
7. 禁止語監査（`grep -r "占い|鑑定|運勢|当たる|霊感|霊視"` で UIコピー）
8. アクセシビリティ：呼吸アニメは `prefers-reduced-motion` を尊重しスキップ可能

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] F3.2「安心」フェーズが最大15秒・呼吸アニメ・60字以内テキスト・Thumb Zone内CTA
- [ ] CTAタップまたは15秒経過でレポート本体に遷移
- [ ] Vercel OG生成失敗時にMarkdown+CSSフォールバックで継続表示
- [ ] F3.3 しっくりきたマーカーが各セクションでタップ記録できる
- [ ] F3.4 満足度アンケート（5段階+自由記述）が表示・送信できる
- [ ] F3.5 再生成ボタンが30日未満ではグレーアウト・有料プラン誘導表示
- [ ] 禁止語チェック通過
- [ ] Gate 2（えんまさ）動作確認完了（プレビューURL + UXフロー図）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
| 2026-05-21 | えんまさ | F3要件精緻化（F3_integrated-report_features.md）に伴い参照を追加（task-issue-generator メンテ） |
