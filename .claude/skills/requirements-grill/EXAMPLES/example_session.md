---
doc_id: grill.<product>.vision.example-01
doc_type: grill_session
product: [<product>]
layer: sandbox
status: completed
as_of: 2026-04-18
owners: [<member-slug>]
grill_target:
  product: <product>
  layers: [V, C, F, E]
  current_layer: E
  writeout_paths:
    V: docs/requirements/<product>/vision.md
    C: docs/requirements/<product>/capabilities/
    F: docs/requirements/<product>/features/
    E: docs/requirements/<product>/evals/
---

# Grill Session 模範例: [PRODUCT] / Vision + Capability + Feature + Eval

> このファイルは requirements-grill スキルが 1 サイクル完走したときの  
> **模範セッション（EXAMPLE）**です。実際のデータではなく、  
> LLM が挙動を理解するための具体的な動作例として用意しています。

---

## State

- turns: 24
- progress_stalled_turns: 0
- last_saved: 2026-04-18T15:30:00Z
- next_action: "全層 writeout 完了。セッション status: completed"
- mode: NEW

---

## Layer Progress

- V: { answered: 8/8, ready_to_writeout: true, writeout_done: true }
- O: { answered: 0/8, ready_to_writeout: false, writeout_done: false }
- C: { answered: 8/8, ready_to_writeout: true, writeout_done: true, items: ["CAP-001_pre-meeting-context"] }
- F: { answered: 8/8, ready_to_writeout: true, writeout_done: true, items: ["FEAT-001_pre-meeting-briefing"] }
- E: { answered: 8/8, ready_to_writeout: true, writeout_done: true, items: ["FEAT-001_evals"] }
- S: { answered: 0/8, ready_to_writeout: false, writeout_done: false }

---

## Open Questions

（なし — 全て解決済み）

---

## QA Log

### INIT-1: プロダクト選択
- Q: どのプロダクトの要件を詰めますか？
- recommended: <product> / <product-b> / <product-c>
- answer: <product>
- label: [U]
- at: 2026-04-18T10:00:00Z

### INIT-2: 開始層
- Q: どの層から始めますか？
- recommended: Vision（初回は Vision から推奨）
- answer: はい、Visionから
- label: [A]
- at: 2026-04-18T10:00:30Z

### INIT-3: 新規 or 更新
- Q: 既存要件の更新ですか、新規作成ですか？
- recommended: 新規作成
- answer: 新規
- label: [A]
- at: 2026-04-18T10:01:00Z

### V-1: Pain
- Q: <product> は「誰の・何の痛みを」解きますか？
- recommended: （docs/products/<product>/ から引用）経営層・マネージャーが情報過多で意思決定が遅れる問題
- answer: 経営判断が遅い。情報は揃っているのに、それを整理して意思決定まで持っていく時間と認知負荷が高い。特に CXO クラスが会議の前に文脈を頭に入れる時間が取れない。
- label: [U]
- at: 2026-04-18T10:02:00Z

### V-2: 3年後の差分
- Q: 3年後、<product> が世界にあるのとないのでは何が違いますか？
- recommended: 「CXO が毎朝 <product> のブリーフィングを見てから会議に臨む」という状態
- answer: <product> がある世界では、CXO は会議室に入る前に全ての背景情報を把握している。ない世界では今と同じで、会議の最初の20分が状況確認に使われる。
- label: [U]
- at: 2026-04-18T10:04:00Z

### V-3: 必然性
- Q: 競合ではなく[PROJECT_NAME]（あなたたち）がこれをやる必然性は？
- recommended: （チームの固有強みを記述）
- answer: 認知科学の知見を実際のプロダクト設計に使える人間が少ない。<member-slug>のバックグラウンドがそこにある。
- label: [U]
- at: 2026-04-18T10:06:00Z

### V-4: Non-goals
- Q: <product> が絶対に目指さない方向は？
- recommended: 汎用AIアシスタント（Copilot化）、タスク管理ツール化
- answer: 全員向けの汎用ツールにはしない。経営判断に特化する。通知やTODO管理はやらない。
- label: [U]
- at: 2026-04-18T10:07:30Z

