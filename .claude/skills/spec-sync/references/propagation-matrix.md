# Propagation Matrix — COCOSiL 仕様変更伝播マトリクス

変更種別 × 影響ファイル × Layer × 承認者の完全対応表。
スキル実行時にこのテーブルを参照して影響先を列挙する。

---

## P1：哲学更新

**トリガーファイル：** `docs/input/concepts/COCOSiL設計中枢.md`

| 影響ファイル | 変更すべき箇所 | Layer | 承認者 | 優先度 |
|---|---|---|---|---|
| `AGENTS.md` | §0「プロダクト哲学」— 設計3原則・5問リトマス試験紙 | L2 | えんまさ | 🔴 必須 |
| `.claude/skills/cocosil-domain/SKILL.md` | 設計3原則・PMF仮説・UXシーケンス記述 | L2 | えんまさ | 🔴 必須 |
| `.cursor/rules/00-core-philosophy.mdc` | 設計3原則・5問リトマス試験紙 | L2 | えんまさ | 🔴 必須 |
| `docs/output/requirements/cocosil_v2_system_requirements.md` | プロダクトビジョン・設計原則セクション | L3 | — | 🟡 推奨 |
| `docs/README.md` | プロダクトビジョン冒頭 | L3 | — | 🟡 推奨 |
| `AGENTS.md` | §8 Autogenesis Constitution の絶対不変リスト | L2 | えんまさ | 🔴 必須（Constitution変更時のみ） |

---

## P2：禁止語変更

**トリガーファイル：** `lib/constitution/banned-words.ts`

| 影響ファイル | 変更すべき箇所 | Layer | 承認者 | 優先度 |
|---|---|---|---|---|
| `.claude/skills/language-design/SKILL.md` | 禁止語リスト・代替表現テーブル | L2 | えんまさ | 🔴 必須 |
| `AGENTS.md` | §6「ドメイン言語—禁止表現」の禁止語リスト | L2 | えんまさ | 🔴 必須 |
| `docs/input/concepts/language-design-v1.md` | 禁止語・使い分けガイドラインの該当箇所 | L3 | — | 🟡 推奨 |
| `.cursor/rules/00-core-philosophy.mdc` | 禁止語セクション | L2 | えんまさ | 🟡 推奨 |

**⚠️ 注意：** 禁止語の「追加」はえんまさ承認必須。「削除」は特に慎重に扱う（削除の理由をAGENTS.md §6に記録する）。

---

## P3：UXシーケンス変更

**トリガーファイル：** `lib/constitution/ux-sequence.ts`

| 影響ファイル | 変更すべき箇所 | Layer | 承認者 | 優先度 |
|---|---|---|---|---|
| `AGENTS.md` | §0「非交渉のUXシーケンス」 | L2 | えんまさ | 🔴 必須 |
| `.claude/skills/cocosil-domain/SKILL.md` | UXシーケンス記述・フェーズ説明 | L2 | えんまさ | 🔴 必須 |
| `.cursor/rules/00-core-philosophy.mdc` | UXシーケンス記述 | L2 | えんまさ | 🔴 必須 |
| `docs/output/requirements/cocosil_v2_detailed_requirements_specification.md` | UXフロー・フェーズ定義セクション | L3 | — | 🟡 推奨 |
| `lib/prompts/**` | プロンプト内のフェーズ参照箇所 | L2 | えんまさ | 🔴 必須（フェーズ名変更時のみ） |

**⚠️ 警告：** UXシーケンス変更は PMF仮説（7日以内再訪率30%）に直結する。変更前に必ず `expert-misaki-discussion` で意図を議論すること。

---

## P4：機能スコープ変更

**トリガーファイル：** `docs/output/requirements/**`、Issue/PR本文

