# COCOSiL Claude Code プラグイン最適構成
**設定コマンドシート v1.0（2026年5月）**

> 議論から導いた選定原則：
> ① Domain-First — マーケットプレイスにない固有ナレッジは自前SKILL.mdで担う
> ② MCP Minimum — supabase 1個のみ。CLIで代替できるMCPは入れない
> ③ Workflow Clarity — feature-devとsuperpowersの使い分けルールを明文化

---

## 📦 外部プラグイン（7個）— インストールコマンド

```bash
# ━━ Phase 1: Day 1 必須（4個）━━

# 1. 機能開発の主幹ワークフロー（7フェーズ構造化・ドメイン複雑機能向け）
claude plugin install feature-dev

# 2. TDD強化・計画・デバッグ能力向上（バックエンドTDD向け）
claude plugin install superpowers

# 3. ファイル編集時のセキュリティ自動警告（Hookとして動作）
claude plugin install security-guidance

# 4. コミット・プッシュ・PR作成の自動化
claude plugin install commit-commands

# ━━ Phase 2: Week 1 推奨（3個）━━

# 5. AIっぽくない個性的なフロントエンドUI生成（まあみ専用・スキルとして動作）
claude plugin install frontend-design

# 6. 4エージェント並列コードレビュー（PRマージ前に使用）
claude plugin install code-review

# 7. Supabase DB操作・スキーマ管理（MCPサーバー・ヒラメ中心）
claude plugin install supabase
```

---

## 🚫 意図的に見送ったプラグイン

```bash
# 以下は「便利そう」だが COCOSiL には入れない

# vercel MCP → GitHub Actions + `vercel` CLI で代替可能
# claude plugin install vercel  ← 入れない

# github MCP → `gh` CLI で代替可能。MCPトークンコストが高い
# claude plugin install github  ← 入れない

# codex (OpenAI) → 2人チームにはセカンドオピニオンの需要が薄い
# claude plugin install codex@openai-codex  ← 入れない

# coderabbit → code-review と役割が重複する
# claude plugin install coderabbit  ← 入れない

# playwright → E2E テスト基盤が整った Month 1 以降に再検討
# claude plugin install playwright  ← 月1以降に検討

# context7 → 効果は高いが、今は CLAUDE.md の @import で代替。Month 1に再評価
# claude plugin install context7  ← 月1以降に検討
```

---

## 🔧 自前 SKILL.md（6個）— マーケットプレイスで絶対に代替できないもの

これらは `claude plugin install` では手に入らない。えんまさ・ヒラメが自作する。

```
.claude/skills/
├── cocosil-mbti/          # 担当: えんまさ（Day 1）
│   ├── SKILL.md           # MBTI×体癖 128アーキタイプ規約
│   └── reference/         # mbti-types.md / taiheki.md / scoring.md
│
├── empathetic-chat/       # 担当: えんまさ（Day 1）
│   ├── SKILL.md           # 共感チャット3フェーズ＋安全設計
│   └── reference/         # tone-templates.md / safety.md
│
├── language-design/       # 担当: えんまさ（Day 1）← 言語設計文書v1.0を変換
│   └── SKILL.md           # 「占い」禁止語彙・代替表現テーブル
│
├── supabase-rls/          # 担当: ヒラメ（Week 1）
│   └── SKILL.md           # RLS設計パターン・新テーブル追加手順
│
├── clerk-auth/            # 担当: ヒラメ（Week 1）
│   └── SKILL.md           # Server/Client認証パターン・禁止事項
│
└── openai-streaming/      # 担当: ヒラメ（Week 1）
    └── SKILL.md           # SSEストリーミング・AbortController・PII保護
```

---

## 🗺️ ワークフロー使い分けルール（チーム合意文書）

> このルールを `docs/claude-workflow.md` に保存し、全員が参照すること。

```markdown
## Claude Code ワークフロー使い分けルール

### ドメイン知識が絡む複雑な機能追加
→ /feature-dev:feature-dev <機能名>

使う場面の判断基準:
- 共感チャットのフェーズ設計を変える
- MBTI型コード・体癖の計算ロジックを変える
- 新しいアーキタイプカテゴリを追加する
- 言語設計ルールに影響するUIコピーを書く

7フェーズ（Discovery→Exploration→Questions→Design→Implementation→Review→Summary）
を必ず踏む。フェーズ3でえんまさへの確認を行うこと。

---

### 型が明確なバックエンドAPI・ユーティリティの実装
→ /superpowers:write-plan <タスク名>

使う場面の判断基準:
- Route Handler の新規追加
- Supabase クエリ関数の実装
- Zodスキーマ定義
- 純粋関数（診断スコア計算等）

TDD必須: 失敗テストを先に書き、pnpm vitest run でfailを確認してから実装開始。

---

### コミット・PR作成（常にこれを使う）
→ /commit-commands:commit          # ステージング済み変更をコミット
→ /commit-commands:commit-push-pr  # コミット→プッシュ→PR作成を一括

---

### PRマージ前のコードレビュー
→ /code-review:code-review

信頼度スコア80以上の指摘のみ表示。GitHubのPRに自動コメント投稿。
マージ直前に1回実行することを推奨。
```

---

## 📊 プラグイン選定の全体マップ

