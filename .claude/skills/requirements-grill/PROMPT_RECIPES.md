# PROMPT_RECIPES.md — 推奨回答デフォルト集

各層の「推奨回答」生成が難しいとき、このファイルから適切なデフォルト候補を選ぶ。

---

## V 層: Vision デフォルト

### ビジョン文の 3 スタイル

**スタイル A（課題解決型）**:
> 「[ターゲット] が [現状の問題] から解放され、[理想の状態] に到達できる世界を作る。」

**スタイル B（能力付与型）**:
> 「[ターゲット] に [能力] を与え、[現状のN倍の成果] を生み出せるようにする。」

**スタイル C（社会変革型）**:
> 「[ドメイン] における [根本的な課題] を解消し、[社会的インパクト] を実現する。」

---

## O 層: Outcomes デフォルト

### 指標フォーマット 3 種

**AARRR（Pirate Metrics）向け**:
```
Acquisition: [ユーザー獲得指標]
Activation:  [初回成功体験の完了率]
Retention:   [継続利用率 / チャーン率]
Revenue:     [MRR / ARR]
Referral:    [紹介率 / NPS]
```

**OKR 向け**:
```
Objective: [定性的な目標]
KR-1: [測定可能な結果1]
KR-2: [測定可能な結果2]
KR-3: [測定可能な結果3]
```

**North Star 単一指標向け**:
```
North Star Metric: [1つの指標名]
Formula: [計算式]
Source: [データソース]
Cadence: [計測頻度: daily / weekly / monthly]
Target Q1: [目標値]
Floor: [失敗とみなす下限]
```

---

## C 層: Capabilities デフォルト語彙 30 選

AI プロダクトの Capability を表す動詞のリスト。ここから選んで具体化する。

**情報処理系**:
- summarize（要約する）
- extract（抽出する）
- classify（分類する）
- translate（変換・翻訳する）
- structure（構造化する）

**推論・判断系**:
- recommend（推奨する）
- predict（予測する）
- detect（検知する）
- reason（推論する）
- decide（判断支援する）

**生成系**:
- draft（下書きする）
- generate（生成する）
- synthesize（統合する）
- personalize（個別化する）
- augment（拡張する）

**管理・制御系**:
- route（振り分ける）
- orchestrate（統合管理する）
- monitor（監視する）
- alert（通知する）
- archive（保管する）

**対話・コミュニケーション系**:
- respond（回答する）
- clarify（明確化する）
- explain（説明する）
- negotiate（調整する）
- facilitate（促進する）

**検索・探索系**:
- retrieve（検索する）
- search（探索する）
- discover（発見する）
- connect（関連付ける）
- trace（追跡する）

---

## F 層: Feature デフォルト

### ユーザーストーリーテンプレ（日英）

**英語**:
> `As a [persona], I want [goal/action], so that [benefit/outcome].`

**日本語**:
> 「[ペルソナ] として、[目的] のために、[行動] したい。」

### Persona テンプレ
```
役職: [CXO / マネージャー / 現場担当者 / etc.]
所属: [スタートアップ / 大企業 / 政府機関 / etc.]
状況: [意思決定の場面 / 業務処理の場面 / etc.]
Pain: [現状で困っていること]
```

---

## E 層: Eval デフォルト（EARS 5 パターンの穴埋め）

```
U: The system shall [動作] [数値条件].
E: When [トリガー], the system shall [応答] within [時間].
S: While [状態], the system shall [継続] on every [周期/操作].
O: Where [オプション] is enabled, the system shall [追加動作].
W: If [エラー条件], the system shall [graceful degradation] and [通知].
```

---

## S 層: Tech Stack 3 プロファイル

### プロファイル A: Web アプリケーション

```
Language: TypeScript
Framework: Next.js (App Router)
AI SDK: Anthropic Claude SDK / Vercel AI SDK
DB: PostgreSQL + Prisma
Auth: Auth.js
Deploy: Vercel
```

### プロファイル B: AI エージェントシステム

```
Language: Python 3.12
Framework: FastAPI
AI SDK: anthropic-sdk-python / LangChain
Orchestration: Claude Managed Agents / LangGraph
Vector DB: Chroma / Pinecone
DB: PostgreSQL + SQLAlchemy
Deploy: Docker + Cloud Run
```

### プロファイル C: データパイプライン + AI

