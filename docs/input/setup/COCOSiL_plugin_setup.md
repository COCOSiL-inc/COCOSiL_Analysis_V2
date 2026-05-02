# COCOSiL Claude Code プラグイン最適構成
**設定コマンドシート v2.0（2026年5月）**

> 議論から導いた選定原則（v2.0 更新版）：
> ① Domain-First — マーケットプレイスにない固有ナレッジは自前SKILL.mdで担う
> ② MCP Minimum — 外部プラグインは最小限。既に接続済みのMCPはインストール不要
> ③ Workflow Clarity — JIT（Just-In-Time）追加。必要になったタイミングで入れる

---

## 📦 外部プラグイン（3+1 構成）

### Day 1 必須（1個）

```bash
# コミット・プッシュ・PR作成の自動化
claude plugin install commit-commands
```

### Week 2 以降（1個）

```bash
# 4エージェント並列コードレビュー（PRマージ前に使用）
claude plugin install code-review
```

---

## 🔌 接続済みMCP（プラグインインストール不要）

これらは Claude Code に**最初から接続されている**。`claude plugin install` は不要。

| MCP サーバー | 用途 | 確認コマンド |
|---|---|---|
| **context7** | Next.js 16 / React 19 など最新ライブラリのドキュメント参照 | `claude mcp list` |
| **Playwright** | E2E テスト・ブラウザ操作 | `claude mcp list` |
| **Supabase MCP** | DB 操作・スキーマ管理 | 要認証: `mcp__claude_ai_Supabase__authenticate` |

> **重要**: 旧バージョンのこのドキュメントに「context7 / playwright をスキップ」と記載があったが、誤り。
> 両MCPは環境に接続済みであり、プラグインとして別途インストールする必要はない。
> プロジェクトの CLAUDE.md にも `Use context7 for library/framework documentation` と明記されている。

---

## 🚫 意図的に見送ったプラグイン

| プラグイン | スキップ理由 |
|---|---|
| feature-dev | 2人チームには7フェーズ構造化は過剰。Claude Codeの組み込み機能で十分 |
| superpowers | トークンコストが高い多機能プラグイン。必要な機能はHooksとSKILLで個別実装 |
| security-guidance | `.claude/settings.json` の PreToolUse Hook で代替（秘密情報検出を実装済み） |
| frontend-design | Tailwind 4 + context7 で十分。UI実装フェーズに入ってから再評価 |
| vercel MCP | `vercel` CLI で代替可能 |
| github MCP | `gh` CLI で代替可能。MCPトークンコストが高い |
| codex | 2人チームにはセカンドオピニオン需要が薄い |
| coderabbit | code-review と役割が重複する |

---

## 🔧 自前 SKILL.md（JIT 追加方針）

**Day 1 作成済み（1個）:**

```
.claude/skills/
└── language-design/         ✅ 作成済み
    └── SKILL.md              # 「占い」禁止語彙・代替表現テーブル・ブランドトーン定義
```

**フィーチャー着手時に JIT 作成（5個）:**

```
.claude/skills/
├── cocosil-mbti/            # F1 着手時（えんまさ）
│   ├── SKILL.md             # MBTI×体癖 128アーキタイプ規約
│   └── reference/           # mbti-types.md / taiheki.md / scoring.md
│
├── empathetic-chat/         # F3 着手時（えんまさ）
│   ├── SKILL.md             # 共感チャット3フェーズ＋安全設計
│   └── reference/           # tone-templates.md / safety.md
│
├── supabase-rls/            # DB設計時（ヒラメ）
│   └── SKILL.md             # RLS設計パターン・新テーブル追加手順
│
├── clerk-auth/              # F4 着手時（ヒラメ）
│   └── SKILL.md             # Server/Client認証パターン・禁止事項
│
└── openai-streaming/        # F3 着手時（ヒラメ）
    └── SKILL.md             # SSEストリーミング・AbortController・PII保護
```

> **JIT Authoring 原則**: SKILLは「使う直前に書く」。先回りして一気に作ると、
> 実装時の学びが反映されずメンテ負債になる。

---

## ⚙️ Hooks 設計（段階的追加）

