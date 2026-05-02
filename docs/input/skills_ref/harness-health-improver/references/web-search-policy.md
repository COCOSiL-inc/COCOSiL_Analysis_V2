# Web Search Policy

`harness-health-improver` が Web 検索を行う際の範囲・採用基準・安全基準。

---

## 2-Tier Search Range

検索は 2 段階で行う。Tier 1 を先に試み、不十分な場合のみ Tier 2 へエスカレーションする。

### Tier 1 (default): official_sources

`source-registry.yml` の `official_sources` を対象とする。

```yaml
# 検索対象ソース（source-registry.yml の official_sources）
claude_code:
  - Claude Code Skills
  - Claude Code Hooks
  - Claude Code Subagents
  - Claude Code Overview
openai_codex:
  - Codex AGENTS.md
  - Codex Skills
cursor:
  - Cursor Changelog
  - Cursor SDK
agent_skills:
  - Agent Skills Spec
```

採用ラベル: `[W: official:<URL>]`

Tier 1 で「十分な情報が得られた」と判断する条件:
- 具体的な設定例・コード例・イベント名が含まれている
- バージョンまたは日付が確認できる

---

### Tier 2 (escalation): research_sources

Tier 1 で以下のいずれかに該当した場合のみエスカレーションを申し出る:

| エスカレーション条件 | 説明 |
|---|---|
| 公式 docs に情報がない | API 仕様の変更前後など、docs が未更新 |
| 設計判断・トレードオフが必要 | 思想・比較・アーキテクチャ選択 |
| 公式 docs の説明が抽象的すぎる | 実践例が必要 |

エスカレーションゲートの文言:

```
official_sources では十分な情報が得られませんでした。
research_sources（Martin Fowler / Anthropic engineering blog 等）も調べますか？

対象: <何を確認するか>
クエリ案: "<search term>"

[Y: 調べる / n: 推論で進む]
```

`source-registry.yml` の `research_sources` 一覧:

```yaml
research_sources:
  - Martin Fowler: Harness engineering for coding agent users
  - Anthropic: Harness design for long-running application development
  - SkillsBench
  - METR: SWE-bench maintainer review
```

採用ラベル: `[W: research:<URL>]`

---

### community_sources（採用根拠に使わない）

`awesome-claude-code` 等は引き続き `reference_only`。  
改善案の採用根拠には使わない。参考リンクとして提示する場合のみ可。

---

## 検索クエリの生成方針

1. **具体的なトークンを含める**: イベント名・設定キー・バージョン・年（例: "Claude Code hooks PreToolUse 2026"）
2. **ツール名を含める**: "Claude Code" / "Cursor" / "Codex AGENTS.md" など
3. **型を明示する**: "schema" / "syntax" / "example" / "migration guide" など
4. **抽象クエリは避ける**: "best practices for AI coding" などは使わない

---

## 検索結果の提示フォーマット

```
🔎 検索結果 [Tier <1|2>]:
<2〜5 行の要約>
出典: <URL>
Tier: official | research
日付/バージョン: <確認できた場合>

この情報を改善案の根拠として採用しますか？
「Y」→ 採用し、提案に [W: <tier>:<URL>] ラベルを付ける
「n」→ 推論のみで提案を生成する
```

---

## 採用基準

| 基準 | Tier 1 (official) | Tier 2 (research) |
|---|---|---|
| 情報の具体性 | 設定例・コード例が必要 | 設計方針の説明で可 |
| 日付/バージョン確認 | 必須 | 推奨 |
| 採用ゲート | 通常の Y/n | 追加エスカレーションゲートが必要 |
| 採用ラベル | `[W: official:URL]` | `[W: research:URL]` |

以下の場合はいずれの tier でも採用しない:

- 出典不明のコミュニティ投稿（community_sources 相当）
- 具体的な設定例がなく「推奨」だけが書かれている
- 日付・バージョンが不明で最新性が確認できない（Tier 1 のみ厳格。Tier 2 は推奨）

---

## 安全基準

- 検索結果をそのまま改善案にしない。要約・解釈を経て提案する
- 個人情報・機密情報・APIキーを含む可能性のあるクエリは実行しない
- 外部サービスへのデータ送信につながるクエリは実行しない（repo 固有のコード片は含めない）
- 採用した検索結果は `[W: <tier>:<URL>]` ラベルで追跡可能にする
- Tier 2 への検索は必ずユーザーの明示的な Y を得てから実行する