| 影響ファイル | 変更すべき箇所 | Layer | 承認者 | 優先度 |
|---|---|---|---|---|
| `.claude/skills/cocosil-domain/SKILL.md` | 機能一覧（F1/F2/F3）・スプリント計画 | L3 | — | 🔴 必須 |
| `docs/harness/DESIGN_FLOW.md` | 機能ロードマップ・依存関係図 | L3 | — | 🔴 必須 |
| `AGENTS.md` | §2「レイヤードアーキテクチャ」・スプリント計画記述 | L2 | えんまさ/ヒラメ | 🟡 推奨 |
| `docs/README.md` | 機能概要セクション | L3 | — | 🟡 推奨 |
| `docs/harness/HARNESS_HEALTH.md` | 未解決ギャップ（GN）の更新 | L3 | — | 🟡 推奨 |
| `docs/output/requirements/cocosil_v2_system_requirements.md` | 機能要件セクション | L3 | — | 🔴 必須（大規模変更時） |

---

## P5：API/DB設計変更

**トリガーファイル：** `app/api/**`、`supabase/`（schema変更）、`lib/types/database.ts`、`lib/diagnostics/**`

| 影響ファイル | 変更すべき箇所 | Layer | 承認者 | 優先度 |
|---|---|---|---|---|
| `docs/output/requirements/cocosil_v2_detailed_requirements_specification.md` | API仕様・DB設計セクション | L3 | — | 🔴 必須 |
| `docs/harness/HARNESS_HEALTH.md` | 技術的負債・ギャップリスト更新 | L3 | — | 🔴 必須 |
| `AGENTS.md` | §3「技術スタック」— 技術スタック変更時のみ | L2 | ヒラメ | 🟡 推奨 |
| `docs/ONBOARDING.md` | セットアップ手順・接続情報 | L3 | — | 🟡 推奨（エンドポイント変更時） |
| `lib/types/database.ts` | 型定義（`pnpm db:types` 再実行で自動生成） | L3 | — | 🔴 必須（手動編集禁止・コマンド実行） |

**⚠️ 前置チェック：** P5変更を含む場合、先に `security-sensitive-change-review` スキルを実行する。  
**⚠️ Layer 1警告：** `supabase/migrations/**` はAIが絶対に変更しない。マイグレーションは人間が手動実行。

---

## 共通：AGENTS.md のセクション別 Layer

`AGENTS.md` は頻繁に更新対象になるため、セクション別にLayerを明確化する。

| セクション | 内容 | Layer | 承認者 |
|---|---|---|---|
| §0「プロダクト哲学」 | 設計中枢・3原則・5問 | L2 | えんまさ |
| §1「API-First設計」 | API契約方針 | L2 | ヒラメ |
| §2「レイヤードアーキテクチャ」 | 役割分担 | L2 | えんまさ/ヒラメ |
| §3「技術スタック」 | 確定スタック一覧 | L2 | ヒラメ |
| §4「リソース制約」 | Supabase制約 | L2 | ヒラメ |
| §5「開発環境」 | pnpm・パスエイリアス | L2 | ヒラメ |
| §6「ドメイン言語」 | 禁止語・代替表現 | L2 | えんまさ |
| §7「Protected Areas」 | Layer 1/2/3定義 | L2 | えんまさ/ヒラメ |
| §8「ブランチ管理」 | 命名規則 | L3 | — |
| §9「スキル使い分け」 | スキルトリガー | L3 | — |

---

## Constitution整合性チェックポイント

`lib/constitution/` が実装された場合、以下の整合性を確認する：

| constitutionファイル | 対応する「正」の位置 | ドキュメント側（コメンタリー） |
|---|---|---|
| `lib/constitution/banned-words.ts` | コード（正） | `language-design/SKILL.md`、`AGENTS.md §6` |
| `lib/constitution/ux-sequence.ts` | コード（正） | `AGENTS.md §0`、`cocosil-domain/SKILL.md` |
| `lib/constitution/immutables.ts` | コード（正） | `AGENTS.md §8 Autogenesis Constitution` |
| `lib/constitution/mutables.ts` | コード（正） | `AGENTS.md §8 積極進化対象` |

矛盾が検出された場合：「コードを正として、ドキュメントをコードに合わせる」方向で更新提案を出す。
