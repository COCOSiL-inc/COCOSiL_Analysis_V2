# COCOSiL チーム向け Claude Code 運用ベストプラクティス完全調査（2026年5月版）

## TL;DR

- **トークン最適化の本丸は「Claude Maxプラン（$200/月）+ rtk + kizami + Skills/Hooks による Progressive Disclosure」の四点セット**。Enterprise/API従量課金と比べ、同モデル・同ツール構成のままでも$40/日 → 月固定で破綻しない水準まで圧縮できた事例があり、CLAUDE.md は60〜200行、SKILL.md は500行未満を上限に切り詰める。
- **品質均一化はSKILL.md + Hooks による「アドバイザリ層と決定的層」の二層化**が鉄則。フロント担当・バックエンド担当が同じ品質でAIを使うには、`CLAUDE.md`（薄い案内図）→ サブディレクトリ`CLAUDE.md`（領域別規約）→ `.claude/skills/*/SKILL.md`（On-demand な手順書）→ `.claude/settings.json` Hooks（強制）の階層を厳格に分ける。COCOSiL は `apps/web` `apps/api` `packages/empathetic-chat` などにスコープ分割した複数CLAUDE.mdが正解。
- **手打ちプロンプトの揺らぎは Slash Command（=Skill）化と Hooks による TDD/レビュー強制で実質ゼロにできる**。Superpowersフレームワーク（obra/superpowers）の `brainstorm → write-plan → execute-plan` ループ、TDD Guard、PostToolUseでのlint/typecheck自動化、SessionStartでのgit/TODO注入を採用すれば、2人の開発者がほぼ同一品質で走れる。

---

## Key Findings（要約）

| 軸 | 採用すべき具体策 | 期待効果 |
|---|---|---|
| プラン | Claude Max 20x ($200/月) 固定。Opus 4.7 を planning、Sonnet 4.6 を実装、Haiku 4.5 を subagent | API従量比で $20–40/dev/day → 月額固定 |
| ツール | `rtk`（CLI出力60-90%圧縮）+ `kizami`（セッション間メモリ・hookベース）+ `Pith`（PostToolUse圧縮）| 入出力トークン60-90%削減・履歴を超えた記憶 |
| コンテキスト設計 | CLAUDE.md は60-200行のインデックス。詳細は `docs/*.md` と `.claude/skills/*/SKILL.md` に Progressive Disclosure | 起動時20kトークン以下に抑え、Claudeの指示遵守率を維持 |
| プロンプト揺らぎ | `.claude/skills/<name>/SKILL.md`（旧 `.claude/commands/*.md`）でテンプレート化。`$ARGUMENTS` と frontmatter で固定化 | 2人が同一プロンプトで同一品質 |
| 強制ガードレール | `.claude/settings.json` の PreToolUse/PostToolUse/SessionStart/Stop hooks。Superpowers + TDD Guard | 「やってくれるはず」を「常にやる」に変える |
| プロジェクト固有 | MBTI・占術ロジックは `.claude/skills/cocosil-mbti/`、共感チャットは `.claude/skills/empathetic-chat/`、SupabaseスキーマはSupabase公式 `supabase/agent-skills` を導入 | ドメイン知識を必要時のみロード |

---

## Details

### 軸1：トークン最適化の実践手法

#### 1-1. プラン選定 — Max 20x が小規模チームの最適解

Anthropic公式のコスト計算では、開発者一人あたり API使用で **$13/active day、$150–250/月** が平均、ヘビー利用では $20–40/日に達する。これに対し Max 20x（$200/月）は5時間ローリングウィンドウ + 週次キャップの定額制で、`/cost` の値は課金に直結しない（公式ドキュメント明記）。

複数の運用記事・実例（zenn.dev/okamyuji、Branch8 APAC事例）で、**同一モデル・同一プロキシ・同一ツールチェーンのまま Enterprise/API → Max x20 に切り替えるだけで、日次$40 → 月固定** に収まる構造差が確認されている。フロント1名・バックエンド1名の2席なら、$200×2 = 月$400 で頭打ち。これがCOCOSiLの基本姿勢。

API従量を選ぶ場合の節約は以下に集約される：
- `MAX_THINKING_TOKENS=10000`（デフォルトは数万、思考トークンも出力課金）
- `CLAUDE_CODE_SUBAGENT_MODEL=haiku`（subagentはHaikuで十分）
- `/model sonnet` をデフォルト、`/model opus` は plan モードと複雑判断のみ
- `opusplan` モード（plan時Opus、実装時Sonnet自動切替）

#### 1-2. CLI出力圧縮 — rtk（Rust Token Killer）導入

