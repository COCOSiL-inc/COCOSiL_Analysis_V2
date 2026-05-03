# /cocosil-work — 実装実行

> **ワークフロー:** `/start-task <説明>` → **`/cocosil-work`（ここ）** → `/finish-task`

## 実行前チェック（必ず確認）

1. [ ] `/start-task` でブランチを作成済みか？（まだなら先に `/start-task <タスク説明>` を実行する）
2. [ ] 現在のブランチは命名規則に合っているか？（下記「Gitブランチ命名」参照）
3. [ ] `cocosil-domain` スキルを読んだか？
4. [ ] AGENTS.md のルールを確認したか？
5. [ ] 実装しようとしているファイルは自分の担当レイヤー内か？（下記ガード参照）
6. [ ] 新機能・コピー・プロンプトの場合、下記「設計中枢 — 5問のリトマス試験紙」を通したか？

## 設計中枢 — 5問のリトマス試験紙

> 全文: `docs/input/concepts/COCOSiL設計中枢.md`（Layer 0 — すべての判断の最上位基準）

新機能追加・コピー作成・プロンプト変更を行う前に、必ず次の5問を通す。

| # | 問い | レベル | 判定 |
|---|---|---|---|
| Q1 | **無明を晴らすか？**（自己理解の解像度を上げるか） | 🔴 Must | |
| Q2 | **三毒を増幅していないか？**（欲・怒り・混乱を煽っていないか） | 🔴 Must | |
| Q3 | **共感→安心→分析→行動の順序を守れているか？** | 🔴 Must | |
| Q4 | **小我の強化ではなく、大我への移行を支援するか？** | 🟡 Should | |
| Q5 | **良い人間関係に寄与するか？**（ハーバード基準） | 🟡 Should | |

- **Must（Q1〜Q3）**: 1つでも × なら採用しない（`逆方便` — 目的から離れさせる装置）
- **Should（Q4〜Q5）**: × でも許容されるが、戦略的意味を明文化して記録に残す

### 設計3原則（迷ったら唱える）

- **Dispel, Don't Decorate.** — 「これは自己理解の解像度を上げるか？」だけで判断する
- **From Reaction to Reflection.** — 三毒を増幅する設計は絶対に入れない
- **Self-Knowing for Better-Relating.** — 自己理解は終点でなく、良い人間関係への入口

## 担当ガード（絶対厳守）

### えんまさ @MasakiEndo44（意味設計レイヤー）のセッションで触れるファイル

```
lib/prompts/**
lib/data/**
docs/language/**
```

### まあみ @maami415（見た目設計レイヤー）のセッションで触れるファイル

```
app/(auth)/diagnosis/**
app/(auth)/report/**
app/(auth)/chat/**
app/(auth)/onboarding/**
app/(public)/share/**
components/**
```

`app/api/**` は触らない。API接続前はモックJSONで動作確認する。

### ヒラメ @shuichiro-16（構造設計レイヤー）のセッションで触れるファイル

```
app/api/**
supabase/migrations/**
supabase/functions/**
lib/diagnostics/**
lib/clerk/**
lib/gamma/**
vercel.json
```

### 共通ファイル（どのセッションでも変更前にユーザー確認）

```
AGENTS.md
package.json（依存関係追加）
.env.example（新しいenv var追加）
lib/types/database.ts（pnpm db:types で自動生成。手書き禁止）
```

## 実装品質基準

- TypeScript `any` 禁止。`unknown` から型ガードで絞る
- `console.log` はデバッグ用のみ（コミット前に削除）
- `process.env.XXX` の直接参照禁止。`@/lib/env` の `env` または `getServerEnv()` を使う
- UIコピー・AIプロンプトを書く前に `language-design` スキルを読む

## UXシーケンス適合チェック（F3チャット実装時）

実装後に確認：

- [ ] 共感フェーズ（P1）が分析・アドバイスより先に実行されるか
- [ ] ユーザーが悩みを話す前にアクションプランが表示されないか
- [ ] フェーズ遷移は `empathy → reassurance → analysis → action` の順か

## Gitブランチ命名

**ブランチは `/start-task <タスク説明>` で自動作成する。** 手動で `git checkout -b` するのではなく、コマンドに命名を任せる。

参考（`/start-task` が推論する命名パターン）：

```
feature/ui-*   （まあみ担当 — UIコンポーネント・画面）
feature/api-*  （ヒラメ担当 — API・DB・インフラ）
docs/content-*  （えんまさ担当 — プロンプト・言語設計）
```

実装が終わったら `/finish-task` でタイプチェック・lint・PR作成まで一気に完了させる。