### V-5: Primary Persona
- Q: 中心に置くユーザーは？
- recommended: CXO / 経営幹部
- answer: スタートアップ〜中堅企業の CxO（CEO / COO / CFO）。意思決定の最終責任者。
- label: [U]
- at: 2026-04-18T10:08:30Z

### V-6: 民間 / 防衛
- Q: 民間 / 防衛 / 両方のどれに軸足を？
- recommended: 民間（<product> の対象は民間）
- answer: 民間。
- label: [A]
- at: 2026-04-18T10:09:00Z

### V-7: North Star Quote
- Q: 成功したとき顧客が言う1文は？
- recommended: 「<product> のおかげで、会議前の準備が30分→3分になった」
- answer: 「以前は会議の前夜に2時間かけて資料を読んでいたが、今は <product> のブリーフィングを5分見るだけで済む」
- label: [U]
- at: 2026-04-18T10:11:00Z

### V-8: One-line thesis
- Q: このビジョンを1文で言うと？
- recommended: 「経営幹部の情報過多による意思決定遅延を、認知科学ベースのAIブリーフィングで解消するプロダクト」
- answer: いいですね、それで。
- label: [A]
- at: 2026-04-18T10:12:00Z

---

> **-- V 層 Summary 確認 --**
> （エージェントがここで V 層サマリーを表示し、ユーザーが「承認」と回答）
> → WriteoutGate → vision.md に書き出し

---

### C-1: できること動詞列挙
- Q: <product> が「できるべきこと」を動詞で列挙してください。
- recommended: （PROMPT_RECIPES.md の語彙から）summarize / extract / recommend / prioritize / synthesize
- answer: 会議の前に情報を要約できる、意思決定に必要な論点を抽出できる、過去の意思決定の文脈を引き出せる、アクション候補を提示できる
- label: [U]
- at: 2026-04-18T10:15:00Z

### C-2: Base model vs Uplift
- Q: それぞれ base-model で十分ですか？
- recommended: 「会議前要約 → base model で可能。論点抽出 → RAG/tool-use が必要かも」
- answer: 要約は base model でいける。論点抽出は会社のドキュメントにアクセスが必要なので RAG が必要。
- label: [U]
- at: 2026-04-18T10:17:00Z

（... 以下 C-3〜C-8 省略 ...）

---

> **-- C 層 Summary + WriteoutGate --**
> → `docs/requirements/<product>/capabilities/CAP-001_pre-meeting-context.md` に書き出し

---

### F-1〜F-8: Pre-meeting Briefing Feature

（代表的な回答のみ抜粋）

### F-5: ユーザーストーリー
- Q: 1文ユーザーストーリーを作りましょう。
- recommended: "As a CxO, I want a 5-minute briefing before each meeting, so that I can make decisions without spending 2 hours on preparation."
- answer: それで。
- label: [A]
- at: 2026-04-18T11:00:00Z

---

> **-- F 層 Summary + WriteoutGate --**
> → `docs/requirements/<product>/features/FEAT-001_pre-meeting-briefing.md` に書き出し

---

### E-1: Ubiquitous
- Q: 常に満たすべき要件は？
- recommended: The system shall generate briefings within 30 seconds of request.
- answer: 30秒は長い。10秒以内にしたい。
- label: [U]
- → 採用: `The system shall generate meeting briefings within 10 seconds of user request.`
- at: 2026-04-18T11:15:00Z

### E-2: Event-driven
- Q: トリガーで発動する要件は？
- recommended: When a user opens a meeting event, the system shall ...
- answer: When a meeting event is created in the calendar, the system shall automatically generate a briefing within 1 minute.
- label: [U]
- at: 2026-04-18T11:17:00Z

### E-7: Hallucination 許容閾値
- Q: hallucination をどこまで許容しますか？
- recommended: 経営判断に使うので 0% 目標。検証できない情報は出力しない。
- answer: そう。ファクトチェックできないことは「確認が必要」と明示する。
- label: [U]
- at: 2026-04-18T11:25:00Z

---

> **-- E 層 Summary + WriteoutGate --**
> → `docs/requirements/<product>/evals/FEAT-001_evals.md` に書き出し
> → セッション status: completed に更新