`rtk` は Bash ツール出力を透過的に圧縮する Rust 製 CLI プロキシ。実測値として `cargo test` 155行→3行（98%減）、`git status` 119文字→28文字（76%減）、累計 **2週間で約1,000万トークン（89%）の削減**事例が複数報告されている。

```bash
# COCOSiL チームの初期セットアップ（README.mdに必ず記載）
cargo install rtk    # Rust製、ワンバイナリ
rtk init -g          # Claude Code向けPreToolUse hookを~/.claude/settings.jsonに自動注入
rtk gain             # 累計節約量を確認
rtk discover         # まだrtk化できるコマンドを発見
```

PreToolUse hook が `git status` → `rtk git status` のように透過リライトするため、Claude側のプロンプトは一切変えなくていい。Read/Grep/Glob はバイパスされるので注意。

#### 1-3. セッション間メモリ — kizami（hookベース、MCP不要）

MCP サーバを5個接続するだけで会話開始前に約55kトークンが消費される問題（Claude Code MCP overhead として広く報告）を回避するため、**`kizami` はSessionEnd / UserPromptSubmit hookだけで動作する** ローカル長期記憶システム。SQLite単一ファイル（`~/.local/share/kizami/memory.db`）で、coreモードはネット不要、hybridモードでRuri v3日本語embedding（37MB int8）を併用。

```bash
git clone https://github.com/okamyuji/kizami.git
cd kizami && pnpm install && pnpm build && npm link
kizami setup          # ~/.claude/settings.json に hook 自動登録
kizami stats          # 記憶の統計
```

hookの実態（kizamiが自動で書き込む内容の例）：
```json
{
  "hooks": {
    "SessionEnd": [
      { "hooks": [{ "type": "command", "command": "kizami save < /dev/stdin" }] }
    ],
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "kizami recall < /dev/stdin" }] }
    ]
  }
}
```

これによりCOCOSiLでは「先週の Supabase RLS 設計」「MBTI×体癖クロス分析の判断履歴」が次セッションでも自動注入される。

#### 1-4. ファイル/コマンド出力のさらなる圧縮 — Pith

`abhisekjha/pith` は4種類のhookを `~/.claude/hooks/` にインストールする圧縮ハーネス：
- **PostToolUse**: ファイル読み取り 1,800 → 210 トークン (-88%)、`npm install` 940 → 80 (-91%)
- **UserPromptSubmit**: `/pith symbol src/auth.ts handleLogin` で関数単位ロード（フルファイルの 5%）
- **SessionStart**: 圧縮モードを復元
- **Stop**: トークン使用量レポート

rtkとPithは併用可能（PithはRead/Grepもカバー、rtkはBashのみ）。COCOSiLは両方推奨。

#### 1-5. プロジェクト固有コンテキストの設計（COCOSiL専用）

性格診断（MBTI / 体癖 / 動物占い等）と共感チャットのロジックは「会話毎に毎回ロード」せず、**必要時にだけ展開する Progressive Disclosure** に整理する：

```
cocosil/
├── CLAUDE.md                      # 60-100行の薄いインデックス
├── AGENTS.md                       # CLAUDE.mdへのシンボリックリンク（他ツール互換）
├── docs/                           # @import で参照する詳細
│   ├── architecture.md
│   ├── supabase-schema.md
│   ├── empathetic-chat-prompt-design.md
│   ├── mbti-mapping.md            # MBTI×体癖マッピング表
│   └── api-contracts.md
├── .claude/
│   ├── settings.json               # チーム共有Hooks
│   ├── settings.local.json         # 個人上書き（.gitignore）
│   ├── skills/                     # SKILL.mdライブラリ
│   │   ├── cocosil-mbti/           # 占術ロジック
│   │   │   ├── SKILL.md
│   │   │   ├── reference/mbti-types.md
│   │   │   └── reference/taiheki.md
│   │   ├── empathetic-chat/        # 共感チャットのプロンプト設計
│   │   │   ├── SKILL.md
│   │   │   └── scripts/validate-tone.py
│   │   ├── nextjs-app-router/      # フロント規約
│   │   │   └── SKILL.md
│   │   ├── supabase-rls/           # バック規約
│   │   │   └── SKILL.md
│   │   ├── clerk-auth/
│   │   │   └── SKILL.md
│   │   └── openai-streaming/
│   │       └── SKILL.md
│   ├── hooks/                      # シェルスクリプト
│   └── commands/                   # 旧式（skillsへ移行推奨）
└── apps/
    ├── web/CLAUDE.md               # フロント担当向け遅延ロード
    └── api/CLAUDE.md               # バック担当向け遅延ロード
```

**CLAUDE.md（ルート）の理想形（70行前後）**:

