# Project Risk Taxonomy

## R0: Throwaway prototype

破壊しても困らない試作。throwaway demo, hackathon, spike.

**必要:**
- AGENTS.md
- CLAUDE.md
- build command (あれば)
- simple PR summary

**不要:**
- 複雑な hooks
- LLM judge
- multi-agent
- heavy eval
- security review skill

---

## R1: Internal low-risk tool

社内低リスクツール。社内メモツール、管理画面、内部ダッシュボードなど。

**必要:**
- AGENTS.md
- CLAUDE.md
- lint / build
- lightweight docs update
- `.env*` 保護

**任意:**
- code-change-verification skill

---

## R2: Customer-facing app

顧客向け通常アプリ。SaaS, LP, dashboard, ECサイトなど。

**必要:**
- AGENTS.md
- CLAUDE.md
- Cursor rules
- lint / typecheck / test / build
- PR summary
- secrets 保護
- CI

**任意:**
- UI review skill
- release review skill

---

## R3: Data-sensitive / admin / payment / production DB

データ・課金・管理者権限があるシステム。DB直接操作、支払い、auth/authz、admin panelなど。

**必要:**
- R2 の全部
- destructive command guard (hooks)
- migration review
- auth / security review
- production data access 禁止
- dependency addition confirmation
- audit log

**任意:**
- semgrep / static analysis
- secret scanning
- DB schema change checklist

---

## R4: Hardware / drone / defense / municipal / safety-critical

ハードウェア、ドローン、防衛、自治体、安全関連システム。

**必要:**
- R3 の全部
- simulation-first rule (実機作動前にシミュレーション必須)
- hardware actuation 禁止 or human approval 必須
- safety envelope
- local / offline constraints
- ops log
- change approval
- real-device test protocol
- legal / security review separation

**任意:**
- formal acceptance checklist
- test bench procedure
- artifact signing

**禁止:**
- AIが単独で実機作動コマンドを実行
- failsafe 無視
- キャリブレーション値の無根拠変更
- 現場手順書なしの飛行/作動テスト
- 外部ネットワーク前提の実装 (defense/municipal)
- 機密データの外部送信 (defense/municipal)
- 出典不明の法令/制度回答 (defense/municipal)
- 監査ログなしの自動処理 (defense/municipal)
