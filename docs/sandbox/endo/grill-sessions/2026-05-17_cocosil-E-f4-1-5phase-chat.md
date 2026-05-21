---
doc_id: grill.cocosil.E.f4-1-5phase-chat
doc_type: grill_session
product: [cocosil]
layer: sandbox
status: in_progress
as_of: 2026-05-17
owners: [endo]
grill_target:
  product: cocosil
  feature_id: F4.1
  feature_name: 5フェーズ共感AIチャット
  layers: [E]
  current_layer: E
  writeout_paths:
    E: docs/requirements/cocosil/evals/F4-1_5phase-chat_evals.md
context_sources:
  - docs/output/requirements/cocosil_v2_system_requirements.md
  - docs/output/requirements/cocosil_v2_detailed_requirements_specification.md §4.4
  - AGENTS.md §0 (設計中枢5問) / §7 (Gate 1/2)
  - lib/constitution/ (禁止語彙・UXシーケンス・Mutables)
---

# Grill Session: cocosil / F4.1 5フェーズ共感AIチャット / E層

---

## State

- turns: 9
- progress_stalled_turns: 0
- last_saved: 2026-05-17T09:00:00Z
- next_action: "次層選択（S層 grill / commit / stop）"
- mode: NEW
- web_gate_suppressed_layers: []
- web_gate_refusal_count: {}

---

## Layer Progress

- E: { answered: 8/8, ready_to_writeout: true, writeout_done: true, items: [F4.1] }

---

## Open Questions

<!-- すべて回答済み -->
（なし）

---

## QA Log

### E-1: ユビキタス要件（Ubiquitous）
- Q: F4.1 が常に満たすべき要件は何か（条件なし、常時成立）
- recommended: 5項目（U-1〜U-4 + GEARS-U-1）を初期提示。漏れがち観点4つを議論で追加検討
- answer: 9項目を採用（議論結果反映: `docs/discussions/議論ログ_F4-1-E1ユビキタス要件4観点.md`）
  ```ears
  EARS-U-1: The system shall return the first response (Phase 1 streaming start)
            within 3 seconds of the user submitting a message.
  EARS-U-2: The system shall not include any banned vocabulary
            (defined in `lib/constitution/banned-words.ts`) in any AI-generated response.
  EARS-U-3: The system shall persist the current ChatPhase in `chat_sessions.phase`
            on every Phase transition and never expose phase state to the client.
  EARS-U-4: The system shall inject all four diagnostic systems
            (MBTI / zodiac / animal-60 / six-star) plus the past-conversation summary
            into the system prompt on every turn.
  GEARS-U-1: The system shall not generate responses that amplify the three poisons
             (greed / anger / delusion) as defined in `lib/constitution/immutables.ts`,
             measured by a constitution-violation eval.
  EARS-U-5: The system shall enforce row-level security on chat_sessions, chat_messages,
            and breakthrough_markers such that every CRUD operation returns only rows
            where user_id = auth.uid().
  EARS-U-6: The system shall append one analytics_events record
            (event_type ∈ {chat_started, phase_transition, chat_ended})
            on every Phase transition and on session lifecycle events,
            within 500ms of the triggering event.
  EARS-U-7: The system shall reject any single OpenAI completion request
            exceeding 4,000 input tokens or 1,200 output tokens, and shall reject any user
            whose monthly cumulative token usage exceeds the limit defined by their billing plan.
  EARS-U-8: The system shall pass axe-core scans at WCAG 2.2 AA level
            for all chat-related screens (chat input, message list, phase indicator, action card).
  ```
- label: [U] / [I: discussion-log:議論ログ_F4-1-E1ユビキタス要件4観点.md]
- at: 2026-05-17T01:00:00Z

### E-2: イベント駆動要件（Event-driven）
- Q: 特定イベント時の応答要件は何か（`When [イベント], the system shall [応答].`）
- recommended: §4.4 業務フローから8候補抽出 → 重複/管轄外を除いた6件
- answer: 6項目を採用
  ```ears
  EARS-E-1 (Phase 遷移): When the AI determines a Phase transition based on conversation context,
            the system shall update chat_sessions.phase atomically and emit analytics_events
            with event_type='phase_transition' within 500ms.
  EARS-E-2 (しっくりきたマーカー表示): When a Phase 4 (Insight) response is generated,
            the system shall render the breakthrough_marker UI affordance inline,
            allowing single-tap save.
  EARS-E-3 (アクション記録への追加): When a Phase 5 (Action Proposal) response is generated,
            the system shall display a "Record this" button that creates an action record
            via F5 API within 1 second of tap.
  EARS-E-4 (セッション終了): When a chat session ends (explicit close or 30-min inactivity timeout),
            the system shall persist unsaved messages and emit analytics_events
            with event_type='chat_ended' within 1 second.
  EARS-E-5 (月次上限到達): When a free-plan user's monthly chat count reaches 5,
            the system shall block new chat session creation and display the upgrade-path message
            in compliance with `lib/constitution/banned-words.ts`.
  EARS-E-6 (再訪セッション): When a returning user starts a new chat session,
            the system shall inject summary of up to 3 most recent past sessions,
            action records (open + completed in last 7 days), and breakthrough markers
            into the system prompt before generating the first response.
  ```
