# docs/ ドキュメント配置ガイド

> AIへの入力・AIの出力・プロセス記録を明示的に分離する。
> 人間（えんまさ・まあみ・ヒラメ）とAIエージェント（Claude Code）の両方が読むことを前提に書いている。

## どこに置くか — 2問で決める

| 問い | 配置先 |
|---|---|
| 人間がAIに渡す素材・インプット | `input/` |
| AI（またはAI支援）で生成した成果物 | `output/` |
| 議論・意思決定の記録 | `discussions/` |
| AIハーネス設定・健全度管理 | `harness/` |

## ディレクトリ構造

```
docs/
├── input/                ← 人間→AIへの入力素材（AIセッションで参照OK）
│   ├── concepts/         ← ビジネス・UXコンセプト資料
│   ├── requirements_input/ ← 要件定義のインプット素材
│   ├── setup/            ← セットアップ・設定ドキュメント
│   └── skills_ref/       ← 参照専用スキルリファレンス（直接AIに渡さない）
├── output/               ← AI生成・またはAI支援で生成した成果物
│   ├── F1/               ← F1機能の成果物
│   ├── goals/            ← /goal-grill の書き出し先
│   └── requirements/     ← /requirements-doc-creator の書き出し先
├── discussions/          ← 議論ログ・意思決定の記録
└── harness/              ← AIハーネス管理（DECISIONS・HEALTH）
```

## 配置ルール

### `input/`

- AIセッション開始時に「読んでおいてほしい」素材を置く
- 人間が書いたコンセプト・仕様・設定の原稿

### `output/`

- AIスキル（`/goal-grill`・`/requirements-doc-creator` など）の書き出し先
- AIと人間が協力して完成させた正式ドキュメント
- ⚠️ 議論ログは output/ には置かない → `discussions/` へ

### `discussions/`

- `/expert-misaki-discussion` の議論ログ
- 意思決定の過程を記録したメモ
- inputでもoutputでもない「プロセスの記録」

### `harness/`

- `HARNESS_DECISIONS.md` — ハーネス設計判断の記録
- `HARNESS_HEALTH.md` — GapとインシデントのOpen/Resolved管理
- inputでもoutputでもない「AIの動作仕様書」。変更は人間が判断する