---

## Decisions (Resolved)

- D1: <product> は CxO 向け会議前ブリーフィングを核とする（sources: [V-1, V-5, F-1]）
- D2: 認知科学 × AI の差別化は RAG ベースの論点抽出に体現される（sources: [V-3, C-2]）
- D3: hallucination はゼロ目標。検証不能情報は「確認が必要」フラグ付きで出力（sources: [E-7]）

---

## Conflicts

- CF1: V-2 では「会議前に5分で済む」と言ったが、E-1 で「10秒以内」という制約が出た。  
  解決: システムの応答時間（10秒）とユーザーが使う時間（5分）は別の概念。両方採用。（at: 11:20:00Z）

---

## Writeouts

- V -> docs/requirements/<product>/vision.md (written at 2026-04-18T10:13:00Z)
- C -> docs/requirements/<product>/capabilities/CAP-001_pre-meeting-context.md (written at 2026-04-18T10:45:00Z)
- F -> docs/requirements/<product>/features/FEAT-001_pre-meeting-briefing.md (written at 2026-04-18T11:10:00Z)
- E -> docs/requirements/<product>/evals/FEAT-001_evals.md (written at 2026-04-18T11:35:00Z)

---

## Web Searches

- WS-1: Q=S-5 / query="Anthropic Claude latest model 2026 API pricing"
  tool=WebSearch / at=2026-04-18T12:05:00Z
  result_summary: "Claude 3.7 Sonnet が 2025-02 にリリース。claude-3-5-haiku が最速・低コスト版。claude-3-opus は廃止予定。"
  source: anthropic.com
  adopted: true / adopted_as: "[W: anthropic.com] claude-3-7-sonnet（高精度）または claude-3-5-haiku（低コスト）を推奨"

---

## Notes

- Outcomes（O）は次のセッションで実施予定
- Engineering Spec（S）は Capability / Feature が確定してから別セッションで
- S 層で RAG の設計を詰める必要あり（C-2 の結論から）

---

## S 層 Web 検索発動例（模範ターン）

> **この節は「S-5 モデル選定で Web 検索が発動した」際の典型的なターンを示す模範例。**

```
=== S 層グリル開始 ===

--- [S-5] ---
Q: 使用する AI モデルとその理由を教えてください。

🔎 Web で最新確認しますか？
   対象: Anthropic/OpenAI の最新モデル名・バージョン・価格
   クエリ案: "Anthropic Claude latest model 2026 API pricing"

   [Y: 検索する / n: 推論デフォルトで進む]

> ユーザー: Y

🔎 検索結果:
Claude 3.7 Sonnet（2025-02 リリース）が現時点の最新 Sonnet 系。
claude-3-5-haiku が高速・低コスト版として継続提供中。
claude-3-opus は 2025 年末に廃止予定で新規利用は非推奨。
出典: anthropic.com

この情報を推奨回答に採用しますか？ [Y/n]

> ユーザー: Y

推奨（更新済み）: [W: anthropic.com] 
  - claude-3-7-sonnet（高精度・速度バランス）← 最新
  - claude-3-5-haiku（高速・低コスト）← 最新
  ※ claude-3-opus は廃止予定のため非推奨

(Enter で推奨採用 / 別の回答を入力 / 「後で」で [X] 保留)

> ユーザー: claude-3-7-sonnet を使いたい。会議のブリーフィング精度が最優先なので。

→ ラベル: [U]（ユーザーが具体的な理由と共に選択）
→ QA Log に記録: S-5 / claude-3-7-sonnet / [U]
→ Web Searches に記録: WS-1（上記の通り）
```

**ポイント**:
- PROMPT_RECIPES の古い候補名（`claude-3-5-sonnet`）を提示する前に Web 検索を挟んだ
- ユーザーが `Y` を選んだ後も「採用しますか？」の確認を 1 回置いた（自動採用しない）
- 採用した値は `[U]` ラベル（ユーザーが語った）。Web 情報はあくまで「推奨の補強材料」
- `[W: ...]` ラベルは推奨の段階で付与し、ユーザー回答のラベルとは分離した