- label: [I: §4.4 業務フロー] / [A]
- at: 2026-05-17T02:00:00Z

### E-3: 状態駆動要件（State-driven）
- Q: 特定状態が続いている間、維持すべき動作は何か（`While [状態], the system shall [継続動作].`）
- recommended: 6候補抽出 → 「残回数UI常時表示」は三毒増幅リスクで除外 → 5項目
- answer: 5項目を採用
  ```ears
  EARS-S-1 (セッション認可): While a chat session is active, the system shall validate the Clerk JWT
            via supabase.auth.getUser() on every API request to /api/chat/* and reject unverified requests.
  EARS-S-2 (ストリーミングUX): While an OpenAI response is streaming, the system shall display
            the current Phase indicator and an "Interrupt" affordance, accepting user interruption within 200ms.
  EARS-S-3 (Phase 4 しっくりきたマーカー): While ChatPhase is 4 (Insight), the system shall enable
            the breakthrough_marker save affordance on every AI message without additional navigation.
  EARS-S-4 (Phase 5 アクション記録): While ChatPhase is 5 (Action Proposal), the system shall enable
            the action-record save affordance on every AI message and pre-fill from the AI's proposal.
  EARS-S-5 (UXシーケンス順序): While a chat session is in progress, the system shall enforce
            monotonic Phase progression (1→2→3→4→5) and reject any server-side phase regression,
            in compliance with `lib/constitution/ux-sequence.ts`.
  ```
- 除外メモ: 「残回数UIの常時表示」は設計中枢 Q2（三毒非増幅）と緊張するため E-3 から除外。Gate 2 議論案件として Notes へ
- label: [I: §4.4 + AGENTS.md §7] / [U: 除外判断]
- at: 2026-05-17T03:00:00Z

### E-4: オプション要件（Optional）
- Q: 特定の設定/条件が有効なときだけ適用される要件はあるか（`Where [オプション], the system shall [動作].`）
- recommended: 7候補抽出 → V2スコープ外 (c, g) と別Feature管轄 (e) を除外 → 4項目
- answer: 4項目を採用。プレミアム特典は [X] 保留
  ```ears
  EARS-O-1 (有料プラン上限解除): Where the user's billing plan is Light, Standard, or Premium,
            the system shall not apply the monthly 5-chat limit defined in EARS-E-5
            and shall allow unlimited chat session creation.
  EARS-O-2 (RAG コンテキスト深度): Where the user's billing plan is Standard or higher,
            the system shall inject summary of up to 10 most recent past sessions
            into the system prompt (overriding the default of 3 from EARS-E-6).
  EARS-O-3 (MBTI 未診断フォールバック): Where the user's MBTI diagnosis status is 'unset',
            the system shall omit the MBTI section from the system prompt
            and shall operate with zodiac / animal-60 / six-star without degrading functionality.
  EARS-O-4 (Autogenesis A/B): Where prompt_versions.status = 'draft' is enabled for the user's bucket,
            the system shall route the chat through the draft prompt and emit analytics_events
            with event_type='ab_test_exposure' referencing prompt_version_id and bucket_id.
  ```
- 保留メモ: プレミアム特典（¥3,000-5,000）は §2.5 で「内容検討中」のため EARS-O-X は書けず [X]
- label: [I: §2.5 + §4.4 + AGENTS.md §8] / [A]
- at: 2026-05-17T04:00:00Z