```
Language: Python 3.12
Pipeline: Airflow / Prefect
AI SDK: anthropic-sdk-python
Storage: S3 / GCS
DB: BigQuery / Snowflake
Batch: Cloud Run Jobs
Viz: Streamlit / Grafana
```

---

## Web Search Query Recipes（層別クエリ雛形集）

> 各層の Web Search Trigger が発動した時にそのまま使えるクエリ雛形。
> `<xxx>` の部分はセッション内容に合わせて置き換えること。
> 今日の日付（YYYY）を含めることで最新情報の確率が上がる。

### S 層（Engineering Spec）— 最重要・常に最新確認

#### S-1: Tech Stack バージョン確認

```
# フレームワーク最新バージョン
"Next.js latest stable version 2026"
"FastAPI latest version release notes 2026"
"<framework name> latest version 2026"

# SDK 最新バージョン
"Anthropic Python SDK latest version 2026"
"Anthropic TypeScript SDK changelog 2026"
"<provider> <language> SDK latest 2026"
```

#### S-5: モデル選定（最頻出）

```
# 最新モデルの確認
"Anthropic Claude latest model 2026 API pricing"
"OpenAI GPT latest model 2026 API"
"Google Gemini latest model 2026"
"<provider> AI model comparison <task> 2026"

# コスト比較
"LLM API pricing comparison 2026 cost per token"
"Claude vs GPT vs Gemini cost performance 2026"
```

#### S-7: 外部統合 API

```
# 認証方式
"<service name> API authentication OAuth 2026"
"<service name> REST API v2 documentation 2026"

# MCP / Tool Use 対応確認
"<service name> MCP server 2026"
"<service name> function calling tool 2026"
```

---

### E 層（Evals）

#### E-6: AI 評価手法

```
# 評価フレームワーク
"LLM evaluation framework best practices 2026"
"LLM as judge evaluation methodology 2026"
"HELM benchmark update 2026"
"AI evals tooling 2026 <task type>"

# ドメイン別評価
"<domain> AI system evaluation criteria 2026"
```

#### E-7: Hallucination 許容閾値

```
# 業界標準値
"LLM hallucination rate acceptable threshold enterprise 2026"
"AI hallucination benchmark <domain> 2026"
"RAG hallucination reduction rate benchmark 2026"

# ドメイン別（高精度が必要な場合）
"AI <legal/medical/financial> acceptable error rate 2026"
```

#### E-8: 評価データセット

```
# 公開データセット検索
"open source LLM evaluation dataset <task> Hugging Face 2026"
"<task type> benchmark dataset 2026"
"Japanese NLP evaluation dataset 2026"
```

---

### C 層（Capabilities）

#### C-2: Base-model vs Uplift

```
# モデル能力の最新状況
"Claude latest model <task> benchmark 2026"
"GPT-4o <task> capability 2026"
"RAG vs fine-tuning comparison 2026"
"when to use fine-tuning vs RAG 2026"
```

#### C-5: Graceful Degradation パターン

```
"AI product graceful degradation patterns production 2026"
"LLM fallback strategy best practices 2026"
"AI service degraded mode UX patterns 2026"
```

---

### O 層（Outcomes）

#### O-2: 業界ベンチマーク（数値参考）

```
# SaaS 指標
"SaaS B2B retention rate benchmark 2026"
"AI productivity tool DAU MAU benchmark 2026"
"<category> SaaS activation rate industry average 2026"
```

#### O-8: AI プロダクト固有指標

```
"AI product quality metrics KPI 2026"
"LLM production monitoring metrics best practices 2026"
"AI agent success rate benchmark 2026"
```

---

### V 層（Vision）

#### V-3: 競合現状確認

```
"<category> AI tool market overview 2026"
"<competitor name> product features update 2026"
"<category> competitive landscape 2026"
```

---

### F 層（Features）

#### F-7: 競合 Feature 比較

```
"<competitor name> features roadmap 2026"
"<category> SaaS standard features list 2026"
"<product category> feature benchmark 2026"
```

---

## 実装エージェントへの制約

このドキュメントを読む実装エージェントは以下を必ず守ること:

- 指定ファイル以外のコードを修正しない
- 指定外の依存パッケージをインストールしない
- デプロイ設定・環境変数・secrets を変更しない
- テストファイルを削除・スキップしない
- 既存の API 契約（エンドポイント・レスポンス形式）を変更しない（ADR の変更なしに）