```
                    【COCOSiL プラグイン構成図】

外部プラグイン（7個）
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ワークフロー層                                      │
│  ├── feature-dev    （ドメイン複雑機能・7フェーズ）  │
│  └── superpowers    （TDD実装・計画・デバッグ）      │
│                                                     │
│  品質ゲート層                                        │
│  ├── security-guidance  （Hookフック・常時監視）     │
│  └── code-review        （PR時・4エージェント並列）  │
│                                                     │
│  git自動化層                                         │
│  └── commit-commands    （コミット・PR作成）         │
│                                                     │
│  UI設計層                                           │
│  └── frontend-design    （まあみ専用・スキル）       │
│                                                     │
│  インフラ層（MCP 最小化）                            │
│  └── supabase MCP       （DB操作・ヒラメ中心）      │
│                                                     │
└─────────────────────────────────────────────────────┘

自前 SKILL.md（6個）← マーケットプレイスに存在しないもの
┌─────────────────────────────────────────────────────┐
│                                                     │
│  えんまさ担当（Day 1）                               │
│  ├── cocosil-mbti      （128アーキタイプ規約）       │
│  ├── empathetic-chat   （共感設計＋安全ガード）      │
│  └── language-design   （「占い」禁止語彙ルール）    │
│                                                     │
│  ヒラメ担当（Week 1）                                │
│  ├── supabase-rls      （RLS設計パターン）           │
│  ├── clerk-auth        （認証実装パターン）          │
│  └── openai-streaming  （SSE＋PII保護）             │
│                                                     │
└─────────────────────────────────────────────────────┘

CLIで代替するもの（MCPなし）
  supabase CLI  → migration / db diff / db lint
  vercel CLI    → deploy / logs
  gh CLI        → pr create / pr list / issue
```

---

## 📅 導入ロードマップ

| フェーズ | 期間 | 作業内容 | 担当 |
|---|---|---|---|
| Phase 1 | Day 1（30分） | 外部プラグイン4個インストール | 全員 |
| Phase 1 | Day 1（1時間） | `cocosil-mbti` SKILL.md 作成 | えんまさ |
| Phase 1 | Day 1（30分） | 言語設計文書v1.0 → `language-design` SKILL.md 変換 | えんまさ |
| Phase 1 | Day 1（1時間） | `empathetic-chat` SKILL.md 作成 | えんまさ |
| Phase 2 | Week 1（2時間） | 外部プラグイン3個追加（frontend-design/code-review/supabase） | 全員 |
| Phase 2 | Week 1（3時間） | `supabase-rls` / `clerk-auth` / `openai-streaming` SKILL.md 作成 | ヒラメ |
| Phase 2 | Week 1（30分） | ワークフロー使い分けルールを `docs/claude-workflow.md` に保存 | えんまさ |
| Phase 3 | Month 1 | context7 / playwright の採用可否を再評価 | 全員 |

---

## ⚡ インストール一発スクリプト（Phase 1 + 2 まとめて）

```bash
#!/bin/bash
# COCOSiL Claude Code プラグイン セットアップ
# プロジェクトルートで実行する

echo "=== COCOSiL Plugin Setup ==="

# Phase 1: Day 1 必須
echo "[1/7] feature-dev..."
claude plugin install feature-dev

echo "[2/7] superpowers..."
claude plugin install superpowers

echo "[3/7] security-guidance..."
claude plugin install security-guidance

echo "[4/7] commit-commands..."
claude plugin install commit-commands

# Phase 2: Week 1
echo "[5/7] frontend-design..."
claude plugin install frontend-design

echo "[6/7] code-review..."
claude plugin install code-review

echo "[7/7] supabase (MCP)..."
claude plugin install supabase

echo ""
echo "✅ 外部プラグイン 7個 インストール完了"
echo ""
echo "📝 次のステップ（自前SKILL.md作成）:"
echo "  1. .claude/skills/cocosil-mbti/SKILL.md    (えんまさ)"
echo "  2. .claude/skills/empathetic-chat/SKILL.md (えんまさ)"
echo "  3. .claude/skills/language-design/SKILL.md (えんまさ・言語設計文書v1.0から変換)"
echo "  4. .claude/skills/supabase-rls/SKILL.md    (ヒラメ)"
echo "  5. .claude/skills/clerk-auth/SKILL.md      (ヒラメ)"
echo "  6. .claude/skills/openai-streaming/SKILL.md(ヒラメ)"
echo ""
echo "📖 ワークフロー使い分けルールを docs/claude-workflow.md に保存してください"

# インストール確認
echo ""
echo "=== インストール済みプラグイン確認 ==="
claude plugin list
```

---

## 💡 `language-design` SKILL.md 自動生成プロンプト

えんまさ向け：既存の `COCOSiL_言語設計文書_v1.0.md` から SKILL.md を一発生成するプロンプト。

```
以下のタスクを実行してください。

1. `COCOSiL_言語設計文書_v1.0.md` を Read して全内容を把握する

2. `.claude/skills/language-design/SKILL.md` を以下の構造で新規作成する：

---
name: language-design
description: |
  UIコピー・AIプロンプト・エラーメッセージ・SNSシェアカード・LP告知文を書くとき、
  または「占い」「鑑定」「運勢」「占い師」「当たる」「霊感」「霊視」という言葉を
  使いそうになったとき、必ず読み込む。COCOSiLの言語設計ルールが記述されている。
allowed-tools: Read
---

# COCOSiL 言語設計ルール

## 禁止ワード → 代替表現テーブル
（言語設計文書の Section 1 の表をそのまま転記）

## 目指すトーン
（言語設計文書の Section 2 の「目指すトーン」をそのまま転記）

## 画面別コピーライティング例
（言語設計文書の Section 3 の表をそのまま転記）

## AIプロンプトへの適用
（言語設計文書の Section 4 をそのまま転記）

---

3. 作成後、ファイルを Read して内容を確認する
4. `pnpm dlx js-yaml .claude/skills/language-design/SKILL.md` で構文チェックする
```
