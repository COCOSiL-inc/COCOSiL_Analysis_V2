---
name: harness-health-improver
description: >
  Use when HARNESS_HEALTH.md has open gaps, recurring incidents, or unresolved
  improvement candidates. Reads the health log, searches the web for best practices
  from official Claude Code / Cursor / Codex docs and trusted sources, and proposes
  minimal harness changes (rule / hook / skill / script).
  Does NOT auto-apply changes — human approval required for every change.
  Use when: "ハーネスを改善したい" "HARNESS_HEALTH を見て改善案を出して"
  "最新のベストプラクティスを調べて" "harness を最新化したい"
  "health improver" "ハーネスの見直し" "gaps を解消したい"
  — or when HARNESS_HEALTH.md has entries older than 14 days with status: Open.
---

# harness-health-improver Skill

> `HARNESS_HEALTH.md` の課題を読み、Webサーチで最新ベストプラクティスを調べて  
> 最小限の改善案を提案する。変更の採用は人間が決定する。

---

## §1 PURPOSE

このSkillは以下を行う。

1. `docs/harness/HARNESS_HEALTH.md` の Open Gaps / Incidents / Candidate improvements を読む
2. 各課題について 2-tier でWebサーチ: Tier 1（`official_sources`）→ 不十分な場合のみ Tier 2（`research_sources`）
3. `over-harnessing-policy.md` に準拠した**最小修正案**を生成
4. 各提案に「採用基準・見送り基準・測定可能なシグナル・eval 追加案」を付ける
5. 人間の承認を待ち、承認された項目のみ実装ステップに進む

このSkillは変更を**自動適用しない**。提案と根拠の提示が役割。

---

## §2 PROCEDURE

### Step 1: HARNESS_HEALTH.md を読む

```
docs/harness/HARNESS_HEALTH.md を Read する。

以下のセクションを抽出:
- Known gaps (Status: Open のもの)
- Incidents (Harness change が空のもの)
- Candidate improvements (Decision が空のもの)
```

抽出後、件数と概要を表示する:

```
=== Harness Health 確認結果 ===

Open Gaps: <N>件
未対処 Incidents: <M>件
改善候補: <K>件

対処を検討する項目:
1. [Gap] <日付> <内容>
2. [Incident] <日付> <内容>
...

すべての項目を調査しますか？
「はい」→ 全件処理（多い場合は先に優先順位を確認）
「<番号>」→ その項目だけ処理
「stop」→ 終了
```

---

### Step 2: source-registry.yml を確認する

```
source-registry.yml を Read し、official_sources と research_sources の URL リストを把握する。
検索方針の詳細は references/web-search-policy.md を参照（ロードは検索ゲート発動時のみ）。
```

---

### Step 3: 各課題を調査する（2-tier 検索）

各課題について以下を実行する。

```
[Tier 1: official_sources を試みる]

1. 課題の内容から "検索クエリ案" を生成する
   - 対象: 公式 docs での最新の推奨手法・設定例・API
   - 例: "Claude Code hooks PreToolUse permissionDecision 2026"

2. Tier 1 ゲートを出す:
   "🔎 Web (Tier 1: official) で調査しますか？"
   "   課題: <課題内容>"
   "   クエリ案: \"<search term>\""
   "   対象ソース: <source-registry の official_sources 該当 URL>"
   ""
   "   [Y: 検索する / n: スキップ（推論のみで案を出す）]"

3. Y が選ばれた場合:
   - WebSearch または WebFetch(url=<official URL>) を実行
   - 結果から関連情報を 3〜5 行で抽出
   - 採用ラベル: [W: official:<URL>]

4. Tier 1 の結果が不十分な場合（設計判断・思想・比較など公式 docs にない領域）:
   → Tier 2 エスカレーションゲートを出す:

   "official_sources では十分な情報が得られませんでした。"
   "research_sources（Martin Fowler / Anthropic engineering blog 等）も調べますか？"
   ""
   "   対象: <何を確認するか>"
   "   クエリ案: \"<search term>\""
   ""
   "   [Y: 調べる / n: 推論で進む]"

   Y が選ばれた場合:
   - WebSearch または WebFetch(url=<research URL>) を実行
   - 採用ラベル: [W: research:<URL>]

5. 調査結果（または推論）をもとに改善案を生成する（§4 参照）
```

---

### Step 4: 改善案の生成（over-harnessing-policy 準拠）

1 課題あたり最大 3 案を生成する。各案に以下を必須添付:

```markdown
### 改善案 <番号>: <タイトル>

**課題**: <HARNESS_HEALTH.md の該当行>

**提案内容**:
<具体的な変更内容。変更箇所・変更理由を明記>

**変更対象**:
- ファイル: <path>
- 種別: rule / hook / skill / script のいずれか

**採用すべき理由**:
<根拠（Web検索結果 or 推論）>
<出典があれば: Source: <URL>>

**見送るべき場合**:
<この案が不適切なケース>

**測定可能なシグナル**:
<この改善の効果をどう確認するか>

**eval 追加案**:
<evals/ に追加すべきプロンプト（1 件）>

**over-harnessing チェック**:
- [ ] 具体的な失敗・課題がある
- [ ] 失敗が再発しそう
- [ ] lint/test/typecheck で防げない
- [ ] 改善効果 > 追加コスト
- [ ] 測定可能なシグナルがある
```

---

### Step 5: 提案の提示と承認取得

全課題の改善案を表示したあと、以下を表示する:

```
=== 改善案 サマリー ===

<案一覧（番号・タイトル・変更種別）>

採用する案の番号を教えてください。
「<番号>」→ その案を実装ステップに進む
「全部」  → 全案を順に実装
「none」 → 今回は見送り（HARNESS_HEALTH.md に記録）
「修正」 → 案の内容を変更してから実装
```

---

### Step 6: 承認後の実装ガイダンス

承認された案について、**実装手順を提示する**（自動適用はしない）。

```
=== 実装ガイダンス: <案タイトル> ===

1. <変更ファイル> に以下を追加/変更:
   <diff形式または具体的な内容>

2. evals/ に以下を追加:
   <eval プロンプト>

3. HARNESS_HEALTH.md の該当行を更新:
   Status: Open → Resolved
   Harness change: <変更内容の概要>
   Eval added: <eval ID>

4. docs/harness/HARNESS_DECISIONS.md に変更理由を追記する。

実装を進めてください。完了したらお知らせください。
```

---

## §3 SAFETY CONSTRAINTS

- **自動適用禁止**: このSkillはファイルを書かない。実装は人間または人間の承認後に進める
- **検索範囲**: `source-registry.yml` の `official_sources` のみ（v0.2 初版）
- **提案数の上限**: 1 課題あたり最大 3 案
- **eval 必須**: 採用案ごとに eval プロンプト 1 件以上を必須提案
- **抽象指示禁止**: 「品質を上げる」「ベストプラクティスに従う」などの抽象提案は行わない。`references/improvement-patterns.md` の具体化テンプレを使う

---

## §4 REFERENCES

| ファイル | 役割 | ロードタイミング |
|---|---|---|
| `references/improvement-patterns.md` | 失敗パターン→改善案テンプレート集 | 改善案生成時 |
| `references/web-search-policy.md` | 検索範囲・採用基準・安全基準 | Web検索ゲート発動時 |
| `../kecku-harness-bootstrap/references/over-harnessing-policy.md` | 追加・削除の基準 | 各案のチェック時 |