```markdown
# COCOSiL — Personality × Empathetic AI Chat

## Stack
Next.js 15 (App Router) / TypeScript / Tailwind / Supabase (Postgres + RLS)
/ Clerk (Auth) / OpenAI (gpt-4.1 + Realtime API) / Vercel.

## Domain Vocabulary (重要：絶対に揺らがせない)
- "diagnosis" = 性格診断結果（MBTI/体癖/動物占いの統合スコア）
- "session" = ユーザーとの単一チャット会話、`sessions` テーブルに対応
- "empathy turn" = AIが共感応答する1ターン
- "archetype" = 16タイプ × 体癖10種の合成型（128種）
- "trait_vector" = numeric[5] のBig5派生ベクトル（DB列名）

## Commands
- `pnpm dev` / `pnpm test` / `pnpm test:e2e` / `pnpm typecheck`
- 単体テストのみ: `pnpm vitest run <path>`
- DBマイグレーション: `supabase migration new <name>` → `pnpm db:push`

## Architecture map
- `apps/web` — フロント。詳細は `apps/web/CLAUDE.md`
- `apps/api` — Next.js Route Handlers / Server Actions。詳細は `apps/api/CLAUDE.md`
- `packages/diagnosis` — MBTI×体癖の純粋関数群（必ずSKILL `/cocosil-mbti` を読む）
- `packages/chat` — 共感チャットのプロンプト合成（SKILL `/empathetic-chat`）

## Workflow rules (YOU MUST)
- 新機能は必ず `/superpowers:brainstorm` → `/superpowers:write-plan` → `/superpowers:execute-plan`
- テストを書く前に実装コードを書いてはならない（TDD Guardが強制）
- Supabase 操作時は SKILL `/supabase-rls` を必ず読む
- Clerkのセッション扱いは SKILL `/clerk-auth` 必読（セッショントークンをクライアント露出禁止）
- `.env*` への書き込みは Hooks でブロックされている

## Further reading (Progressive Disclosure)
**IMPORTANT:** 該当領域に着手する前に必ず関連ドキュメントを `Read` してから作業すること。
- 設計判断: @docs/architecture.md
- DBスキーマ: @docs/supabase-schema.md
- 共感チャットのトーン基準: @docs/empathetic-chat-prompt-design.md
- MBTI×体癖マッピング表: @docs/mbti-mapping.md
- API契約: @docs/api-contracts.md
```

ポイントは **HumanLayer の指針（60行/200行ルール）** と Anthropic公式の「Claude Codeシステムプロンプト自体が約50指示を消費し、有効指示枠は150-200程度」という制約を踏まえ、**ルールではなく地図** にすることである。コード規約は ESLint/Prettier に任せ、CLAUDE.md には書かない（"Never send an LLM to do a linter's job"）。

---

### 軸2：SKILL.md による開発品質均一化

#### 2-1. Progressive Disclosure の3層構造

Anthropic公式定義（`platform.claude.com/docs/en/agents-and-tools/agent-skills`）：