### E-5: エラー/異常要件（Unwanted behavior）
- Q: 異常・エラー条件が発生したとき、システムはどう振る舞うべきか
- recommended: 既存§4.4 例外系 + AGENTS.md §6/§7/§8 から9候補抽出 → 重複/別問カバー (c) を除外 → 7項目
- answer: 7項目を採用
  ```ears
  EARS-If-1 (OpenAI API エラー): retry once after 2s, fallback message, analytics_events 'ai_api_error'.
  EARS-If-2 (Streaming 接続断): persist partial response with truncation flag, "再送しますか？" affordance.
  EARS-If-3 (Phase 遷移判定失敗): maintain current Phase without regression, log 'phase_parse_failure'.
  EARS-If-4 (禁止語彙検知): block + regenerate (max 2) + fallback empathy phrase, log 'constitution_violation' (banned_word).
  EARS-If-5 (三毒違反検知 GEARS): block + regenerate (max 2) + fallback, log 'constitution_violation' (three_poisons).
  EARS-If-6 (JWT 失効・改ざん): reject HTTP 401, terminate stream, return E_AUTH_EXPIRED/E_AUTH_INVALID without internal details.
  EARS-If-7 (Supabase 書き込み失敗): "保存に失敗しました" affordance, preserve draft in browser session storage, log 'persistence_failure'.
  ```
- label: [I: §4.4 + AGENTS.md §6/§7/§8] / [A]
- at: 2026-05-17T05:00:00Z

### E-6: AI出力の評価方法
- Q: 5フェーズ各々の「正しさ」をどう評価するか
- recommended: 5フェーズ × 4評価軸の評価行列 (A: 禁止語彙 / B: 設計中枢Must / C: フェーズ固有役割 / D: 人間評価)
- answer: 4 GEARS-Eval を採用（Web 検索はスキップ）
  ```ears
  GEARS-Eval-1 (禁止語彙): 検出率 100% / exact string match against `lib/constitution/banned-words.ts`.
  GEARS-Eval-2 (設計中枢Must違反): violation rate 0% / LLM-as-judge (claude-haiku-4-5)
                                  + rubric `lib/eval/rubrics/constitution-must.md`.
  GEARS-Eval-3 (フェーズ固有役割): phase-role fulfillment ≥ 0.80
                                  / LLM-as-judge + `lib/eval/rubrics/phase-{1..5}.md`.
  GEARS-Eval-4 (人間評価ゲート): えんまさ ≥4.0/5.0 / sample 20 sessions / pre-deployment gate
                                / recorded in `prompt_versions.human_eval_score`.
  ```
- 評価データセット暫定構成: ペルソナA/B想定シナリオ30件 / プロダクション匿名化版（蓄積） / 三毒誘発エッジケース20件 → E-8 で詰める
- label: [I: AGENTS.md §7 + 設計中枢5問 + promptfoo 言及] / [A]
- at: 2026-05-17T06:00:00Z

### E-7: Hallucination許容閾値
- Q: AI が事実と異なる情報を生成することをどこまで許容するか
- recommended: 種別別に閾値を分離（診断データ参照 / 4体系性質 / 過去会話 / 共感的解釈 / 一般知識）
- answer: 5 GEARS-Hallucination 採用 + 設計三原則
  ```ears
  GEARS-Hallucination-1 (診断データ参照): 0% error / parse AI response, assert against `diagnoses` record.
  GEARS-Hallucination-2 (4体系性質): ≤ 2% deviation / LLM-as-judge against `lib/data/{mbti,zodiac,animal,six-star}.ts`.
  GEARS-Hallucination-3 (過去会話の捏造): 0% fabrication / string-level provenance against RAG context.
  GEARS-Hallucination-4 (共感的解釈の安全弁): ≥ 95% hedging on unstated-state refs (Phase 3-4 のみ)
                                              / rubric `lib/eval/rubrics/empathic-hedging.md`.
  GEARS-Hallucination-5 (一般知識の誤り): 0% out-of-scope factual claims in Phase 2-5.
  ```
- 設計三原則: ① Verifiable from the User's Record / ② Knowledge Grounded, Hedge When Beyond / ③ No Out-of-Scope Facts
- 重要な緊張: GEARS-Hallucination-4 は Phase 4「腑落ち体験」の本質（ユーザー未言及の内的状態仮説提示）と機能的緊張があるため、hedging marker 経由で両立させる設計
- label: [I: §4.4「根拠のある共感」+ 設計中枢 Q1] / [A]
- at: 2026-05-17T07:00:00Z

