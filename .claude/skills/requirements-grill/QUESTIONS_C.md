# QUESTIONS_C.md — Capability 層 定型問い

## この層の目的

「このシステムが何をできるか」を**実装非依存の能力の単位**で列挙・定義する。  
ここを厚くすることで、Feature や EngSpec が変わっても Capability は安定する。  
「どう実装するか」「どのUIか」は一切書かない。

## 完了条件（Exit Criteria）

各 Capability が独立した 1 ファイル（`CAP-NNN_<slug>.md`）として書き出せる状態であること。  
最低 3 つの Capability が定義されていること。

## このあと進む層

Capabilities 完了 → Features（F）  
（Capability ごとに Eval を書きたい場合は Evals（E）に先行してもよい）

## 書き出し先

`docs/requirements/<product>/capabilities/CAP-NNN_<slug>.md`  
テンプレート: `docs/requirements/_template/capability_template.md`

---

## 定型問い一覧

### C-1: できること動詞列挙

**問い**: このプロダクトが「できるべきこと」を動詞で列挙してください。  
（ユーザーではなくシステムの能力として。「〇〇できる」という形式）

**推奨回答の探し方**:
1. `docs/products/<product>/` の solution.md / architecture.md を確認
2. なければ `PROMPT_RECIPES.md` の能力動詞語彙 30 個から候補を提示

**escape hatch**: 多すぎる場合（10 以上）→ 「最初のフェーズで必須なものを 3〜5 に絞ってください」

---

### C-2: Base model vs Uplift

**問い**: それぞれの capability は base-model（追加学習なし）で十分ですか？  
または fine-tuning / tool-use / RAG 等のuplift が必要ですか？

**推奨回答ガイド**:
- 「要約する」「分類する」「検索する」→ 多くは base-model で可能
- 「ドメイン固有の判断をする」「特定フォーマットで出力する」→ uplift が必要な場合が多い

**Web Search Trigger**: モデルの能力は急速に向上しており「base-model で十分か」の判断が変わりうる
- 発動タイミング: 特定の capability について「uplift が必要」と推奨しようとした時
- クエリ例: `"Claude latest model capabilities <task type> 2026"` / `"RAG vs fine-tuning when to use 2026"`
- ツール: `WebSearch` → 現在の base-model 能力範囲・最新ベンチマークを確認
- スキップ条件: ユーザーが既に「RAG を使う」「fine-tuning は不要」等を明示している

**escape hatch**: 「わからない」→ [X] 保留。Eval 後に判断する候補として記録

---

### C-3: 依存前提（データ / 外部 API / 人間の判断）

**問い**: 各 capability が機能するために必要な前提条件は何ですか？  
（データ・外部API・人間のインプット等）

**推奨フォーマット**: 「〔capability名〕: 〔前提条件〕が必要」を列挙

**escape hatch**: 「特にない」→ [A] で「内部データのみ、外部依存なし」と記録

---

### C-4: 安定性（Stability）

**問い**: 各 capability の安定性（stable / evolving / volatile）はどれですか？  
AIの進化や市場変化でどれくらい変わりそうかの予測です。

**推奨判定基準**:
- stable: ビジネスロジックに近い（例: 会議の論点を整理する）
- evolving: モデル改善で変わる可能性（例: 発話から感情を読む）
- volatile: API/モデルに強く依存（例: リアルタイム音声処理）

**escape hatch**: 「すべて evolving」→ 粒度を変えるか、安定した部分を分離してみる

---

### C-5: Graceful Degradation

**問い**: 各 capability が失敗したとき、プロダクトはどう振る舞うべきですか？

**推奨回答例**:
- 「〇〇 capability が失敗したときは、△△機能に降格して提供する」
- 「失敗した旨を表示し、ユーザーが手動で行えるようにする」
- 「キャッシュ値で代替する」

**Web Search Trigger**: 業界のグレースフルデグラデーションパターンが参考になる場合
- 発動タイミング: 「失敗を想定していない」とユーザーが言った時、または推奨例が出せない時
- クエリ例: `"AI product graceful degradation patterns 2026"` / `"LLM fallback strategy production 2026"`
- ツール: `WebSearch` → 本番 AI システムでの縮退事例・パターンを確認
- スキップ条件: ユーザーが既に具体的な縮退動作を説明している

**escape hatch**: 「失敗を想定していない」→ 「AIは必ず失敗します。その場合ユーザーに何を見せますか？」

---

### C-6: 独立進化できるか

**問い**: どの capability が他の capability と独立して進化できますか？  
（依存関係の強い組み合わせはありますか？）

**推奨回答の探し方**:
1. C-1 で列挙した capability 間の依存グラフを簡単に描く
2. 「A が動かないと B が動かない」という関係を明記する

**escape hatch**: 「全部依存している」→ 「最も小さな独立した単位は何ですか？」と問い直す

---

### C-7: 複数プロダクト間での共通化

**問い**: この capability が他のプロダクト（AGENTS.md のプロダクト一覧参照）でも使えそうなものはありますか？

**推奨回答**: 共通化できるものがあれば `theme.*` 等の横断テーマドキュメントへのリンク候補に

**escape hatch**: 「わからない」→ [X] 保留。後で 30_themes に追記する候補として記録

---

### C-8: Outcome との紐付け

**問い**: 各 capability は、先ほど定義した Outcomes のどれにどう貢献しますか？

**推奨フォーマット**:
```
〔capability名〕 → 〔Outcome指標名〕に〔どう貢献するか〕
例: 「会議前要点整理 → 会議後アクション率の向上に貢献」
```

**escape hatch**: 紐付かない capability がある場合 → 「これはどの成功指標に影響しますか？影響しない場合、今回のスコープに含める必要はありますか？」

---

## Escape Hatch 共通ルール（C 層）

- Feature の話が出る → 「それは F 層の話です。Capability は実装非依存に保ちましょう」
- Engineering の話が出る → 「実装は S 層で。Capability では『何ができるか』だけを言いましょう」
- 粒度が大きすぎる（「全てを管理する」等）→ 「もう少し小さな動詞に分割してください」
