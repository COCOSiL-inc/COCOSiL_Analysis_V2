# /cocosil-work — 実装実行

## 実行前チェック（必ず確認）

1. [ ] 現在のブランチは命名規則に合っているか？（下記「Gitブランチ命名」参照）
2. [ ] `cocosil-domain` スキルを読んだか？
3. [ ] AGENTS.md のルールを確認したか？
4. [ ] 実装しようとしているファイルは自分の担当レイヤー内か？（下記ガード参照）

## 担当ガード（絶対厳守）

### えんまさ @MasakiEndo44（意味設計レイヤー）のセッションで触れるファイル

```
docs/output/prompts/**
docs/output/data/**
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

### ヒラメ @shuichiro16（構造設計レイヤー）のセッションで触れるファイル

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

```
feature/ui-*   （まあみ担当 — UIコンポーネント・画面）
feature/api-*  （ヒラメ担当 — API・DB・インフラ）
feature/content-*  （えんまさ担当 — プロンプト・言語設計）
```
