# EARS_GUIDE.md — EARS 記法ガイド（1 ページで読み切る）

> EARS = Easy Approach to Requirements Syntax  
> AI プロダクトでは GEARS（Generalized EARS）拡張も追加

---

## 5 パターン早見表

| パターン | 形式 | いつ使う |
|---|---|---|
| **Ubiquitous** | `The system shall [動作].` | 常時成立する要件 |
| **Event-driven** | `When [イベント], the system shall [応答].` | トリガーで発動する要件 |
| **State-driven** | `While [状態], the system shall [継続動作].` | 状態中ずっと成立する要件 |
| **Optional** | `Where [設定/オプション], the system shall [動作].` | 特定設定のみに適用 |
| **Unwanted** | `If [異常条件], the system shall [エラー処理].` | エラー・例外処理 |

---

## パターン別 定型文と例

### 1. Ubiquitous（ユビキタス）

**形式**: `The system shall [動作].`

| ダメな書き方 | 良い書き方 |
|---|---|
| 「高速に動くこと」 | `The system shall respond within 2 seconds for all API calls.` |
| 「ログを残す」 | `The system shall log all user requests with timestamp and user_id.` |
| 「安全であること」 | `The system shall encrypt all data at rest using AES-256.` |

---

### 2. Event-driven（イベント駆動）

**形式**: `When [イベント], the system shall [応答].`

| ダメな書き方 | 良い書き方 |
|---|---|
| 「ユーザーが操作したとき処理する」 | `When a user submits a meeting transcript, the system shall extract key decisions within 10 seconds.` |
| 「ログインしたら表示する」 | `When a user successfully authenticates, the system shall redirect to the dashboard within 1 second.` |

---

### 3. State-driven（状態駆動）

**形式**: `While [状態], the system shall [継続動作].`

| ダメな書き方 | 良い書き方 |
|---|---|
| 「使っている間は動く」 | `While a session is active, the system shall validate the auth token on each API request.` |
| 「処理中は何かする」 | `While a batch job is running, the system shall update the progress indicator every 5 seconds.` |

---

### 4. Optional（オプション）

**形式**: `Where [設定], the system shall [動作].`

| ダメな書き方 | 良い書き方 |
|---|---|
| 「管理者向けの機能」 | `Where admin mode is enabled, the system shall display the audit log panel.` |
| 「English 対応版なら翻訳する」 | `Where the user locale is set to 'en', the system shall display all UI labels in English.` |

---

### 5. Unwanted behavior（異常・エラー）

**形式**: `If [異常条件], the system shall [エラー処理].`

| ダメな書き方 | 良い書き方 |
|---|---|
| 「エラーのとき何かする」 | `If the LLM API returns a 5xx error, the system shall retry once after 2 seconds and display a fallback message.` |
| 「タイムアウトしたとき」 | `If a response is not received within 30 seconds, the system shall cancel the request and show the user a timeout notification.` |

---

## AI プロダクト固有の GEARS 拡張

通常の EARS では AI の品質を表現しにくいため、以下のパターンを追加する。

### GEARS-1: 出力品質要件

**形式**: `The system shall achieve [指標] of [値] as measured by [評価方法].`

例: `The system shall achieve a semantic similarity score of 0.85 or above as measured by cosine similarity on the evaluation dataset.`

### GEARS-2: Hallucination 制約

**形式**: `The system shall not generate [種別の情報] that cannot be verified against [根拠].`

例: `The system shall not generate numeric statistics that cannot be verified against the provided source documents.`

### GEARS-3: Graceful Degradation

**形式**: `If [AI capability が失敗], the system shall [代替動作] and notify the user that [何が起きたか].`

例: `If the summarization model fails to process the input, the system shall return the original text unchanged and notify the user that automatic summarization is unavailable.`

---

## よくある間違い（チェックリスト）

- [ ] 「高速」「早い」「良い」など主観的な形容詞を使っていない（数値で書く）
- [ ] 「など」「できる限り」などの曖昧表現を使っていない
- [ ] `shall` を使っている（`should` / `must` / `may` は EARS では使わない）
- [ ] 1 文に 2 つの要件を混ぜていない（1 shall = 1 要件）
- [ ] 実装方法を書いていない（「Redis を使って」等は ADR に書く）
