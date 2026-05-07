---
doc_id: task.<feature>.<slug>
title: TSK-[分類]-[番号3桁] <タスク名>
doc_type: task
status: planned
author: <ヒラメ | まあみ | えんまさ>
created_at: YYYY-MM-DD
github_issue: "#TBD"
branch: <feature/NNN-slug>
related_requirements: docs/output/requirements/cocosil_v2_detailed_requirements_specification.md#<セクション番号>
related_impl_plan: ""
---

# TSK-[分類]-[番号3桁]：<タスク名>

> **ステータス**: planned | in-progress | review | done  
> **担当**: <ヒラメ / まあみ / えんまさ>  
> **Issue**: [#TBD](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/TBD)  
> **ブランチ**: `<feature/NNN-slug>`

---

## 概要

<!-- このTASKで何を実現するか、1〜2文で説明 -->

---

## 参照ドキュメント

| 種別 | パス | 参照箇所 |
|------|------|---------|
| 要件定義書 | [cocosil_v2_detailed_requirements_specification.md](../requirements/cocosil_v2_detailed_requirements_specification.md) | §<N> |
| 設計議論 | [docs/discussions/<関連議論ログ>.md](../../discussions/<関連議論ログ>.md) | — |

---

## 作成・変更ファイル一覧

```
<変更予定ファイルを列挙>
例:
supabase/migrations/
  └── YYYYMMDDNNNNNN_<description>.sql

lib/<area>/
  ├── types.ts
  └── <feature>.ts

app/api/<route>/
  └── route.ts
```

---

## 実装ステップ

1. <!-- Step 1 -->
2. <!-- Step 2 -->
3. <!-- Step 3 -->

---

## 完了定義

- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] <機能固有の動作確認項目>
- [ ] Gate 1（ヒラメ）確認完了（バックエンド変更がある場合）
- [ ] Gate 2（えんまさ）確認完了（UIコピー/プロンプト変更がある場合）

---

## 実装状況（更新ログ）

> このセクションを**実装進行中に更新**する。  
> 手動実装・AI実装問わず、PR作成前に最新状態に保つこと（`/finish-task` が確認する）。

| 日付 | 更新者 | 内容 |
|------|--------|------|
| YYYY-MM-DD | <担当者> | 初版作成 |
