---
doc_id: task.f2.six-star-reigosei
title: TSK-API-007 F2 六星占術 霊合星人ロジック実装
doc_type: task
status: planned
author: ヒラメ
created_at: 2026-05-21
github_issue: "#54"
branch: TBD
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#421c-六星占術算出
related_impl_plan: ""
---

# TSK-API-007：F2 六星占術 霊合星人ロジック実装

> **ステータス**: planned
> **担当**: ヒラメ（実装）／えんまさ（ロジック妥当性レビュー）
> **Issue**: [#54](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/54)
> **ブランチ**: `TBD — /start-task で作成`

---

## 概要

F2 性格分析の六星占術算出（`lib/diagnostics/six-star.ts`）に、12分類（6星×陰陽）の上位概念として「霊合星人」の判定を追加する。PR #53（TSK-DB-001 = F2バックエンド3体系診断ロジック）で本判定アルゴリズムが要件未定義のまま見送られ、Follow-up として本TSKで対応する。

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §4.2.1c 六星占術算出 |
| Protected Areas | [AGENTS.md §7](../../../AGENTS.md) | Layer 2（`lib/diagnostics/**`） |
| 親PR | [PR #53](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/pull/53) | 検証データセット No.8（コメント） |

**要件定義書からの引用（§4.2.1c）:**
> 判定キー：年・月・日すべて使用（命数算出に使用）／出力：`six_star: string`（例: `"土星人(+)"`)／分類数：6星 × 陰陽 = 12分類／実装：`lib/diagnostics/six-star.ts`

**検証データセット（PR #53 コメント）:**
| No | 生年月日 | 期待出力 |
|---|---|---|
| 8 | 1966/01/30 | 火星人+ 霊合星 |

霊合星人は12分類の判定とは独立した「上位フラグ」であり、要件定義書には未記載のため、公開されている六星占術ルールを参照して実装する（PR #53 コメントでえんまさが承認済み）。

---

## 作成・変更ファイル一覧

```
lib/diagnostics/
  └── six-star.ts                       # 霊合星人判定ロジックを追加

lib/diagnostics/__tests__/
  └── six-star.test.ts                  # 霊合星該当・非該当・境界ケースのテスト追加

lib/data/
  └── destiny-number-database.ts        # 必要に応じて霊合星人判定用データ追加（要調査）
```

---

## 実装ステップ

1. 公開されている六星占術ルールから霊合星人の判定アルゴリズムを調査・整理（年月日 → 霊合星該当判定）
2. 戻り値の形式を決定：
   - 案A: 文字列 `"火星人+ 霊合星"` で返す（既存呼び出し側互換）
   - 案B: 構造化 `{ star: '火星人+', reigosei: true }` に変更（呼び出し側も改修）
   - えんまさ判断を仰ぐ（Gate 2）
3. `lib/diagnostics/six-star.ts` の `calculateSixStar` に霊合星判定ロジックを追加
4. 既存呼び出し側（`app/api/diagnosis/auto-calc/route.ts`・`app/api/diagnosis/route.ts` ほか）の型と挙動を更新
5. `lib/diagnostics/__tests__/six-star.test.ts` にテスト追加：
   - No.8（1966/01/30 → 火星人+ 霊合星）= 該当ケース
   - 既存12分類8件 = 非該当ケース（リグレッション防止）
   - 境界月日 = 該当/非該当の閾値ケース
6. Gate 1（ヒラメ）：型安全・エラー境界・既存テスト全通過を確認
7. Gate 2（えんまさ）：診断結果サンプル3ケース（該当・非該当・境界）を添付してロジック妥当性レビュー

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] `pnpm build` 通過
- [ ] No.8 (1966/01/30 → 火星人+ 霊合星) を含む霊合星該当ケースのテストが通る
- [ ] 既存12分類判定の8件テストが引き続き通る（リグレッションなし）
- [ ] 境界月日（霊合星該当/非該当の閾値）のテストケースが通る
- [ ] 出力形式の決定と既存呼び出し側との互換性確認完了
- [ ] Gate 1（ヒラメ）レビュー完了：型安全・エラー境界・N+1なし
- [ ] Gate 2（えんまさ）レビュー完了：診断結果サンプル3ケース添付・ロジック妥当性承認

---

## 実装状況（更新ログ）

| 日付 | 更新者 | 内容 |
|------|--------|------|
| 2026-05-21 | えんまさ | 初版作成（task-issue-generator スキルにより自動生成、PR #53 Follow-up） |