**Day 1 稼働中（1個）:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hook": "grep -qE '(sk-[a-zA-Z0-9]{20,}|eyJh[a-zA-Z0-9]{20,}|supabase_service_role|SUPABASE_SERVICE_ROLE)' \"$CLAUDE_FILE_PATH\" 2>/dev/null && echo 'BLOCK: Potential secret detected.' && exit 1 || exit 0"
      }
    ]
  }
}
```

**Week 2 以降に段階追加（2週間ごとに1つ）:**

```
PostToolUse   → 自動 lint / typecheck
SessionStart  → CLAUDE.md コンテキスト注入
Stop          → テスト実行強制
UserPromptSubmit → テンプレート展開
```

> **Hook地獄回避ルール**: 1つのHookを2週間運用して信頼を確立してから次を追加する。
> 一度に2つ以上のHookを追加しない。

---

## 📊 プラグイン構成図（v2.0）

```
                    【COCOSiL プラグイン構成 v2.0】

外部プラグイン（3+1 最小構成）
┌─────────────────────────────────────────────────────┐
│  git自動化層                                         │
│  └── commit-commands      （コミット・PR作成）[Day 1] │
│                                                     │
│  品質ゲート層                                        │
│  └── code-review          （PR時・4エージェント並列） │
│                            [Week 2 以降]            │
└─────────────────────────────────────────────────────┘

接続済みMCP（インストール不要）
┌─────────────────────────────────────────────────────┐
│  ├── context7     （最新ドキュメント参照）✓ 接続済み  │
│  ├── playwright   （E2Eテスト）✓ 接続済み            │
│  └── supabase MCP （DB操作）! 認証が必要             │
└─────────────────────────────────────────────────────┘

自前 SKILL.md（JIT 追加）
┌─────────────────────────────────────────────────────┐
│  ✅ language-design     （「占い」禁止語彙・トーン）   │
│  □  cocosil-mbti        （F1着手時）                 │
│  □  empathetic-chat     （F3着手時）                 │
│  □  supabase-rls        （DB設計時）                 │
│  □  clerk-auth          （F4着手時）                 │
│  □  openai-streaming    （F3着手時）                 │
└─────────────────────────────────────────────────────┘

CLIで代替するもの（MCPなし）
  supabase CLI  → migration / db diff / db lint / gen types
  vercel CLI    → deploy / logs
  gh CLI        → pr create / pr list / issue
```

---

## 📅 導入ロードマップ（v2.0）

| フェーズ | 期間 | 作業内容 | 担当 | ステータス |
|---|---|---|---|---|
| Phase 1 | Day 1 | pnpm移行 + 必須パッケージ追加 | ヒラメ | ✅ 完了 |
| Phase 1 | Day 1 | PreToolUse Hook 設定 | ヒラメ | ✅ 完了 |
| Phase 1 | Day 1 | `commit-commands` インストール | ヒラメ | ✅ 完了 |
| Phase 1 | Day 1 | `language-design` SKILL.md 作成 | ヒラメ | ✅ 完了 |
| Phase 1 | Day 1 | `lib/env.ts` 環境変数バリデーション | ヒラメ | ✅ 完了 |
| Phase 1 | Day 1 | `supabase init` ローカル初期化 | ヒラメ | ✅ 完了 |
| Phase 1 | Week 1 | Clerk認証セットアップ + 型生成パイプライン | ヒラメ | 🔲 未着 |
| Phase 2 | Week 2 | `code-review` プラグイン追加 | 全員 | 🔲 未着 |
| Phase 2 | Week 2 | PostToolUse Hook（lint自動化）追加 | ヒラメ | 🔲 未着 |
| Phase 2 | F1着手時 | `cocosil-mbti` SKILL.md 作成 | えんまさ | 🔲 JIT |
| Phase 2 | F3着手時 | `empathetic-chat` + `openai-streaming` SKILL.md 作成 | えんまさ/ヒラメ | 🔲 JIT |
| Phase 2 | DB設計時 | `supabase-rls` + `clerk-auth` SKILL.md 作成 | ヒラメ | 🔲 JIT |
| Phase 2 | F3着手時 | OpenAI SDK 追加 (`pnpm add openai`) | ヒラメ | 🔲 JIT |
