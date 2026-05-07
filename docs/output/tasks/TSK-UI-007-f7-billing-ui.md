---
doc_id: task.f7.billing-ui
title: TSK-UI-007 F7 課金UIコンポーネント
doc_type: task
status: planned
author: まあみ
created_at: 2026-05-07
github_issue: "#44"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#47-課金サブスクリプションf7-stripe
related_impl_plan: ""
---

# TSK-UI-007：F7 課金UIコンポーネント

> **ステータス**: planned
> **担当**: まあみ
> **Issue**: [#44](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/44)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F7課金・サブスクリプションのフロントエンドUI。アップグレード誘導モーダル、Stripe Payment Element 組み込み（日本語UI）、Stripe Billing Portal へのリダイレクト導線を実装する。誘導文言は COCOSiL のトーン（押し売り回避・ユーザー価値ベース）に従う。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.7 |
| 関連API | [TSK-API-005](TSK-API-005-f7-stripe-api.md) | サーバー実装 |

---

## 作成・変更ファイル一覧

```
app/(auth)/billing/
  ├── page.tsx                      # プラン管理画面
  └── upgrade/page.tsx              # アップグレードフロー

components/billing/
  ├── UpgradeModal.tsx              # 誘導モーダル（COCOSiLトーン）
  ├── PaymentElement.tsx            # Stripe Payment Element組み込み
  ├── PlanComparison.tsx            # 無料/有料の機能差分
  └── PortalLink.tsx                # Billing Portal リダイレクトボタン
```

---

## 実装ステップ

1. プラン制限到達時のアップグレード誘導モーダル（COCOSiLトーン）
2. Stripe Payment Element（日本語UI）組み込み
3. 決済完了後の機能制限即時解除UI（Webhook受信を待ってフラグ反映）
4. Billing Portal リダイレクトボタン
5. プラン比較表（無料/有料の機能差分）
6. 禁止語監査

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] プラン制限到達時のアップグレードモーダル（COCOSiLトーン）
- [ ] Stripe Payment Element（日本語UI）組み込み
- [ ] 決済完了後の機能制限即時解除UI
- [ ] Billing Portal リダイレクトボタン
- [ ] プラン比較表（無料/有料の機能差分）
- [ ] 禁止語チェック通過
- [ ] Gate 2（えんまさ）動作確認完了（プレビューURL + 文言diff）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
