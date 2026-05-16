# WEB_ESCALATION.md — requirements-grill Web 検索エスカレーション仕様

> **性能控えめ LLM でもこの仕様を先頭から読めば動く。**  
> SKILL.md §5 THE GRILL LOOP から参照される。

---

## 1. 概要

grill 中に KB・推論デフォルト（PROMPT_RECIPES.md）だけでは推奨回答の信頼性が低いと
判断したとき、軽量ゲートを経由して Web 検索を発動し、推奨回答を補強する仕組み。

**原則**:
- grill の 1 問 1 答テンポを壊さない（軽量ゲート 1 往復だけ追加する）
- Web 由来の情報は `[W: <source>]` ラベルで明示し、KB 推論（`[I: ...]`）と混同しない
- ユーザーが `n` を選んだ時点で検索せず推論デフォルトで進む
- 失敗時は必ず縮退してグリルを止めない

---

## 2. 発動トリガーの種類

### 2a. 事前トリガー（QUESTIONS_*.md に明示）

各層の問いに `**Web Search Trigger**` 小節が付いているとき、その問いに到達したら
ゲートを提示する。スキップ条件が成立している場合はゲートを省略してよい。

対象一覧（優先度順）:

| 層 | 問い | 発動理由 |
|---|---|---|
| S | S-1 Tech Stack | フレームワーク/SDK のバージョンは時効性が高い |
| S | S-5 モデル選定 | モデル名・価格・能力が頻繁に変わる（最重要） |
| S | S-7 外部統合 | API 仕様・認証方式は変更が多い |
| E | E-6 AI 評価方法 | 業界標準手法（HELM / LLM-as-judge 等）の最新動向 |
| E | E-7 Hallucination 許容閾値 | 業界事例・ドメイン別の許容値の標準 |
| E | E-8 評価データセット | 公開データセットの最新リスト |
| C | C-2 Base-model vs Uplift | fine-tuning / tool-use の最新能力事情 |
| C | C-5 Graceful Degradation | 業界事例・パターン集 |
| O | O-2 四半期ターゲット | 業界ベンチマーク（比較値として） |
| O | O-8 AI プロダクト固有指標 | Eval スコアの業界標準値 |
| F | F-7 Out of Scope | 競合プロダクトの feature 範囲の確認 |
| V | V-3 必然性 | 競合プロダクトの現状確認 |

### 2b. 動的トリガー（エージェント判断）

事前トリガーに該当しない問いでも、以下のシグナルを検出したら動的にゲートを提示してよい:

- 推奨回答が「まだ情報が不足しています」で終わる（PROMPT_RECIPES の最終手段に達した）
- 推奨する値が「年」「バージョン」「API」「SDK」「モデル名」「価格」を含む
- ユーザーが「最新は何？」「今どうなっている？」「調べて」と聞いてきた
- KB と PROMPT_RECIPES のどちらにも具体的な数値・固有名詞がない

---

## 3. 軽量ゲートの文言（必ずこの形式を使う）

```
🔎 Web で最新確認しますか？
   対象: <何を確認するか 1 行>
   クエリ案: "<search term>"

   [Y: 検索する / n: 推論デフォルトで進む]
```

- クエリ案は日本語 or 英語どちらでもよい（英語の方が結果が広い）
- `skip` と言われた場合は `[X]` 保留と同じ扱い

---

## 4. ツール優先順と使い方

| 優先 | ツール | 使う条件 |
|---|---|---|
| 1 | `WebSearch` | 固有名詞・最新情報・バージョン確認（ほとんどのケース） |
| 2 | `WebFetch` | 公式ドキュメントの URL が特定できた時 |
| 3 | その他リサーチツール | 学術論文・ベンチマーク原典が必要な時のみ |

**WebSearch の使い方**（grill 内での典型）:

```python
# S-5 モデル選定の例
WebSearch(search_term="Anthropic Claude latest model 2026 pricing API")
# E-7 Hallucination 許容値の例
WebSearch(search_term="LLM hallucination rate acceptable threshold enterprise 2026")
```

---

## 5. 検索結果の処理手順

```
[WEB SEARCH SUB-LOOP]

1. WebSearch / WebFetch を実行する
2. 結果から関連情報を 2-3 行で抽出・要約する
3. ユーザーに要約を提示する:
   "🔎 検索結果:
    <2-3 行要約>
    出典: <URL or ドメイン>
    
    この情報を推奨回答に採用しますか？ [Y/n]"
4. Y → 推奨回答を更新し、ラベルを [W: <source>] にする
   n → 推論デフォルトで進む（ラベルは [I: ...] または [A]）
5. セッションファイルの ## Web Searches に WS-N エントリを追記する
```

---

## 6. ラベル体系（拡張後）

| ラベル | 意味 |
|---|---|
| `[U]` | ユーザーが直接語った値 |
| `[I: 根拠]` | KB または過去回答から推論した値 |
| `[A]` | PROMPT_RECIPES.md のデフォルトをそのまま採用 |
| `[X]` | 未決定（後で補完） |
| **`[W: <source>]`** | **Web 検索由来（source は URL or ドメイン名）** |

`[W: ...]` は `[I: ...]` とは別物扱い。WRITEOUT GATE の LABEL AUDIT で
「Web 由来の値が含まれています。ソースを確認してください」と警告する。

---

## 7. セッションログへの記録

`## Web Searches` セクション（SESSION_TEMPLATE.md に定義済み）に以下の形式で追記:

```markdown
- WS-1: Q=S-5 / query="Anthropic Claude latest model 2026"
  tool=WebSearch / at=2026-04-18T10:30:00Z
  result_summary: "Claude Sonnet 4.6 が最新。..."
  source: anthropic.com
  adopted: true / adopted_as: "[W: anthropic.com] claude-sonnet-4-6 を推奨"
```

- `adopted: false` の場合は `adopted_as` を省略してよい
- セッション再開（RESUME）時にも参照できるよう必ず書く

---

## 8. 安全性チェック（ops-doc-guardrails.mdc との整合）

Web 由来の情報をフロントマターや本文に書き込む前に以下を確認すること:

- [ ] 出典 URL が実在するか確認した（URLを見た）
- [ ] 情報の日付が今日から 1 年以内か（古いページは `[X]` 保留にする）
- [ ] ユーザーが採用を明示的に承認したか（自動採用しない）
- [ ] ユーザーが提供した情報と矛盾していないか（矛盾したら §7.3 Contradiction フローへ）

---

## 9. 失敗時の縮退

| 状況 | 対応 |
|---|---|
| `WebSearch` ツールが利用不可（コンテキスト外） | 推論デフォルトにフォールバック。Notes に「Web 検索推奨: <対象>」を追記 |
| 検索結果が古い・信頼できない | 採用せず `[X]` 保留。「手動で確認してください」とコメント |
| 検索結果が grill の論点と無関係 | 採用せず推論デフォルトで進む |
| ユーザーが同層で 2 回連続 `n` を選ぶ | 以降その層では Web ゲートを自動抑制。セッションに `web_gate_suppressed_layers: [<layer>]` を記録 |
| WebFetch が 404 / 非 200 | `WebSearch` で代替して URL を再取得 |

---

## 10. 実装しないこと（スコープ外）

- Web 検索結果を `knowledge/90_sources/raw/` に自動保存 → Phase 2 拡張候補
- 他のリサーチスキルとの自動連携 → 論文が必要な時だけ手動でスキル呼び出し
- MCP サーバの追加設定 → 既存の `WebSearch` / `WebFetch` ツールで充足
