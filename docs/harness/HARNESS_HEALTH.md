# HARNESS_HEALTH.md — COCOSiL V2 ハーネス健康診断

既知の Gap・未整備領域・運用上の懸念を記録する文書。
新たな Gap を発見したら追記し、解消したら ✅ マークと解消日を記録する。

| 項目 | 値 |
|---|---|
| 最終更新 | 2026-05-03 |
| 次回レビュー | 2026-06-02（月次） |

---

## ⚠️ 既知の Gap

### ~~G8. まあみ claude_design フロー未定義~~ ✅ 解消（2026-05-03）
- **解消内容：** `docs/harness/DESIGN_FLOW.md` を新規作成。Gate 1（Coherence）→ Gate 2（Compatibility）→ Gate 3（Fidelity）の3段階ゲートを定義。`docs/input/setup/claude_design_prompt_template.md` でclaudie_designへのコンテキストインジェクションを標準化。
- **残作業：** `ONBOARDING.md` のまあみセクションに `DESIGN_FLOW.md` へのリンクを追加する。

### G1. テストコマンドが未整備
- **状態：** ❗ 未解消
- **詳細：** `package.json` に `test` スクリプトなし。Vitest 未導入。CI に `test` ジョブもなし。
- **影響：** ロジックの正確性は型チェックでしか担保できない。診断計算ロジック（`lib/diagnostics/`）の回帰検出ができない。
- **対応方針：** 機能実装が始まり、`lib/diagnostics/` で六星占術・動物性格診断の計算が走るタイミングで Vitest を導入する。
  - `pnpm add -D vitest @vitejs/plugin-react`
  - `package.json` に `"test": "vitest run"` を追加
  - `.github/workflows/ci.yml` に `test` ジョブを追加
- **担当：** ヒラメ（API/構造設計担当）

### ~~G2. `lib/prompts/` 未作成~~ ✅ 解消（2026-05-02）
- **解消内容：** `lib/prompts/` ディレクトリ作成済み。APIルート（`app/api/chat/`・`app/api/report/`）から `@/lib/prompts/` でエイリアス参照できる。

### ~~G3. `lib/data/` 未作成~~ ✅ 解消（2026-05-02）
- **解消内容：** `lib/data/` ディレクトリ作成済み。4体系ナレッジ（MBTI / 星座 / 動物性格診断 / 六星占術）を格納。APIルートから `@/lib/data/` で参照できる。
- **残作業：** 動物占い60アニマルの著作権確認（要件定義 v1.3 §8 リスク表参照）。

### ~~G4. CODEOWNERS が単独運用~~ ✅ 解消（2026-05-02）
- **解消内容：** ヒラメ（@shuichiro-16）・まあみ（@maami415）の GitHub アカウント確定。`.github/CODEOWNERS` を v1.3 体制（3人レイヤー別分業）に更新。
- **残作業：** 2人を GitHub リポジトリのコラボレーターとして招待する必要あり（GitHub Settings > Collaborators）。

### ~~G5. Clerk 環境変数未登録~~ ✅ 解消（2026-05-02）
- **解消内容：** `.env.local` に `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` と `CLERK_SECRET_KEY` を設定済み。
- **残作業：** GitHub Secrets への登録（CI で `build` ジョブを動かす場合に必要）→ G6 で追跡。

### ~~G6. GitHub Secrets 未登録~~ ✅ 解消（2026-05-02）
- **解消内容：** `SUPABASE_ACCESS_TOKEN` / `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` を GitHub Secrets に登録済み。`ci.yml` に `build` ジョブ追加・`deploy.yml` 作成が可能な状態。

### ~~G7. Branch Protection Rules 未設定~~ ✅ 解消（2026-05-02）
- **解消内容：** `main` ブランチに Ruleset を設定済み。PR 必須（Code Owners レビュー含む）・status checks（typecheck + lint）必須・force push ブロックを有効化。

---

## ✅ 解消済み Gap

（まだなし）

---

## 📋 ハーネス整備状況サマリー

| カテゴリ | 整備状況 |
|---|---|
| AIエージェント文脈注入（Layer A: AGENTS.md） | ✅ 完了（v1.3 体制反映済み） |
| AIエージェント文脈注入（Layer B: cocosil-domain skill） | ✅ 完了 |
| AIエージェント文脈注入（Layer C: cocosil-work command） | ✅ 完了 |
| 破壊的Bashコマンドのhookブロック | ✅ 完了（Phase 2） |
| Layer 1/2/3 Protected Areas（AGENTS.md §7） | ✅ 完了（Phase 2） |
| 検証コマンド（typecheck, lint） | ✅ 完了 |
| 検証コマンド（test） | ❗ G1 |
| 検証コマンド（build, CI） | ❗ G5, G6（環境変数依存） |
| CI/CD Pipeline（typecheck + lint） | ✅ 完了 |
| CI/CD Pipeline（security, deploy） | 🟡 Phase 4 以降 |
| Branch Protection | ❗ G7 |
| 評価プロンプト（evals/） | ✅ 完了（Phase 3） |
| HARNESS_DECISIONS / HARNESS_HEALTH | ✅ 完了（Phase 3） |

---

## 🔍 設計上の判断（記録）

### Cursor 関連ファイルは生成しない
- 1shot プロンプトは `.cursor/rules/`、`.cursor/hooks/` を要求しているが、本プロジェクトは Cursor 未使用（`.cursorrules` も `.cursor/` ディレクトリも存在しない）
- Claude Code のみで開発するため、`.cursor/` 系は生成不要
- 将来 Cursor を使うメンバーが加わった場合は本ファイルに G として追記する

### `.github/workflows/agent-verify.yml` は作成しない
- 既存 `.github/workflows/ci.yml`（typecheck + lint）が同等機能を提供
- 1shot プロンプトの「CI placeholder」は ci.yml で充足済み

### PostToolUse formatter / Stop verify summary は導入しない
- MVP 速度優先（議論ログの「Minimum Fence, Maximum Speed」原則）
- 必要性が確認されたら追加（trigger: false positive 報告 or 品質低下検知）
