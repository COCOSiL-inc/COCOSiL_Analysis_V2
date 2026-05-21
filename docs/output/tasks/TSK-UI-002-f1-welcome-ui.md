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

ユーザーが30秒以内にアカウントを作成し、UXシーケンス「共感」フェーズの入口へ到達するためのフロントエンドUI。LP（ファーストビューに200文字以内の哲学提示）→ Clerk Embedded サインアップ → 生年月日入力（認証直後の必須ステップ）→ 「ようこそ」共感的初回対話までの体験を実装する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| F1要件書 | [F1_onboarding_features.md](../F1/F1_onboarding_features.md) | F1.1/F1.2/F1.4 Feature・EARS（grill成果物） |
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.1 |
| 言語設計 | [language-design-v1.md](../../input/concepts/language-design-v1.md) | 全体（禁止語チェック） |
| 設計中枢 | [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md) | §UXシーケンス |

---

## 作成・変更ファイル一覧

```
app/(public)/
  ├── page.tsx                       # LP（ファーストビューに哲学提示・200文字以内・F-8）
  ├── sign-up/
  │   └── page.tsx                   # Clerk Embedded <SignUp/>（自ドメイン・appearance #5B21B6・F-3）
  ├── sign-in/
  │   └── page.tsx                   # Clerk Embedded <SignIn/>（自ドメイン・F-3）
  └── onboarding/
      ├── birth-date/page.tsx        # 生年月日入力（認証直後の必須ステップ・F-5）
      └── welcome/page.tsx           # F1.3 ウェルカム対話画面

components/onboarding/
  ├── PhilosophyHero.tsx             # LP の哲学提示（ヘッドライン＋補足200字＋CTA・F-8）
  ├── BirthDateForm.tsx              # 生年月日入力（年/月/日の数値テキスト入力＋自動送り・F-4／インラインのプライバシー説明・F-6）
  └── WelcomeChat.tsx                # F1.3 共感対話 UI（グリル対象外・議論ログで確定済み）

lib/onboarding/
  └── schemas.ts                     # Zod スキーマ（生年月日: 未来日付/1900-01-01前/無効日付の3検証）

# 哲学提示の初回/再訪判定は Clerk 認証状態のみで行う（F-9）。
# 認証済みは middleware/RSC でアプリホームへリダイレクト。Cookie・DBフラグ・専用ファイル(first-visit.ts)は不要。
```

---

## 実装ステップ

1. LP（`app/(public)/page.tsx`）の**ファーストビュー**に200文字以内の哲学提示を実装（ヘッドライン「自分を知って、ラクになる。」＋補足＋サインアップCTA）。哲学コピー本文は language-design 別タスク（F-8）
2. 哲学提示の初回/再訪判定は **Clerk認証状態のみ**で行う：未認証は常にLP表示、認証済みはアプリホームへリダイレクト（Cookie・DBフラグ不使用・F-9）
3. 認証画面：Clerk **Embedded Components**（`<SignUp/>` / `<SignIn/>`）を自ドメインのページに組み込み、`appearance` で #5B21B6 に統一。Hosted Page不採用。SNSはGoogleのみ・上段配置（F-1/F-2/F-3）
4. 生年月日入力（`BirthDateForm.tsx`）：年/月/日の**数値テキスト入力＋自動フォーカス送り**で実装（3連プルダウン不採用）。Zodで未来日付・1900-01-01より前・無効日付(2/29等)の3条件をインライン検証（F-4／EARS-I1〜I3）
5. 生年月日フィールド直下に**インラインのプライバシー説明文**を常時表示（「なぜ必要か」＝4体系の自動計算／利用範囲の安心材料。本文は language-design 別タスク・F-6）
6. 生年月日は**認証直後の必須ステップ**として表示。スキップ導線は設けない（D4）。再訪時は生年月日入力済みなら自動スキップ（F-5）
7. F1.3 ウェルカム対話画面（`WelcomeChat.tsx`）を Active モードで実装し、AIから「今日はどんな気持ちで来ましたか？」を起点とする1〜2往復対話に対応（グリル対象外・議論ログで確定済み）
8. 禁止語チェック（`grep -r "占い|鑑定|運勢|当たる|霊感|霊視"` で UI コピー監査）

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] LPファーストビューで哲学提示が200文字以内・認証済みユーザーはアプリホームへリダイレクト（F-8/F-9）
- [ ] 認証画面が Clerk Embedded 型・自ドメイン・#5B21B6 で表示（F-3）
- [ ] 生年月日入力が数値テキスト入力＋自動フォーカス送りで動作（F-4）
- [ ] 生年月日入力がZodで未来日付/1900-01-01前/無効日付を弾く（EARS-I1〜I3）
- [ ] 生年月日フィールド直下にプライバシー説明文がインライン常時表示（F-6）
- [ ] 生年月日は必須ステップ・スキップ導線なし（D4）
- [ ] Clerk認証失敗時のエラーメッセージが言語設計文書準拠
- [ ] F1.3「ようこそ」共感対話が Active モードで起動
- [ ] 禁止語（占い・鑑定・運勢等）が含まれない
- [ ] Gate 2（えんまさ）動作確認完了（プレビューURL + 文言diff）

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-07 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成） |
| 2026-05-21 | えんまさ | F1要件グリル反映：D4（生年月日必須・スキップ導線削除）/ F-3 Embedded認証 / F-4 数値入力 / F-6 インラインプライバシー / F-8 ファーストビュー哲学 / F-9 認証状態判定 / EARS-I1〜I3 / F1要件書を参照に追加 |
