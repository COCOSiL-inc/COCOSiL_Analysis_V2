---
doc_id: task.f1.welcome-ui
title: TSK-UI-002 F1 ウェルカム対話UIコンポーネント
doc_type: task
status: planned
author: まあみ
created_at: 2026-05-07
github_issue: "#32"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#41-オンボーディング登録f1
related_impl_plan: ""
---

# TSK-UI-002：F1 ウェルカム対話UIコンポーネント

> **ステータス**: planned
> **担当**: まあみ
> **Issue**: [#32](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/32)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

ユーザーが30秒以内にアカウントを作成し、UXシーケンス「共感」フェーズの入口へ到達するためのフロントエンドUI。LP（200文字以内の哲学提示）→ Clerkサインアップ → 生年月日入力フォーム → 「ようこそ」共感的初回対話までの体験を実装する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.1 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体（禁止語チェック） |
| 設計中枢 | [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md) | §UXシーケンス |

---

## 作成・変更ファイル一覧

```
app/(public)/
  ├── page.tsx                       # LP（哲学提示・200文字以内）
  ├── sign-up/
  │   └── page.tsx                   # Clerk サインアップページ
  └── onboarding/
      ├── birth-date/page.tsx        # 生年月日入力フォーム
      └── welcome/page.tsx           # F1.3 ウェルカム対話画面

components/onboarding/
  ├── PhilosophyHero.tsx             # LP の哲学提示コンポーネント
  ├── BirthDateForm.tsx              # 生年月日入力フォーム（Zod検証）
  └── WelcomeChat.tsx                # F1.3 共感対話 UI

lib/onboarding/
  ├── schemas.ts                     # Zod スキーマ（生年月日検証）
  └── first-visit.ts                 # 初回判定ロジック（再訪時哲学提示スキップ）
```

---

## 実装ステップ

1. LP（`app/(public)/page.tsx`）に200文字以内の哲学提示を実装し、初回訪問判定で再訪時はスキップする
2. Clerkサインアップ画面を `app/(public)/sign-up/page.tsx` に組み込み（言語設計準拠のエラー文言）
3. 生年月日入力フォーム（`BirthDateForm.tsx`）に Zod スキーマで未来日付・1900年以前を弾くインラインバリデーションを実装
4. F1.3 ウェルカム対話画面（`WelcomeChat.tsx`）を Active モードで実装し、AIから「今日はどんな気持ちで来ましたか？」を起点とする1〜2往復対話に対応
5. SNS認証後に生年月日スキップが選択できる導線を設置（後から入力可能・「未設定」状態保持）
6. 禁止語チェック（`grep -r "占い|鑑定|運勢|当たる|霊感|霊視"` で UI コピー監査）

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] LPで哲学提示が200文字以内・初回のみ表示・再訪時スキップ
- [ ] Clerk認証失敗時のエラーメッセージが言語設計文書準拠
- [ ] 生年月日入力がZodスキーマで未来日付/1900年以前を弾く
- [ ] F1.3「ようこそ」共感対話が Active モードで起動
- [ ] 禁止語（占い・鑑定・運勢等）が含まれない
- [ ] Gate 2（えんまさ）動作確認完了（プレビューURL + 文言diff）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
