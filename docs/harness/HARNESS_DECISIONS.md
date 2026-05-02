# HARNESS_DECISIONS.md — COCOSiL V2 ハーネス設計判断記録

リスク分類・設計判断の根拠を記録する文書。月次レビュー（`harness-health-improver`）の参照元。

| 項目 | 値 |
|---|---|
| 最終更新 | 2026-05-02 |
| 対応バージョン | Phase 2 + Phase 3（議論ログ_ハーネス導入.md準拠） |
| 関連ドキュメント | `AGENTS.md` §7, `.claude/skills/cocosil-domain/SKILL.md`, `docs/output/expert_logs/議論ログ_ハーネス導入.md` |

---

## 1. リスクレベル判定：R2+

### 判定根拠

| 要素 | 状態 | リスク評価への寄与 |
|---|---|---|
| **Supabase（ユーザーDB＋診断履歴）** | あり（`supabase/config.toml` 設置済み） | R2 → R2+ に押し上げ |
| **Clerk（認証・JWT）** | あり（`@clerk/nextjs` 7.3.0 導入済み） | R2 → R2+ に押し上げ |
| **AI診断コンテンツ**（4体系ナレッジ・プロンプト） | 計画中（`lib/prompts/`, `lib/data/` 未作成） | R2+ 維持 |
| **課金機能** | なし | R3 への昇格を回避 |
| **本番ユーザー影響範囲** | MVP段階・SNS小規模告知50〜100人想定 | R3 ほどではない |

**結論：** 「単純なR2では甘い、R3ほどではない」中間ゾーン → **R2+**。
現時点で AIエージェントが最も誤って触りやすいのは Supabase migration と Clerk JWT 設定。

### R3 へ昇格するトリガー

以下のいずれかが発生した時点で本ファイルを R3 に書き換える：
- 課金機能（Stripe等）の実装
- 本番ユーザー数が 1000 人を超える
- 個人情報（フルネーム・住所等）を Supabase に保存する仕様変更
- B2B 契約による SLA コミットメント

---

## 2. 3層保護モデルの採用根拠

議論ログ Turn 3 で松田氏が提示した「壊れたときの影響範囲」による分類を採用。

```
Layer 1 ── インフラ層（壊れると全ユーザー影響・修復不能）
  → Supabase DB schema / RLS policy
  → Clerk JWT設定 / redirect URL
  → .env系すべて

Layer 2 ── コンテンツ層（壊れると信頼が失われる・修復に時間）
  → 4体系ナレッジ（MBTI/星座/動物性格診断/六星占術）
  → AIプロンプトテンプレート
  → ユーザーの診断履歴

Layer 3 ── 開発層（壊れても Git revert で修復可能）
  → UIコンポーネント・APIルート・一般ロジック
```

### 各層の保護手段の選択

| 層 | 保護手段 | 選択理由 |
|---|---|---|
| Layer 1 | hook で実コマンドレベルでブロック | 「Gitでrevertできない＝AIに委ねられない」（Reversibility-First原則） |
| Layer 2 | AGENTS.md §7 で明示・PR レビュー必須 | hook で全パターン捕捉は不可能。意味設計担当（えんまさ）の人間判断に委ねる |
| Layer 3 | AI委任OK | MVP速度を守るため過剰なフェンスを置かない |

---

## 3. 「Minimum Fence, Maximum Speed」の判断軌跡

議論ログ Turn 4 で確立した原則：「最小限のフェンスで最大限に守る」。
以下は「ブロックしないと判断したケース」とその根拠。

| 操作 | 判断 | 根拠 |
|---|---|---|
| `rm -rf node_modules` | **通す** | 依存の再インストールは通常作業。広すぎる `rm` ブロックは開発を止める |
| `pnpm install` / `pnpm add` | **通す** | パッケージ管理の通常作業 |
| `git push` (force なし) | **通す** | feature ブランチへの通常 push は安全 |
| `next dev` / `next build` | **通す** | ビルドは可逆操作 |
| `cat src/components/foo.tsx` | **通す** | コード読み取りは漏洩リスクが低い |
| `supabase gen types` | **通す（destination限定）** | `pnpm db:types` 経由なら安全。出力先が `lib/types/` 以外の場合のみブロック |

### ブロック対象の最終リスト（12パターン）

`prevent-destructive-command.js` 内の `DESTRUCTIVE_PATTERNS` 配列が信頼源。
変更時は必ず本ファイルも同期更新すること。

カテゴリ別内訳：
- Supabase インフラ系: 3パターン（db reset / db push / migration repair）
- SQL 破壊系: 4パターン（DROP TABLE / TRUNCATE / RLS無効化 / 全権限ポリシー）
- .env 系読み取り: 2パターン（プロジェクト直下 / supabase/）
- Git 破壊系: 2パターン（force push / hard reset）
- rm 危険形: 1パターン（引数なし）

