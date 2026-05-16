# QUESTIONS_E.md — Eval 層 定型問い

## この層の目的

Capability / Feature の受け入れ基準を **EARS 記法** で形式化し、  
AI プロダクト固有の eval 仕様（hallucination 閾値・評価データセット等）を定義する。  
エンジニアや AI エージェントが「合格/不合格」を自動判定できる粒度にする。

## 完了条件（Exit Criteria）

ユビキタス要件 (U) が最低 1 つ、When/While/If の各パターンが最低 1 つ書けること。  
AI eval 方法が「測定可能な形」で定義されていること。

## このあと進む層

Evals 完了 → Engineering Spec（S）

## 書き出し先

`docs/requirements/<product>/evals/<CAP|FEAT>-NNN_evals.md`  
テンプレート: `docs/requirements/_template/eval_template.md`  
EARS 記法の詳細: `EARS_GUIDE.md`

---

## 定型問い一覧

### E-1: ユビキタス要件（Ubiquitous）

**問い**: この Capability / Feature が**常に**満たすべき要件は何ですか？（条件なし、常時成立）

**推奨フォーマット**: `The system shall [動作].`  
例: `The system shall respond within 3 seconds.`  
例: `The system shall log all user interactions.`

**escape hatch**: 「特にない」→ セキュリティ / パフォーマンス / アクセシビリティのいずれかは必ずある。「レスポンス時間の上限はありますか？」と問う

---

### E-2: イベント駆動要件（Event-driven）

**問い**: 特定のイベント（ユーザー操作・システムイベント等）が起きたとき、  
このシステムはどう反応すべきですか？

**推奨フォーマット**: `When [イベント], the system shall [応答].`  
例: `When a user submits a meeting transcript, the system shall extract key decisions within 10 seconds.`

**escape hatch**: 「わからない」→ 「F-2（トリガー）で言っていた『〇〇したとき』を EARS 形式に変換してみましょう」

---

### E-3: 状態駆動要件（State-driven）

**問い**: 特定の状態が続いている間、このシステムが維持すべき動作は何ですか？

**推奨フォーマット**: `While [状態], the system shall [継続動作].`  
例: `While a session is active, the system shall validate the auth token on each request.`

**escape hatch**: 「思いつかない」→ 「ユーザーが使っている間ずっと保証したいことはありますか？（例: セッション維持、データ保存）」

---

### E-4: オプション要件（Optional）

**問い**: 特定の設定や条件が有効なときだけ適用される要件はありますか？

**推奨フォーマット**: `Where [オプション/設定], the system shall [動作].`  
例: `Where the admin mode is enabled, the system shall display audit logs.`

**escape hatch**: 「ない」→ [A] で「オプション要件なし」と記録してスキップ可

---

### E-5: エラー / 異常要件（Unwanted behavior）

**問い**: 異常・エラー条件が発生したとき、システムはどう振る舞うべきですか？

**推奨フォーマット**: `If [異常条件], the system shall [エラー処理 / graceful degradation].`  
例: `If the LLM API returns an error, the system shall display a fallback message and retry once.`

**escape hatch**: C-5（Graceful Degradation）の回答を EARS 形式に変換する提案をする

---

### E-6: AI 出力の評価方法

**問い**: AI の出力の「正しさ」をどう評価しますか？

**推奨選択肢（PROMPT_RECIPES.md 参照）**:
- exact match（完全一致）
- semantic similarity（意味的一致）
- rubric scoring（ルーブリック評価、人間が基準を作る）
- human eval（人間が最終判断）
- model self-eval（別モデルが審査）

**Web Search Trigger**: AI 評価手法は急速に進化しており業界標準が変わっている
- 発動タイミング: 評価方法の選択肢を提示する前
- クエリ例: `"LLM evaluation methodology best practices 2026"` / `"LLM as judge evaluation framework 2026"`
- ツール: `WebSearch` → 最新の評価フレームワーク（HELM, MT-Bench, LLM-as-Judge 等）の動向を確認
- スキップ条件: ユーザーが既に評価手法を決めている

**escape hatch**: 「わからない」→ 「リリース前に『これは合格』と言える具体的な出力例を 1 つ見せてください」

---

### E-7: Hallucination 許容閾値

**問い**: この機能では、AI が事実と異なる情報を生成することをどこまで許容しますか？

**推奨回答例**:
- 高精度が必要（医療・法律・金融・その他ハイリスクドメイン）→ 「0% を目標。検証できない情報は出力しない」
- 一般ビジネス → 「ユーザーが確認できる形で提示し、自動判断には使わない」

**Web Search Trigger**: ドメイン別・ユースケース別の許容閾値の業界事例が参考になる
- 発動タイミング: 推奨回答として閾値の数値を示す前
- クエリ例: `"LLM hallucination rate acceptable threshold enterprise 2026"` / `"AI hallucination rate benchmark industry standard <domain>"`
- ツール: `WebSearch` → 同ドメイン（医療/法律/ビジネス等）での実績値・業界標準を確認
- スキップ条件: ユーザーが「0% を目標にする」と既に方向性を述べている

**escape hatch**: 「わからない」→ 「もしこの AI が間違えたとき、最悪の影響は何ですか？」と問うてリスクから逆算

---

### E-8: 評価データセット

**問い**: この eval を検証するためのデータセットはどう用意しますか？

**推奨選択肢**:
- 固定プロンプトセット（開発時に手動作成）
- 既存ユーザーログ（過去データがある場合）
- 合成データ（モデルで生成）
- なし（最初は手動確認のみ）

**Web Search Trigger**: ドメイン別の公開 eval データセットが存在する場合がある
- 発動タイミング: 「合成データ」「手動確認のみ」を提示しようとした時
- クエリ例: `"open source LLM evaluation dataset <capability/domain> 2026"` / `"benchmark dataset <task type> Hugging Face 2026"`
- ツール: `WebSearch` → HuggingFace Hub 等で利用可能な公開データセットを確認
- スキップ条件: ユーザーが「自社データで行う」と既に決めている

**escape hatch**: 「データがない」→ [A] で「MVP では開発者による手動確認」と記録。Phase 2 以降でデータセット整備を Phase に追加

---

## Escape Hatch 共通ルール（E 層）

- 「テストは後で考える」→ 「今ここで書いておかないと、実装後の手戻りが大きくなります」と重要性を説明
- Engineering 実装の話になる → 「受け入れ基準は実装方法を問いません。どんな実装でも通るべき条件を書きましょう」
- EARS 記法がわからない → `EARS_GUIDE.md` を参照するよう案内