### E-8: 評価データセット
- Q: 全 eval を検証するためのデータセット構築方針
- recommended: 6カテゴリ 120件 MVP 必須 + 継続蓄積 + Autogenesis 連動 + 人間評価ローテーション
- answer: 4 GEARS-Dataset 採用
  ```ears
  GEARS-Dataset-1 (MVP 必須): baseline ≥ 120 cases across 6 categories
                              (persona-driven / three-poisons-adversarial / diagnostic-fact-check /
                               past-conversation-fabrication / banned-vocab-adversarial / a11y-scenarios)
                              under `lib/eval/datasets/`, git-versioned, before any production deployment.
  GEARS-Dataset-2 (継続蓄積): production-anonymized traces opt-in via F8 consent,
                              target ≥ 100 cases/month, stored under `lib/eval/datasets/production-anonymized/YYYY-MM/`.
  GEARS-Dataset-3 (Autogenesis sandbox): prompt mutation candidates evaluated against D1-D4, D6 (120 min)
                                         + last 30 days of D5, require +5% self-understanding-deepening
                                         AND anti-sycophancy pass before えんまさ approval.
  GEARS-Dataset-4 (Human Eval): sample 20 anonymized sessions/week from D5 → えんまさ review,
                                 scores in `lib/eval/human-review/YYYY-WW/scores.jsonl`,
                                 block prompt activation if rolling 4-week average < 3.8/5.0.
  ```
- MVP リリース前チェックリスト: D1(30) / D2(20) / D3(20) / D6(30) / D7(5) + promptfoo CI 統合
- label: [I: AGENTS.md §7 テスト分類学 + ペルソナA/B + promptfoo] / [A]
- at: 2026-05-17T08:00:00Z

---

## Decisions (Resolved)

- **D1**: F4.1 E-1 ユビキタス要件は 9項目で確定（標準5 + 議論追加4）。優先度: U-5/U-6/U-7 = 🔴P0, U-8 = 🟡P1（chat画面のみWCAG 2.2 AA, Phase別段階拡張）
  - sources: [E-1, 議論ログ_F4-1-E1ユビキタス要件4観点]
- **D2 (設計原則3箇条)**: ① Promise What You Verify, Verify What You Promise / ② Implementation-Coupled by Design (for Small Teams) / ③ Always-on Promises Travel with the Feature
  - sources: [議論ログ_F4-1-E1ユビキタス要件4観点 Turn 5]

---

## Conflicts

<!-- 矛盾を検知したときに記録 -->

---

## Writeouts

- **E layer (F4.1)** → `docs/requirements/cocosil/evals/F4-1_5phase-chat_evals.md` (written at 2026-05-17T09:00:00Z)
  - 44 EARS要件（U:9 / E:6 / S:5 / O:4 / If:7 / GEARS-Eval:4 / GEARS-Hallucination:5 / GEARS-Dataset:4）
  - 6 設計原則
  - 8 データセット定義 (D1〜D8)
  - 検証マトリクス（PR Gate 連動）
  - 未決事項 5件 (Notes)
  - approval source: ユーザー「y」at WriteoutGate Stage 3

---

## Web Searches

<!-- grill 中に実行した Web 検索のログ -->

---

## Notes

### Gate 2 議論案件（未決）

- **残回数 UI の常時表示**: 「あと1回」表示が三毒（貪/瞋）を増幅する可能性。Phase 5 行動提案時のみ控えめに出す等、表現設計を Gate 2 で議論する必要
- **プレミアムプラン特典の内容**: §2.5 で「内容検討中」。F4.1 への影響範囲（例: 専門家1on1セッション枠、独自プロンプト指定権 等）が確定したら EARS-O-X 追加

### 既存要件定義書 F4.1 の現状（context）

- **対応技術**: Vercel AI SDK (`ai`) + OpenAI Chat Completions API + `streamText()` + Edge Runtime（2026-05-05 確定）
- **フェーズ永続化**: Supabase `chat_sessions.phase` に保存（クライアント保持禁止）
- **5フェーズ**: 傾聴 → 共感 → 深掘り → 洞察 → 行動提案
- **コンテキスト注入**: 4体系診断データ（MBTI/星座/動物60アニマル/六星）+ 過去会話要約をシステムプロンプトに注入
- **NFR**: 初回応答3秒以内（§6 で宣言）
- **既存テスト（AGENTS.md §7）**: 禁止語彙（「占い」「霊感」）と共感キーワードの含有チェックのみ

### Eval 設計の上位制約

1. **設計中枢5問のリトマス試験紙**（Q1〜Q5）を eval として運用可能にする
2. **三毒非増幅**（貪・瞋・痴）— Autogenesis Constitution の絶対不変ガード
3. **UXシーケンス順序**（共感→安心→分析→行動）— `lib/constitution/ux-sequence.ts` と整合
4. **言語設計**（禁止語彙）— `lib/constitution/banned-words.ts` と整合