---

## 4. v1.3 体制への翻訳

議論ログは古い「2人体制（えんまさ=フロント・ヒラメ=バック）」前提で書かれているが、
要件定義 v1.3 は **3人体制（えんまさ=意味設計・まあみ=見た目設計・ヒラメ=構造設計）**。
本ハーネスはすべて v1.3 体制に整合させる。

| 議論ログの記述 | v1.3 への翻訳 |
|---|---|
| 「えんまさ（フロント）が `src/components/` に書き込む」 | まあみが `components/` に書き込む。えんまさは UI 実装には介入しない |
| 「ヒラメ（バック）が Supabase 触る」 | ヒラメ（構造設計）が `supabase/`・`app/api/` を触る |
| Layer 2 の「コンテンツ承認者」 | えんまさ（意味設計担当）が承認 |

---

## 5. スキップした 1shot プロンプト要素と理由

| 要素 | スキップ理由 |
|---|---|
| `.cursor/rules/project.mdc` 等 4 ファイル | Cursor 未使用（`.cursorrules` も `.cursor/` も不在） |
| `AGENTS.md` 新規作成 | 既存維持。§7 を追記するのみ |
| `CLAUDE.md` 新規作成 | 既存（`@AGENTS.md` のみ）維持 |
| `.github/workflows/agent-verify.yml` | 既存 `ci.yml`（typecheck + lint）が同等機能を提供 |
| PostToolUse formatter / Stop verify summary | MVP速度優先・「Minimum Fence」原則 |

---

## 6. Bootstrapping Governance — Admin bypassの設計的位置づけ

議論ログ `議論ログ_PRレビュー問題.md` の Turn 4〜5 に基づく判断。

### 問題の構造（Self-Blocking Anti-Pattern）

初期セットアップPR（setup/v2-init → main）において、以下の構造的問題が発生した：

```
.github/     @MasakiEndo44  ← えんまさだけ（CODEOWNERSに記載）
  ↓
えんまさがPR作成者 → 自分のPRを自分で承認できない（GitHubルール）
  ↓
まあみ・ヒラメはまだコラボレーター未招待 → 誰もマージできない
```

これは「審判が自分の試合を裁けない」問題であり、**Bootstrapping Paradox** と呼ぶ。

### 採用した設計判断

**Bootstrapping Governance の3原則：**

① **Transparent Bypass（透明なバイパス）**
Admin bypassは「こっそりルールを外す」のではなく、Ruleset Bypass Listに明示的に設定する。
GitHubのAudit Logで追跡可能にすることで「緊急例外」を「設計上の正当な経路」に変える。

② **Honest CODEOWNERS（現実に正直な所有者定義）**
招待されていないメンバーをCODEOWNERSに記載しない。
チームの現状を反映した設計を保ち、コラボレーター招待後に全員記載に更新する。

③ **Bootstrap PR ≠ Feature PR（初期ガバナンスPRの別扱い）**
ルール自体を作るPRと、ルールに従うPRは本質的に異なる。
初期段階はAdmin権限者がBootstrap PRをbypassマージし、以降の全PRから正規フローを適用する。

### 具体的な対処記録

| フェーズ | アクション | 状態 |
|---|---|---|
| Bootstrap期（今） | Ruleset Bypass ListにえんまさをAdmin追加 | → 実施予定 |
| Bootstrap期（今） | PR #2 を Admin bypass でマージ | → 実施予定 |
| コラボレーター招待後 | @shuichiro-16 / @maami415 を Collaborators に招待 | G4残作業 |
| コラボレーター招待後 | CODEOWNERSの `.github/` 等を全員記載に更新 | G4残作業 |
| 初の正規フロー | 更新PRをヒラメかまあみにレビューしてもらう | 未着手 |

### スキップした選択肢とその理由

| 選択肢 | 却下理由 |
|---|---|
| ヒラメ/まあみを先に招待→承認待ち | 招待受諾まで時間がかかる。今日マージ不可 |
| Code Owners required を一時オフ | 手動戻し忘れリスク。「こっそり外す」は透明性ゼロ |
| 直接main push | force push扱いでRulesetがブロック。不可 |

---

## 7. 月次レビュー時の確認項目

`harness-health-improver` 実行時に以下を確認：

1. `HARNESS_HEALTH.md` の Gap が解消されているか
2. ブロックパターンの誤検知（false positive）報告がないか
3. ブロックすべきだったが通った（false negative）パターンがないか
4. R2+ → R3 の昇格トリガーに該当する変更がないか
5. v1.3 → v1.4 など要件定義書の更新と整合しているか
