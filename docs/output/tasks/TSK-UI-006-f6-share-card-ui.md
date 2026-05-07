---
doc_id: task.f6.share-card-ui
title: TSK-UI-006 F6 シェアカード生成UI
doc_type: task
status: planned
author: まあみ
created_at: 2026-05-07
github_issue: "#42"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#46-snsシェアカードf6
related_impl_plan: ""
---

# TSK-UI-006：F6 シェアカード生成UI

> **ステータス**: planned
> **担当**: まあみ
> **Issue**: [#42](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/42)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

統合レポート完了画面からのSNSシェアカード生成UI。えんまさ設計プロンプトで4体系統合の独自タイプ名を生成し、COCOSiLブランドカラー（#5B21B6）ベースのシェアカード画像を生成・配信する。X / Instagram Stories / LINE へのワンタップシェアと OGP 対応のシェアURLを提供。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.6 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体 |

---

## 作成・変更ファイル一覧

```
app/(public)/share/
  └── [uuid]/page.tsx                # OGP対応シェアURL（cocosil.ai/share/{uuid}）

components/share/
  ├── ShareButton.tsx                # 「シェアする」ボタン（Thumb Zone）
  ├── ShareCardPreview.tsx           # カードプレビュー
  ├── ShareTargetButtons.tsx         # X / Instagram / LINE ワンタップ
  └── CopyUrlFallback.tsx            # URLコピーフォールバック

lib/share/
  ├── type-name-generator.ts         # 4体系統合タイプ名生成
  └── og-card.tsx                    # Vercel OG カード Reactコンポーネント
```

---

## 実装ステップ

1. 統合レポート完了画面に「シェアする」ボタン（Thumb Zone内）配置
2. タイプ名生成（`type-name-generator.ts`）でえんまさ設計プロンプト経由で4体系統合タイプ名を取得
3. シェアカード画像生成（`og-card.tsx`）— Vercel OG ベース、ブランドカラー `#5B21B6`
4. X / Instagram Stories / LINE のワンタップシェアボタン
5. シェア先未インストール時はURLコピーへフォールバック
6. タイプ名生成エラー時はデフォルトタイプ名（「4体系統合タイプ」）でフォールバック
7. OGP対応シェアURL（`cocosil.ai/share/{uuid}`）公開ページ実装
8. 禁止語監査

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] 統合レポート完了画面に「シェアする」ボタン（Thumb Zone内）
- [ ] 4体系統合タイプ名がカード上に表示される
- [ ] ブランドカラー `#5B21B6` ベースのカードデザイン
- [ ] X / Instagram Stories / LINE のワンタップシェアボタン
- [ ] シェア先未インストール時はURLコピーへフォールバック
- [ ] タイプ名生成エラー時はデフォルトタイプ名でフォールバック
- [ ] OGP対応シェアURL（`cocosil.ai/share/{uuid}`）生成
- [ ] 禁止語チェック通過
- [ ] Gate 2（えんまさ）動作確認完了（プレビュー画像 + タイプ名サンプル3件）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