| 層 | サイズ | ロード時 |
|---|---|---|
| メタデータ（YAML frontmatter の name + description） | ~100トークン × 全Skill | 起動時すべて |
| SKILL.md 本文 | <5,000トークン推奨、500行未満 | Claudeが該当判断時のみbash経由でRead |
| 添付ファイル（reference/*.md, scripts/*.py 等） | 上限なし | SKILL.mdから参照されたときのみ |

スクリプトはコードがコンテキストに載らない（実行結果のみ返る）ため、**MBTI判定や体癖スコア計算のような決定論的処理はPythonスクリプト化** し、Claudeに「再実装させない」ことが重要。

#### 2-2. COCOSiL 用 SKILL.md 実例

**`.claude/skills/cocosil-mbti/SKILL.md`** （フロント・バック共有のドメインスキル）:

```markdown
---
name: cocosil-mbti
description: COCOSiL の性格診断ロジック（MBTI 16型 × 体癖10種 = 128 archetypes）を扱うとき、または `packages/diagnosis/` 配下のファイルを編集するときに使用。スコアリング、type_code の正規化、trait_vector の生成、診断結果の i18n 表示が含まれる場合に必ず読み込む。
allowed-tools: Read, Grep, Bash(pnpm vitest *)
---

# COCOSiL 診断ロジック規約

## 不変のルール
1. `type_code` は必ず `${MBTI4}-${TaihekiNum}` 形式（例: `INFJ-7`）
2. `trait_vector` は Big5 派生 5次元、各 [-1.0, 1.0]、小数3桁。詳細は `reference/trait-vector.md`
3. 診断ロジックは純粋関数。I/O禁止。Supabaseアクセスは呼び出し側で
4. 確率は `Probability` ブランド型（`packages/diagnosis/src/types.ts:15` 参照）

## 必須リファレンス
- 16型ごとのトーン特性: reference/mbti-types.md
- 体癖10種の身体特徴と返答スタイル: reference/taiheki.md
- 統合スコアリング数式: reference/scoring.md

## バリデーション
新しい archetype マッピングを追加するときは必ず `scripts/validate-archetype.py` を実行：
\`\`\`
python .claude/skills/cocosil-mbti/scripts/validate-archetype.py packages/diagnosis/src/archetypes.json
\`\`\`

## 禁止事項
- ❌ MBTIの「16型を超える」拡張（占星術12星座を直接統合する等）
- ❌ trait_vector の次元数変更（DBスキーマ破壊）
- ❌ ハードコードされた archetype 説明文（必ず i18n キー経由）
```

**`.claude/skills/empathetic-chat/SKILL.md`**:

```markdown
---
name: empathetic-chat
description: 共感AIチャットの実装・プロンプト編集・トーン調整時に使用。OpenAIストリーミング、SSEハンドラ、Clerk セッション、Supabase の `messages` テーブルへの書き込み、PII マスキングを含む変更を行うとき必ず読む。
---

# Empathetic Chat 実装規約

## システムプロンプト合成順序
1. archetype に応じた tone_template（reference/tone-templates.md 参照）
2. 直近10ターンのサマリ（kizami が注入する場合は省略）
3. ユーザーの trait_vector を踏まえた個別化指示
4. セーフティガード（reference/safety.md：自殺念慮検知、医療助言の禁止等）

## ストリーミング実装
- App Router の Route Handler `app/api/chat/route.ts` で `ReadableStream` を返す
- Vercel Edge Runtime ではなく Node Runtime（Supabase Service Role 必要）
- 中断時は `AbortController` でOpenAI接続を確実に閉じる

## セキュリティ
- ユーザー発話は必ず `scripts/redact-pii.py` でマスキングしてからログ保存
- システムプロンプトは絶対にレスポンスに含めない（プロンプトリーク防止）
- Clerk の `auth().userId` を必ず Supabase の `user_id` に突合

## テスト要件（TDD必須）
- トーンテスト: `pnpm vitest packages/chat/__tests__/tone.spec.ts` 
- 16 archetype × 5 入力 = 80ケースのスナップショット必須
```

#### 2-3. 役割分担に対応した SKILL 設計

| 担当 | 必須Skill | 推奨Skill |
|---|---|---|
| フロント (1名) | `cocosil-mbti`, `empathetic-chat`, `nextjs-app-router`, `clerk-auth-frontend`, `tailwind-design-system` | `react-hook-form-patterns`, `tanstack-query` |
| バック (1名) | `cocosil-mbti`, `empathetic-chat`, `supabase-rls`, `clerk-auth-backend`, `openai-streaming` | `vitest-mocking`, `pgvector` |
| 共通 | `tdd-guard`, `commit-conventions`, `pr-review` | `superpowers:brainstorm`, `superpowers:write-plan` |

Supabase公式が提供する `supabase/agent-skills` プラグインマーケットを導入すると、`postgres-best-practices` と `supabase`（DB/Auth/Edge Functions/Realtime/Storage 包括）が自動でロード可能：

```bash
claude plugin marketplace add supabase/agent-skills
claude plugin install supabase@supabase-agent-skills
claude plugin install postgres-best-practices@supabase-agent-skills
```

#### 2-4. CLAUDE.md / AGENTS.md / SKILL.md の階層

公式仕様および実証された読み込み順：

1. **管理ポリシー（Enterprise）** → 強制、上書き不可
2. **`~/.claude/CLAUDE.md`** → ユーザー個人（個人嗜好）
3. **プロジェクトルート `./CLAUDE.md`** → チーム共有、git 管理（COCOSiLのコア）
4. **`./CLAUDE.local.md`** → 個人ローカル、`.gitignore`
5. **サブディレクトリ `./apps/web/CLAUDE.md`** → **遅延ロード**（そのディレクトリのファイルをClaudeが触るときのみ）
6. **Skills メタデータ** → 起動時に name+description だけ全Skill分ロード
7. **Skills 本体** → Claudeが必要判断時にbash readで動的ロード

`AGENTS.md` は Sourcegraph/OpenAI/Google/Cursor/Factory が共同で進めるクロスツール標準（Linux Foundation）。**ベストプラクティスは AGENTS.md を正本にし、CLAUDE.md からシンボリックリンク**：

```bash
mv CLAUDE.md AGENTS.md
ln -s AGENTS.md CLAUDE.md
```

これでCursor、Codex、Cline など他のAIツールを将来併用しても同じ規約が読まれる。

#### 2-5. Progressive Disclosure 実装パターン

Vercelのevalsで「圧縮されたdocs indexをAGENTS.mdに直接埋め込むと100%のpass rate、Skillsは79%」という結果も出ているが、これは**Skillsのトリガー精度の問題** であり、`description` フィールドにキーワードを正確に並べれば解決する。

実装テンプレート：

```markdown
## Further Reading
**IMPORTANT:** 着手前に該当タスクで関連するドキュメントを必ず特定し、Readしてから変更を加えること。

- `docs/supabase-schema.md` — Postgres スキーマと RLS ポリシー
- `docs/empathetic-chat-prompt-design.md` — プロンプト合成
- `docs/mbti-mapping.md` — 128 archetype の対応表
- `docs/api-contracts.md` — フロント/バック契約
```

「IMPORTANT:」と「必ず」が無いとClaudeは読まない。これがHumanLayerの実証結果。

---

### 軸3：手打ちプロンプトの揺らぎを最小化する仕組み

#### 3-1. Hooks による決定的ガードレール

公式に存在する15のhookイベントのうち、COCOSiLが導入すべき5つ：

| イベント | 用途 | 効果 |
|---|---|---|
| **PreToolUse** | 危険コマンドブロック、`.env*`への書き込み禁止、rtk への透過リライト | ハード強制 |
| **PostToolUse** | Edit/Write後に `pnpm lint --fix` `pnpm typecheck` を自動実行 | フォーマット・型チェック忘れゼロ |
| **SessionStart** | git status, 直近TODO, 進行中タスクをコンテキスト注入 | 「今どこから再開」が明確 |
| **Stop** | テスト未実行のまま終了させない（exit 2でforce continue） | 完了詐称の防止 |
| **UserPromptSubmit** | プロンプトテンプレート展開、必須コンテキスト追加 | 揺らぎ排除 |

**`.claude/settings.json` 完全例**：

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku",
    "ENABLE_PROMPT_CACHING_1H": "1"
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/block-secrets.js"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/block-dangerous.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          { "type": "command", "command": "pnpm prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true" },
          { "type": "command", "command": "pnpm eslint --fix \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true" }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '## Branch'; git branch --show-current; echo '## Status'; git status --short; echo '## TODOs (top 5)'; grep -rn 'TODO:' apps/ packages/ 2>/dev/null | head -5; echo '## Last 3 commits'; git log --oneline -3"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "直前のセッションで `apps/` 配下のテスト関連ファイルが変更されたかをGrepで確認し、変更があれば `pnpm test` を実行して全件pass しているかを判定。passしていなければ {\"decision\":\"block\",\"reason\":\"tests not green\"} を返してClaudeに継続を促す。",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

**`.claude/hooks/block-secrets.js`** （シークレット書き込みブロックの例）:

```javascript
#!/usr/bin/env node
const input = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const path = input.tool_input?.file_path || '';

const FORBIDDEN = [
  /\.env(\.local|\.production|\.development)?$/,
  /supabase\/config\.toml$/,
  /\.git\//
];

if (FORBIDDEN.some(re => re.test(path))) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `${path} はチームポリシーで編集禁止です。手動で更新してください。`
    }
  }));
  process.exit(0);
}
process.exit(0);
```

#### 3-2. TDD強制 — TDD Guard or Superpowers

**TDD Guard**（`nizos/tdd-guard`）:
```bash
/plugin marketplace add nizos/tdd-guard
/plugin install tdd-guard
```
Claude が「テストの前に実装」「失敗テスト無しのコード追加」「過剰実装」を試みたときに PreToolUse でブロックし、修正指示を返す。Vitest/Jest/pytest対応。

**Superpowers**（`obra/superpowers`、174,000+ stars）が提供する `test-driven-development` skill はもっと強力で、**実装が先に書かれたら "literally makes Claude delete the code and start over"**。COCOSiLは `red-green-refactor` を絶対化したいので**両方併用**を推奨：

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

これで以下のSkillが自動有効化：
- `brainstorming`：コードを書く前に仕様を引き出す
- `writing-plans`：2-5分で完了する粒度のタスクに分解、ファイルパスとテストを先に書き出す
- `test-driven-development`：red-green-refactor強制
- `subagent-driven-development`：実装は別subagentに渡し、別subagentがレビュー
- `systematic-debugging`：4フェーズの根本原因分析。3回失敗したらアーキテクチャレビュー
- `verification-before-completion`：成功を主張する前にコマンドで検証

#### 3-3. プロンプトをコマンド化（Slash Command = Skill）

2026年4月の更新で **`.claude/commands/*.md` は `.claude/skills/<name>/SKILL.md` に統合**。同名の場合 Skill が優先。`$ARGUMENTS` プレースホルダで引数受け取り、frontmatter で許可ツールを宣言できる。

**`.claude/skills/feature/SKILL.md`** （COCOSiL の機能追加標準フロー）:

```markdown
---
name: feature
description: 新機能の追加。ユーザーが「機能を追加して」「Implement X」「Buildして」等と言ったときに自動起動。`brainstorming → writing-plans → execute-plan` のSuperpowers流れに沿って進める。
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, Bash(pnpm *), Bash(git *)
---

# COCOSiL Feature Workflow

機能名: $ARGUMENTS

## Step 1: ブレインストーミング (必須)
質問せずにコードを書き始めてはならない。以下を順に確認：
1. ユーザーストーリーは？「<role> として、<goal> したい、なぜなら <reason>」形式で復唱
2. 影響範囲（apps/web / apps/api / packages/diagnosis / packages/chat）
3. 既存の archetype / trait_vector の意味を変えるか？（Yes ならスキーママイグレーション必須）
4. プライバシー影響：ユーザー発話を新規保存するか？（Yes なら PII マスキング設計が必要）

## Step 2: プラン書き出し
`docs/plans/<feature-slug>.md` に以下を含めて書き出す：
- 影響ファイル一覧（フルパス）
- 各タスクの粒度は2-5分以内
- 各タスクに対応する失敗テスト（テスト名と期待アサーション）
- ロールバック手順

## Step 3: 実装（TDD強制）
タスクごとに：
1. 失敗テストを先に書き、`pnpm vitest run <path>` で fail を確認
2. 最小限の実装でgreenにする
3. リファクタ
4. `pnpm typecheck && pnpm lint && pnpm vitest run <path>` を完走
5. `git add -p && git commit -m "feat(<scope>): <task>"` 

## Step 4: 検証
- `pnpm test` 全件pass
- `pnpm build` 成功
- 該当archetype変更があれば `python .claude/skills/cocosil-mbti/scripts/validate-archetype.py` 実行

## Step 5: PR
`gh pr create` で作成。テンプレートは `.github/pull_request_template.md`。
```

これで `/feature 共感チャットに音声入力を追加` と打つだけで、両担当者が同じワークフローを踏める。

**フロント担当用の例 — `.claude/skills/new-component/SKILL.md`**:

```markdown
---
name: new-component
description: Next.js App Router のコンポーネント新規追加。Server/Client境界、`error.tsx`、Suspense、TanStack Query 利用判断を強制。
allowed-tools: Read, Glob, Bash(pnpm *)
---

# 新コンポーネント追加: $ARGUMENTS

## Server / Client 判定（先に決定）
- useState/useEffect/useRef/onClick/onChange を使う？ → Client (`'use client'`)
- それ以外 → Server (default)

## 既存パターンの確認
1. `apps/web/components/` 内の同種コンポーネントを Glob し最低1つ Read
2. データ取得が必要なら、Server Component で `await` 直書き or Client で TanStack Query
3. 必ず error.tsx を同階層に配置（async ページの場合）

## ファイル
- `apps/web/components/<name>/<Name>.tsx`
- `apps/web/components/<name>/<Name>.test.tsx` (Vitest + Testing Library)
- 必要なら `apps/web/components/<name>/error.tsx`

## i18n
ハードコード文字列禁止。`messages/{ja,en}.json` に追加。

## アクセシビリティ
- Tailwind の focus-visible:ring を必ず設定
- aria-label / role を適切に
```

**バック担当用 — `.claude/skills/new-route/SKILL.md`**:

```markdown
---
name: new-route
description: Next.js Route Handler 新規追加。Clerk認証、Supabase RLS、Zodバリデーション、レート制限を強制。
allowed-tools: Read, Glob, Bash(pnpm *), Bash(supabase *)
---

# 新Route Handler: $ARGUMENTS

## 必須チェックリスト
1. `auth()` で `userId` 取得、無ければ 401
2. リクエストボディは Zod schema で validate
3. Supabase クライアントは `lib/supabase/server.ts` の `createClient()` 経由
4. RLS 前提：Service Role を使う場合は理由をコメントで明記
5. レート制限：Upstash Ratelimit で `userId` 単位
6. エラーレスポンスは `{ error: { code, message } }` 形式
7. `app/api/<resource>/route.test.ts` 必須

## 禁止
- ❌ `getSession()` をServer codeで使用（getClaims/getUser を使え）
- ❌ クライアントへの service_role_key 露出
- ❌ ユーザー入力を直接 SQL に展開（必ず supabase-js のbuilder経由）
```

#### 3-4. 2人体制のガバナンス設計

**ガバナンスの原則**：

1. **CLAUDE.md と `.claude/` 配下は git 管理、PRレビュー対象**。Skillの追加・変更は必ずPRで。
2. **個人差は `CLAUDE.local.md` と `~/.claude/CLAUDE.md`** に逃がす（gitignore）。
3. **Hooks は `.claude/settings.json` に集約**。`.claude/settings.local.json` は個人上書き、`/hooks` UI で承認後に発火。
4. **Skill命名規則**：gerund形（`debugging-supabase`、`writing-empathetic-prompt`）または動詞-名詞（`new-route`、`fix-rls-policy`）。
5. **Skillは週1回以上使う作業だけ作る**（Anthropic公式の推奨）。それ以下なら ad-hoc プロンプトで十分。
6. **Definition of Done を Skill に書く**：何をもって「完了」かを各 Skill の最後に明記し、Stop hook の agent でそれを検証する。

**チーム共有チェックリスト（リポジトリの `docs/claude-onboarding.md`）**:

```markdown
# COCOSiL Claude Code オンボーディング（5分）

## 一回だけのセットアップ
1. Claude Max 20x プランに登録（個人または会社）
2. `claude --version` が 2.1.117 以上
3. `cargo install rtk && rtk init -g`
4. `git clone .../kizami && cd kizami && pnpm install && pnpm build && npm link && kizami setup`
5. リポジトリ root で `claude` 起動 → `/plugin install superpowers@superpowers-marketplace`
6. `/plugin install tdd-guard@nizos`
7. `/plugin install supabase@supabase-agent-skills`

## 毎日のルーティン
- 起動時: SessionStart hook が git status と TODO を表示。`/recap` で前回の続きを思い出す
- 機能追加: `/feature <name>` で必ずスタート
- 完了前: `/superpowers:requesting-code-review`

## 禁止事項
- CLAUDE.md を200行超にしない（PR でブロックされる）
- `pnpm install` ではなく `npm install` を使わない（hooks がブロック）
- `/model opus` を実装中に使わない（plan時のみ）
- 自前のシステムプロンプトを毎回書かない → 該当 Skill を作るかPRで議論
```

---

### 軸4：参考フレームワーク評価

#### Superpowers (obra/superpowers, 174k+ stars)

**採用推奨。** 14の SKILL.md と1つの session-start hook だけで構成され、Claude Code / Cursor / Codex / Copilot CLI / Gemini CLI / OpenCode で共通動作する。COCOSiLには重すぎる懸念は無く、むしろチームメンバ2人の品質を揃える効果が大きい。導入コスト数分。

#### Everything Claude Code (ECC, affaan-m/everything-claude-code, 168k stars)

**部分採用。** 47-48 agents / 119-182 skills / 60-68 commands と非常に大規模。フル導入はオーバーキルだが、以下のモジュールは COCOSiL に有用：
- `tdd` skill（Superpowersと比較して選択）
- `code-reviewer` agent（PR出す前のセルフレビュー用）
- `strategic-compact` skill（`/compact` を最適タイミングで促す）
- `verification-loop` skill
- AgentShield（102セキュリティルール、特に `.env` 漏洩防止）

選択インストール：
```bash
/plugin marketplace add everything-claude-code
/plugin install everything-claude-code@everything-claude-code  # フル
# or
# 該当 SKILL.md だけ ~/.claude/skills/ にコピー
```

#### gstack / GSD

評価記事によると：
- **Superpowers** = "How"（実行ループ）
- **gstack** = "What/Whether"（判断・決定層）
- **GSD** = 仕様と長期コンテキストの安定化

COCOSiLの規模（2人、月数機能）なら **Superpowers + ECCの数Skill** で十分。gstack は将来的に検討。

---

### 軸5：2026年5月時点で押さえるべき新機能

April 2026 リリースから抜粋（v2.1.111-119）：

- **Opus 4.7 + Auto mode**：Maxユーザーは Opus 4.7 で auto mode が `--enable-auto-mode` フラグ無しで利用可能。`/effort xhigh` の効果レベル追加
- **`/recap`**：セッション復帰時に文脈サマリを自動生成。COCOSiLの長期チャット機能設計の参考に
- **`ENABLE_PROMPT_CACHING_1H=1`**：プロンプトキャッシュTTLを1時間に延長。CLAUDE.md と Skills メタデータが温まり続け、繰り返しコストを大幅削減
- **`/team-onboarding`**：CLAUDE.md・skills・subagents・hooksから新メンバー向けrampアップ文書を自動生成
- **`/less-permission-prompts`**：transcripts を解析し読み取り専用 Bash/MCP の allowlist を `.claude/settings.json` に提案
- **MCP 500K**：tool結果上限が500,000文字に拡張
- **Agent Teams**：別セッションの並行エージェント協調。フロント・バックの並行作業に有用だが、トークン消費は標準の約7倍。COCOSiLの2人2セッションには通常不要
- **Native CLI binary**：v2.1.113 から起動高速化
- **Computer use in Claude Code**：Pro/Max でファイル操作・ブラウザ操作可能。Vercel デプロイ確認等に
- **Sonnet 4.6 1M context window**：beta提供。ただし"after about 400k tokens, the agent becomes less relevant" との実測報告あり、**むやみに長コンテキストを使わない**

---

### 軸6：実装ロードマップ（COCOSiL チーム向け、2週間）

**Day 1 — 環境統一**
- リポジトリroot に `AGENTS.md`（70行）作成、`CLAUDE.md` シンボリックリンク
- `apps/web/CLAUDE.md`、`apps/api/CLAUDE.md` 各40-60行
- `.claude/settings.json` に最小Hooks（PreToolUse: シークレットブロック、PostToolUse: prettier/eslint）
- 2人とも Max 20x、rtk、kizami セットアップ

**Day 2-3 — Skillライブラリ**
- `cocosil-mbti`、`empathetic-chat` を最優先で作成（ドメイン固有、最重要）
- `supabase-rls`、`clerk-auth-frontend`、`clerk-auth-backend`、`openai-streaming` を作成
- Supabase公式 plugin インストール

**Day 4-5 — 強制ガードレール**
- Superpowers と TDD Guard 導入
- Stop hook agent で「テスト未実行禁止」を有効化
- SessionStart hook を整備（git/TODO/recap）

**Day 6-10 — Slash Command 整備**
- `/feature`、`/new-component`（フロント）、`/new-route`（バック）、`/fix-rls-policy`、`/add-archetype`
- 過去1週間の手打ちプロンプトを review し、3回以上現れたものを Skill 化

**Day 11-14 — 計測と最適化**
- `rtk gain`、`kizami stats`、`/cost` を週次で記録
- CLAUDE.md / SKILL.md が肥大化していないかPRで監視（200行超、500行超でPR ブロック）
- onboarding ドキュメントを最終化

---

## Caveats

- **トークン削減数値はばらつきが大きい**：rtk の "89%" は2,927コマンドの平均、git log や cargo test など verbose 出力で大きく出る一方、短い出力では効果が小さい。`drona23/claude-token-efficient` の実測でも「CLAUDE.md自体が毎メッセージinputトークンを消費するため、output が少ないワークフローでは net 増になる」と明示されている。**測定して効くものを残す**姿勢が必要。
- **Skillsの自動トリガーは100%ではない**：Vercelのevalsで79%、`alexop.dev` のレポートでも「skills don't always activate when expected」。重要な領域は CLAUDE.md の `## Further Reading` で **IMPORTANT:** 付き明示参照を併用するのが安全。
- **Auto mode、`/loop`、`/buddy` 等の最新機能は急速に変化中**。本レポートは2026年5月時点の仕様。Claude Code は週次でリリースしているため、`https://code.claude.com/docs/en/whats-new` を月1で確認すべき。
- **kizami / Pith / rtk は個人/コミュニティOSS**。エンタープライズ用途ではセキュリティレビュー（特に Pith は `~/.claude/hooks/` グローバルインストール）必須。COCOSiL のような小規模スタートアップ用途では十分実用。
- **MCPサーバの追加は慎重に**。1サーバあたり数千トークンの定常コスト。CLI で代替できるなら CLI（`gh`、`supabase` CLI、`vercel` CLI）を選ぶ方がトークン効率は高い。1プロジェクト10サーバが Anthropic 公式上限の目安。
- **CLAUDE.md は「アドバイザリ」、Hooksは「決定的」**。"YOU MUST"を書いてもClaudeは無視することがある（HumanLayer / Anthropic公式が共に明言）。本当に強制したい規約はHooksに移すこと。
- **Superpowers のような "rigid" フレームワークは小タスクで過剰になる**。typo修正やドキュメント更新で `brainstorm → plan → execute-plan` を強制されると遅い。Skillの `description` を厳格にし、適用範囲を「機能追加・リファクタ」に限定するか、`disable-model-invocation: true` で明示呼び出しのみにする運用も検討する。
- **"Anthropic 2026 Agentic Coding Trends Report" など本調査で参照したいくつかの記事は2026年付け（未来日付）の記述を含む**。これは執筆時点でAIエージェント業界が極めて急速に進化しており、ブログ・公式更新ともに月単位で陳腐化することを意味する。COCOSiLは**四半期ごとにこの構成を見直す**ことを推奨する。