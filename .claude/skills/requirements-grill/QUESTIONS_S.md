# QUESTIONS_S.md — Engineering Spec 層 定型問い

## この層の目的

「どう作るか」を技術仕様として定義する。最も頻繁に変わる層。  
Feature / Eval が固まった後に詰める。  
AI エージェント（Cursor / Claude Code）が実装の指示として使える精度で書く。

## 完了条件（Exit Criteria）

Tech Stack / データモデル / API 契約の骨子が書かれていること。  
AI エージェント向けの禁止事項が明示されていること。

## このあと進む層

Engineering Spec 完了 → Phase（実装フェーズ）の定義  
または V → O → C → F → E → S の全層完了 → セッション completed

## 書き出し先

`docs/requirements/<product>/engineering/` 配下の各ファイル  
テンプレート: `docs/requirements/_template/eng_spec_template.md`

---

## 定型問い一覧

### S-1: Tech Stack

**問い**: 言語・フレームワーク・主要ライブラリは何を使いますか？

**推奨回答の探し方**:
1. `docs/products/<product>/` の architecture.md を確認
2. `PROMPT_RECIPES.md` の tech stack 3 プロファイルを提示して選んでもらう

**Web Search Trigger**: フレームワーク/SDK のバージョンは時効性が高い
- 発動タイミング: PROMPT_RECIPES のプロファイルを提示する前
- クエリ例: `"Next.js latest stable version 2026"` / `"FastAPI latest version 2026"` / `"Anthropic Python SDK latest 2026"`
- ツール: `WebSearch` → 各フレームワークの最新バージョンを確認してからプロファイルに反映
- スキップ条件: ユーザーが既に具体的なバージョンを明示している

**escape hatch**: 「まだ決めていない」→ [X] 保留。PROMPT_RECIPES.md の「agent system プロファイル」を推奨として提示

---

### S-2: 主要データモデル

**問い**: 主要なデータエンティティとフィールドを教えてください。

**推奨フォーマット**:
```
Entity: <名前>
  - field_name: type  # 説明
```

**escape hatch**: 「わからない」→ Feature のユーザーストーリーから逆算: 「F-3（完了状態）に必要なデータは何ですか？」

---

### S-3: API 契約の骨子

**問い**: 主要な API エンドポイント（入力・出力）の骨子を教えてください。

**推奨フォーマット**:
```
POST /api/<endpoint>
  Input: { field: type }
  Output: { field: type }
  Error: 400 / 500
```

**escape hatch**: 「UI が先」→ 「UI と連携するには何のデータが必要ですか？」から逆算

---

### S-4: UI の主要画面と状態遷移

**問い**: プロダクトの主要な画面と、その間の遷移を教えてください。

**推奨フォーマット**: 画面名 → 遷移 → 画面名（矢印で簡易表現）  
例: 「ログイン → ダッシュボード → 詳細画面 → アクション一覧」

**escape hatch**: 「まだ決まっていない」→ [X] 保留。Feature のトリガー（F-2）と完了状態（F-3）から最低限の画面を提案

---

### S-5: モデル選定

**問い**: 使用する AI モデルとその理由を教えてください。

**推奨選択肢**:
- claude-sonnet（高精度・速度バランス）
- claude-haiku（高速・低コスト）
- fine-tuned モデル（ドメイン特化が必要な場合）
- tool-use + base model（外部 API 呼び出しが必要な場合）

**Web Search Trigger**: モデル名・能力・価格は最も時効性が高い（最重要）
- 発動タイミング: 上記「推奨選択肢」を提示する前に**必ず**発動候補
- クエリ例: `"Anthropic Claude latest model 2026 API pricing"` / `"OpenAI GPT latest model 2026"`
- ツール: `WebSearch` → 最新モデル名・バージョン・価格帯を確認してから選択肢を提示
- スキップ条件: ユーザーが既にモデル名を明示している

**escape hatch**: 「わからない」→ C-2（uplift 要否）の回答を踏まえて推奨を提示

---

### S-6: プロンプト / システム指示の構造

**問い**: AI への指示（システムプロンプト）の構造と主要な指示内容は何ですか？

**推奨フォーマット**:
```
[System]: <役割宣言 + 制約>
[User]: <入力テンプレ>
[Assistant]: <期待する出力形式>
```

**escape hatch**: 「まだわからない」→ C-1（できること）と E-1（ユビキタス要件）から骨格を自動提案

---

### S-7: 外部統合

**問い**: 外部サービス・API・データソースとの統合はありますか？

**推奨フォーマット**:
```
| 統合先 | 方式（REST / MCP / SDK） | 認証方式 |
```

**Web Search Trigger**: 外部 API の仕様・認証方式・エンドポイントは変更が多い
- 発動タイミング: 特定の外部サービス名（Slack, Google, Notion など）がユーザーから出た時
- クエリ例: `"<サービス名> API authentication method 2026"` / `"<サービス名> MCP server availability 2026"`
- ツール: `WebSearch` → 認証方式（OAuth2 / API Key / Service Account 等）と最新 SDK を確認
- スキップ条件: ユーザーが「外部統合なし」と明示している

**escape hatch**: 「ない」→ [A] で「外部統合なし（スタンドアロン）」と記録

---

### S-8: ADR 候補（Architecture Decision Records）

**問い**: このプロダクトで「採用 / 不採用」を記録すべき重要な技術選択はありますか？

**推奨トリガー**:
- 「A と B で迷った」という過去の経緯がある場合
- 将来の開発者が「なぜこれを選んだ？」と疑問を持ちそうな場合

**escape hatch**: 「特にない」→ [A] で「ADR なし（理由が自明のため）」と記録

---

## AI エージェント向け禁止事項（必ず書き出しファイルに含める）

```
実装エージェントは以下を必ず守ること:
- [ ] 指定ファイル以外を修正しない
- [ ] 指定外の依存パッケージをインストールしない
- [ ] デプロイ設定・環境変数を変更しない
- [ ] テストを削除しない
```

---

## Escape Hatch 共通ルール（S 層）

- Capability の話に戻る → 「Capability は確定済みです。実装の具体化を進めましょう」
- 「Cursor が自動で決める」→ 「それは ADR として記録しましょう。将来エージェントが変えてはいけないことを明示します」
- 情報が多すぎて分散する → ファイルを分ける（api_contracts.md / data_model.md 等に分割）
