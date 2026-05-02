# COCOSiL v2 — Claude Code 初期化 1-shot プロンプト

> **使い方：** このファイルの`---PROMPT START---`以下を丸ごとコピーして Claude Code に貼り付けて実行する。
> プロジェクトルートで実行すること。

---PROMPT START---

<project_init>

あなたはCOCOSiL v2プロジェクトのセットアップエージェントです。
以下の指示を**必ず上から順番に**実行してください。並列実行は禁止。
各ファイルを生成するたびに「✅ [ファイル名] 生成完了」と報告してください。

---

<section name="STEP0_DECLARE">

## STEP 0：作業宣言（最初に必ず実行）

TodoWriteツールを使って、以下の生成タスクリストを登録してください：

1. /CLAUDE.md（共通・全体ルール）
2. /frontend/CLAUDE.md（えんまさ用）
3. /backend/CLAUDE.md（ヒラメ用・雛形）
4. .claude/skills/cocosil-domain/SKILL.md
5. .claude/skills/frontend-nextjs/SKILL.md
6. .claude/skills/backend-supabase/SKILL.md
7. .claude/commands/cocosil-setup.md
8. .claude/commands/cocosil-plan.md
9. .claude/commands/cocosil-work.md
10. .claude/commands/cocosil-review.md
11. .claude/commands/cocosil-release.md
12. PLANS.md（Sprint 1受け入れ条件）
13. CONTRIBUTING.md（ヒラメ引き継ぎ文書）

登録後、タスク1から順番に実行してください。

</section>

---

<section name="STEP1_CLAUDE_MD_ROOT">

## STEP 1：/CLAUDE.md を生成してください

以下の内容で `/CLAUDE.md` を生成してください。
このファイルはえんまさとヒラメの両方のClaude Codeが毎回読む「共通憲法」です。

```markdown
# COCOSiL v2 — プロジェクト共通ルール

## プロダクト概要
- サービス名：COCOSiL（ここしる）
- コンセプト：「自分を知って、ラクになる」
- 機能：共感AIチャット × MBTI・星座・動物占い（60アニマル）・六星占術の4体系統合分析
- ターゲット：25-35歳の若手社会人、職場の人間関係にストレスを感じている層

## 技術スタック
- フロントエンド：Next.js（App Router）+ shadcn/ui + Tailwind CSS
- バックエンド：Supabase（DB + RLS + Edge Functions）
- 認証：Clerk（Google SSO + メール）
- AI：OpenAI API（チャット・分析）、Gamma API（レポート・シェアカード生成）
- デプロイ：Vercel

## 🚨 COCOSiL鉄則（絶対に破るな）

### UXシーケンス
**共感 → 安心 → 分析 → 行動** の順序は絶対に変えない。
- 分析や診断結果をユーザーの感情処理より先に表示するUIは**アンチパターン**
- ユーザーが自己開示する前に占い結果を見せない
- アドバイスより先に共感を返す

### 禁止事項
- 担当外のF番号ファイル（後述）への Write は禁止
- /CLAUDE.md の変更は えんまさ + ヒラメ 両者の承認が必要
- コンテキストが 70% を超えたら `/cocosil-plan` を提案する
- コンテキストの最後 20% での多ファイル同時変更は禁止

## チーム構成と担当範囲

### えんまさ担当（フロント〜バック一気通貫）
| 機能番号 | 機能名 |
|---|---|
| F1 | MBTI簡易診断（質問設計・判定ロジック・UI・API） |
| F2 | 統合レポート（ナレッジベース・プロンプト設計・Gamma API・レポートUI） |
| F3 | 共感AIチャット + アクション記録（3フェーズプロンプト・UI・API・SSE） |

### ヒラメ担当（フロント〜バック一気通貫）
| 機能番号 | 機能名 |
|---|---|
| F4 | 認証・オンボーディング（Clerk・生年月日入力・プロフィールDB） |
| F5 | 生年月日ベース診断（星座・動物占い60アニマル・六星占術計算ロジック） |
| F6 | SNSシェアカード（Gamma API・シェアUI・OGP・招待リンク） |
| F7 | インフラ・共通基盤・アナリティクス（Supabase全体設計・Vercel・管理画面） |

### 共有インターフェース（両者合意が必要）
- DBスキーマ（Sprint 1 Day 1に確定・凍結。変更はPRレビュー必須）
- API契約（エンドポイントのI/F定義のみ共有）
- Gitブランチ命名：`feature/F1-mbti`, `feature/F2-report`, ..., `feature/F7-infra`
- 環境変数命名：`NEXT_PUBLIC_*`, `SUPABASE_*`, `CLERK_*`, `OPENAI_*`, `GAMMA_*`

## コンテキスト管理ルール
- コンテキストが 70% を超えたら `/compact` を提案すること
- コンテキストの最後 20% では複数ファイルの同時変更をしない
- 長いセッションの開始時は `PLANS.md` を必ず読んでから作業を開始する

## verb-skill コマンド一覧
| コマンド | 用途 |
|---|---|
| `/cocosil-setup` | 新機能開発の初期化 |
| `/cocosil-plan` | Sprint計画・受け入れ条件の定義 |
| `/cocosil-work` | 実装実行 |
| `/cocosil-review` | PRレビュー・品質チェック |
| `/cocosil-release` | リリース・CHANGELOG生成 |

詳細は `.claude/commands/` を参照。
```

</section>

---

<section name="STEP2_FRONTEND_CLAUDE_MD">

## STEP 2：/frontend/CLAUDE.md を生成してください

以下の内容で `/frontend/CLAUDE.md` を生成してください。
えんまさのClaude Codeが読む。F1〜F3の実装中のみ参照。

```markdown
# COCOSiL フロントエンド開発ルール（えんまさ担当）

## 担当機能
F1（MBTI診断）/ F2（統合レポート）/ F3（共感AIチャット）

## Next.js App Router 作法
- `app/` ディレクトリのみ使用（pages/ は使わない）
- Server Component をデフォルト。クライアント操作が必要な箇所のみ `'use client'`
- データフェッチは Server Component で行い、Client Component にはpropsで渡す
- Route: `app/(features)/[feature-name]/page.tsx` の形式を守る

## UIコンポーネント作法
- shadcn/ui を優先。カスタムコンポーネントはshadcnで解決できない場合のみ作成
- スタイルは Tailwind CSS のユーティリティクラスのみ（インラインstyleは禁止）
- モバイルファースト：SP表示を先に設計してからPC対応

## Clerk 認証
- `@clerk/nextjs` の `auth()` を使用（Server Component）
- ミドルウェアは `/middleware.ts` で一元管理
- ユーザーIDは `auth().userId` から取得。直接DBに保存しない

## AIチャット実装ルール（F3専用）
- レスポンスは必ずSSE（Server-Sent Events）でストリーミング
- フェーズ管理：共感(P1) → 安心(P2) → 分析(P3) の順序を破るロジックは書かない
- システムプロンプトの構成：ベースプロンプト + ユーザーコンテキスト（4体系診断結果）+ フェーズ制御
- JSON modeでアクションプランを構造化抽出

## Gamma API 連携ルール（F2・F3）
- Rate limit / コスト の状況は PLANS.md の「外部API制約」セクションを必ず確認
- 生成失敗時のフォールバック：静的HTMLテンプレート（`/components/reports/fallback/`）

## 型安全
- `any` 禁止。`unknown` を使ってから型ガードで絞る
- APIレスポンス型は `types/api/` に集約
- Supabase の型は `supabase gen types typescript` で自動生成したものを使う

## テスト
- ユニットテスト：Vitest
- E2E：Playwright（Sprint 4で整備）
- AIプロンプトのテスト：`__tests__/prompts/` に期待入出力ペアを記録
```

</section>

---

<section name="STEP3_BACKEND_CLAUDE_MD">

## STEP 3：/backend/CLAUDE.md を生成してください

以下の内容で `/backend/CLAUDE.md` を生成してください。
ヒラメのClaude Codeが読む。F4〜F7の実装中のみ参照。
**【PLACEHOLDER】マーカーがついた箇所はヒラメが肉付けすること。**

```markdown
# COCOSiL バックエンド開発ルール（ヒラメ担当）

## 担当機能
F4（認証）/ F5（生年月日診断ロジック）/ F6（SNSシェアカード）/ F7（インフラ・共通基盤）

## Supabase 設計ルール
- **RLS（Row Level Security）は全テーブルに必須**。RLSなしのテーブルは作らない
- RLSポリシーの基本形：`auth.uid() = user_id`
- Edge Functionsを使う場合はサービスロールキーをクライアントに渡さない
- マイグレーションは `supabase/migrations/` で管理。直接コンソール変更禁止

## DBスキーマ（Sprint 1 Day 1に確定・以降変更はPRレビュー必須）

### 主要テーブル（えんまさと合意済み）
- `profiles`：ユーザーの生年月日・診断結果（星座/動物/六星/MBTI）
- `diagnoses`：MBTI回答・統合レポートURL・満足度
- `chat_sessions`：チャットセッション・フェーズ状態
- `chat_messages`：チャットメッセージ
- `action_plans`：アクションプラン
- `share_cards`：シェアカードURL・招待リンク
- `analytics_events`：計測イベント

### 【PLACEHOLDER】詳細スキーマ
<!-- ヒラメがここに各テーブルの詳細カラム定義を追記する -->

## 診断ロジック実装ルール（F5専用）

### 星座計算
- 境界日（例：3/21前後）の処理を必ずテストケースに含める
- ライブラリは使わず、定数テーブルで実装

### 動物占い（60アニマル）
- 12動物グループ × 各5分類 = 60キャラクターのルックアップテーブル
- 著作権：公開情報をもとに自社言語で記述。既存コンテンツの転載禁止
- テストケース：既知の有名人10人以上で照合

### 六星占術
- 運命数の計算ロジックはユーティリティ関数として `lib/diagnostics/rokusei.ts` に集約
- 6タイプ（土星人・金星人・火星人・天王星人・木星人・水星人）× 陰陽判定

### 【PLACEHOLDER】計算ロジックの詳細メモ
<!-- ヒラメが把握している計算ロジックの詳細をここに追記する -->

## Clerk 認証（F4）
- ユーザーIDは Clerk の `userId` をそのまま Supabase の `profiles.id` に使用
- Webhook で Clerk の user.created イベントを受けて profiles レコードを初期作成
- 【PLACEHOLDER】Webhook エンドポイントの実装メモをここに追記

## 環境変数（命名規則）
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # サーバーサイドのみ。クライアントに渡すな
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
OPENAI_API_KEY=
GAMMA_API_KEY=
```

## 【PLACEHOLDER】インフラ・監視設定メモ
<!-- ヒラメがVercel・Supabaseの本番設定・監視設定をここに追記する -->
```

</section>

---

<section name="STEP4_DOMAIN_SKILL">

## STEP 4：.claude/skills/cocosil-domain/SKILL.md を生成してください

以下の内容で `.claude/skills/cocosil-domain/SKILL.md` を生成してください。
このスキルは全verb-skillコマンドの親。他のSKILL.mdはここを参照する。

```markdown
---
name: cocosil-domain
description: |
  COCOSiLのプロダクト哲学・UXシーケンス・ドメイン知識を提供するマスタースキル。
  すべてのverb-skillコマンドはこのスキルを読んでから実行すること。

  以下のトリガーで必ず使用すること：
  - チャット・診断・レポートに関わるUI/API実装時
  - UXフローの設計・変更時
  - プロンプト設計時
  - 「COCOSiLらしいか？」の判断が必要な時
---

# COCOSiL ドメインスキル

## プロダクトの存在意義

COCOSiLが解決する問題：**現代の無明**
- 「相手も自分も分からなくて消耗する」状態からの解放
- 東洋的な自己解放の哲学をAIで民主化する

## 絶対に守るUXシーケンス

```
共感 → 安心 → 分析 → 行動
```

### 各フェーズの定義

| フェーズ | ユーザー状態 | AIの役割 | やってはいけないこと |
|---|---|---|---|
| 共感 | 悩みを打ち明ける段階 | 感情を受け取り、承認する | 解決策・診断・アドバイスを先出し |
| 安心 | 「分かってもらえた」と感じる段階 | 「あなたの気持ちは自然です」を伝える | 問題の深刻化・分析への急転換 |
| 分析 | 自分を客観的に見る準備ができた段階 | 性格タイプを使って構造的に説明する | 性格に合わない行動を提案 |
| 行動 | 「やってみよう」と思える段階 | 小さく実行できるアクションを1〜3個提示 | 内向型に「飲み会で積極的に話しかけて」等のNG提案 |

## 4体系の役割分担

| 体系 | 何を測るか | レポートでの使い方 |
|---|---|---|
| MBTI（4文字） | 認知・判断の基本パターン | 思考スタイル・コミュニケーション傾向 |
| 星座（12） | 感情・関係性の傾向 | 対人関係・感情処理スタイル |
| 動物占い（60） | 行動パターン・価値観の細分化 | MBTIとの矛盾の架け橋・行動傾向 |
| 六星占術（12） | 運命サイクル・本来の気質 | 人生観・エネルギーの使い方 |

## 「自分の取扱説明書」というUVP

COCOSiLが生成するのは、ユーザー自身の「自分の取扱説明書」。
- 4体系の矛盾を「複雑さを誤解しない」解釈として提示する
- 弱点を攻撃しない。強みを最大化する視点で設計する
- 「あなたはこういう人だ」ではなく「あなたにはこういう側面がある」という複数性を保つ

## 競合との差別化

| サービス | COCOSiLとの違い |
|---|---|
| 一般占いサービス | COCOSiLは感情処理→自己理解→行動変容の連続体を提供 |
| 通常のAIチャット | COCOSiLは性格タイプでパーソナライズされた共感 |
| MBTI診断サービス | COCOSiLは4体系統合で矛盾を含む複雑さを肯定する |

## アンチパターン集（絶対やらない）

- ❌ 最初のメッセージで占い結果を見せる
- ❌ 「あなたはINFJなので〜してください」という断定的アドバイス
- ❌ 性格タイプと相性が悪い行動を提案する（例：内向型に外向的行動を強要）
- ❌ 統合レポートを診断フォーム直後に即表示する（共感フェーズをスキップ）
- ❌ ユーザーがまだ悩みを話していない段階でアクションプランを出す
```

</section>

---

<section name="STEP5_FRONTEND_SKILL">

## STEP 5：.claude/skills/frontend-nextjs/SKILL.md を生成してください

```markdown
---
name: frontend-nextjs
description: |
  COCOSiLのNext.js App Router実装作法。
  えんまさ担当のF1〜F3実装時に参照。
  cocosil-domainスキルと組み合わせて使う。
---

# COCOSiL フロントエンド実装スキル

## ファイル構造（App Router）

```
app/
├── (auth)/                  # Clerk認証が必要なルート
│   ├── diagnosis/           # F1: MBTI診断
│   │   └── page.tsx
│   ├── report/              # F2: 統合レポート
│   │   └── [id]/page.tsx
│   └── chat/                # F3: 共感AIチャット
│       └── page.tsx
├── (public)/                # 認証不要のルート
│   ├── share/[cardId]/      # SNSシェアカード表示
│   └── page.tsx             # LP
├── api/
│   ├── diagnosis/           # F1 API
│   ├── report/              # F2 API
│   └── chat/                # F3 API（SSEエンドポイント）
└── layout.tsx
```

## チャットUI実装パターン（F3）

### SSEストリーミングの実装
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  
  // OpenAI Streaming
  // フェーズ制御ロジックをここに実装
  
  return new Response(stream.readable, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

### フェーズ状態管理
```typescript
type ChatPhase = 'empathy' | 'reassurance' | 'analysis' | 'action'
// フェーズは必ずこの順序で遷移。逆行禁止。
```

## MBTI診断UI（F1）
- 選択肢は2択のカード型UI
- 選択済み状態は背景色変化で明示（インタビューフィードバック反映）
- スキップボタン：「すでにMBTIタイプを知っている」ユーザー向け

## Gamma API連携パターン（F2）
```typescript
// フォールバック付き実装パターン
try {
  const report = await gammaApi.generate(outline)
  return { type: 'gamma', url: report.url }
} catch (e) {
  // フォールバック：静的HTMLテンプレート
  return { type: 'static', html: generateStaticReport(outline) }
}
```
```

</section>

---

<section name="STEP6_BACKEND_SKILL">

## STEP 6：.claude/skills/backend-supabase/SKILL.md を生成してください

```markdown
---
name: backend-supabase
description: |
  COCOSiLのSupabase実装作法。
  ヒラメ担当のF4〜F7実装時に参照。
  RLS・スキーマ管理・診断計算ロジックのガイドライン。
---

# COCOSiL バックエンド実装スキル

## RLSポリシーの基本パターン

```sql
-- 全テーブル共通：自分のデータしか読めない
CREATE POLICY "users_own_data" ON profiles
  FOR ALL USING (auth.uid()::text = id::text);

-- chat_messagesはセッション経由
CREATE POLICY "chat_messages_via_session" ON chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()::text
    )
  );
```

## 診断計算ロジックの配置

```
lib/
├── diagnostics/
│   ├── zodiac.ts          # 星座計算（境界日処理含む）
│   ├── animal.ts          # 動物占い60アニマル（ルックアップテーブル）
│   ├── rokusei.ts         # 六星占術（運命数計算）
│   └── index.ts           # 3つをまとめてcalculateAll()を公開
```

## マイグレーション管理

```bash
# 新しいマイグレーション作成
supabase migration new [description]

# ローカル反映
supabase db reset

# 本番反映（確認してから）
supabase db push
```

## 環境変数チェックリスト
- [ ] SUPABASE_SERVICE_ROLE_KEY はサーバーサイドのみ
- [ ] CLERK_WEBHOOK_SECRET は Webhook エンドポイントで検証
- [ ] 全キーは Vercel 環境変数に設定（ローカルの .env.local はgit管理外）
```

</section>

---

<section name="STEP7_VERB_SKILLS">

## STEP 7〜11：verb-skill コマンドファイルを生成してください

### 7-1：.claude/commands/cocosil-setup.md

```markdown
# /cocosil-setup — 新機能開発の初期化

## 使い方
新しいF番号機能の開発を開始するとき、最初に実行する。

## 実行前に確認すること
1. cocosil-domain スキルを読んだか？
2. CLAUDE.md（共通）を読んだか？
3. 自分の担当F番号を確認したか？

## 実行手順
1. PLANS.md に今スプリントのタスクが記載されているか確認
2. 担当F番号のブランチを作成：`git checkout -b feature/F[番号]-[機能名]`
3. 担当機能の受け入れ条件を PLANS.md に追記
4. 実装開始前に「何を作るか」をTodoWriteで宣言

## 注意
- 担当外のF番号に関連するファイルへのWriteは禁止
- 共通ファイル（/CLAUDE.md, /schema.sql）の変更はユーザー確認を取ること
```

### 7-2：.claude/commands/cocosil-plan.md

```markdown
# /cocosil-plan — Sprint計画・受け入れ条件の定義

## 使い方
スプリント開始時、または大きな機能追加の前に実行する。

## PLANS.md の必須セクション

```
## Sprint [N] 計画
### 担当：[えんまさ or ヒラメ]
### 機能：[F番号] [機能名]

### 受け入れ条件
- [ ] 機能が動作する
- [ ] UXシーケンス（共感→安心→分析→行動）の順序が守られている
- [ ] RLSが全テーブルに設定されている
- [ ] TypeScriptエラーゼロ
- [ ] モバイル表示（375px）で崩れない

### 外部API制約メモ
- Gamma API: [rate limit / cost の最新情報を記載]
- OpenAI: [使用モデル・コスト試算]

### 完了条件
- [ ] /cocosil-review を実行してパスした
- [ ] 相手（えんまさ or ヒラメ）にレビュー依頼した
```

## コンテキスト節約
- コンテキストが70%を超えたら、このコマンドを使ってPLANS.mdを更新し、/compactを実行する
```

### 7-3：.claude/commands/cocosil-work.md

```markdown
# /cocosil-work — 実装実行

## 実行前チェック（必ず確認）
1. [ ] 現在のブランチは `feature/F[自分の番号]-[機能名]` か？
2. [ ] cocosil-domain スキルを読んだか？
3. [ ] PLANS.md の受け入れ条件を確認したか？
4. [ ] コンテキストは70%未満か？（超えている場合は /compact してから）

## 🚨 担当ガード（絶対厳守）

### えんまさ（F1〜F3）が触れるファイル
```
app/(auth)/diagnosis/**, app/(auth)/report/**, app/(auth)/chat/**
app/api/diagnosis/**, app/api/report/**, app/api/chat/**
components/diagnosis/**, components/report/**, components/chat/**
lib/prompts/**, lib/gamma/**
types/diagnosis.ts, types/report.ts, types/chat.ts
```

### ヒラメ（F4〜F7）が触れるファイル
```
app/(auth)/onboarding/**, app/(public)/share/**
app/api/auth/**, app/api/share/**, app/api/analytics/**
supabase/migrations/**, supabase/functions/**
lib/diagnostics/**, lib/clerk/**
middleware.ts, vercel.json
```

### 両者が触れる共通ファイル（変更時はユーザー確認必須）
```
/CLAUDE.md, schema.sql, package.json, .env.example
```

## 実装品質基準
- TypeScript `any` 禁止
- `console.log` はデバッグ用のみ（コミット前に削除）
- コメントは「何をしているか」ではなく「なぜそうしているか」を書く
- COCOSiLの鉄則（UXシーケンス）に反する実装を発見したら即報告
```

### 7-4：.claude/commands/cocosil-review.md

```markdown
# /cocosil-review — PRレビュー・品質チェック

## レビュー4点チェック

### 1. UXシーケンス準拠チェック ✅
- [ ] 共感→安心→分析→行動の順序が守られているか
- [ ] 分析結果の先出しUIがないか
- [ ] 性格タイプに合わないアドバイスが生成されるロジックがないか

### 2. 型安全チェック ✅
- [ ] TypeScript エラーゼロ（`tsc --noEmit` でパス）
- [ ] `any` が使われていないか
- [ ] APIレスポンスの型が `types/api/` に定義されているか

### 3. RLS・セキュリティチェック ✅（バックエンド変更がある場合）
- [ ] 新規テーブルにRLSが設定されているか
- [ ] `SUPABASE_SERVICE_ROLE_KEY` がクライアントサイドに漏れていないか
- [ ] Clerk認証バイパスの抜け穴がないか

### 4. コンテキスト・コスト確認 ✅
- [ ] Gamma APIのrate limit・コスト試算をPLANS.mdに記録したか
- [ ] OpenAI APIの使用トークン見積もりをPLANS.mdに記録したか
- [ ] フォールバック実装があるか（Gamma API障害時）

## 自動チェックコマンド
```bash
npx tsc --noEmit          # 型チェック
npx eslint . --ext .ts,.tsx  # Lint
npx vitest run            # ユニットテスト
```

## レビュー完了条件
上記4点が全てチェック済みで、自動チェックが全てパスしたらレビュー完了。
相手（えんまさ or ヒラメ）にGitHubでレビュー依頼を出す。
```

### 7-5：.claude/commands/cocosil-release.md

```markdown
# /cocosil-release — リリース・CHANGELOG生成

## 実行手順

1. **受け入れ条件の確認**
   PLANS.md の全チェックボックスが ✅ になっているか確認

2. **CHANGELOG.md の更新**
   ```markdown
   ## [vX.Y.Z] - YYYY-MM-DD
   ### 追加
   - F[番号] [機能名]：[変更内容の要約]
   ### 修正
   - （バグ修正があれば）
   ```

3. **バージョンタグ付け**
   ```bash
   git tag -a v[version] -m "F[番号] [機能名] リリース"
   git push origin v[version]
   ```

4. **PLANS.md の完了マーク**
   該当スプリントを `[完了] Sprint N - YYYY-MM-DD` に更新

5. **次のスプリントの準備**
   /cocosil-plan を実行して次のPLANS.mdを作成

## リリース品質基準
- /cocosil-review が完了している
- 本番Vercelでの動作確認済み
- えんまさ + ヒラメ 両者が確認済み
```

</section>

---

<section name="STEP12_PLANS_MD">

## STEP 12：PLANS.md を生成してください

```markdown
# COCOSiL v2 — Sprint計画書

## 現在のスプリント：Sprint 1

### テーマ：基盤構築 + MBTI診断（F1）+ 生年月日診断基盤（F4・F5）

---

### えんまさ担当タスク（F1）

受け入れ条件：
- [ ] MBTI診断（8〜12問）のUIが動作する
- [ ] 4軸スコアでMBTIタイプが判定される
- [ ] 「すでにタイプを知っている」スキップボタンが機能する
- [ ] 選択済み状態のUIが明確（背景色変化）
- [ ] MBTIタイプがSupabaseのprofilesに保存される
- [ ] UXシーケンスチェック：診断完了後に統合レポートへ誘導する（共感フェーズを先に入れる）

---

### ヒラメ担当タスク（F4・F5・F7）

受け入れ条件：
- [ ] Clerk Google SSO が動作する
- [ ] 初回ログイン後に生年月日入力画面が表示される
- [ ] 生年月日から星座・動物占い（60アニマル）・六星占術が自動計算される
- [ ] 計算結果がprofilesテーブルに保存される
- [ ] テストケース：既知の有名人10人以上で計算結果を照合済み
- [ ] Vercel + Supabase の本番環境が構築済み

---

### 共有インターフェース（Sprint 1 Day 1に確定する）

- [ ] DBスキーマ全テーブル定義（確定後は凍結）
- [ ] API契約書（エンドポイントI/F）
- [ ] 環境変数命名規則
- [ ] Gitブランチ戦略

---

### 外部API制約メモ
<!-- Sprint進行中に更新する -->
- Gamma API: [rate limit・コスト・レイテンシ → 要確認]
- OpenAI API: [使用モデル: gpt-4o・コスト試算 → 要記入]

---

### Sprint 1 完了条件
> ユーザーがログインし、生年月日で3診断が自動計算され、MBTI診断を完了できる。

---

## 次のスプリント：Sprint 2（予告）
テーマ：統合レポート（F2）+ SNSシェアカード（F6）
```

</section>

---

<section name="STEP13_CONTRIBUTING">

## STEP 13：CONTRIBUTING.md を生成してください

```markdown
# COCOSiL v2 — 開発参加ガイド

## セットアップ手順

```bash
# 1. リポジトリのクローン
git clone [repository-url]
cd cocosil-v2

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.example .env.local
# .env.local に各APIキーを設定（ヒラメから共有）

# 4. Supabase ローカル起動
supabase start

# 5. DBマイグレーション適用
supabase db reset

# 6. 開発サーバー起動
npm run dev
```

## 担当ルールの確認

このプロジェクトは機能別に作業領域を分離しています。
**自分の担当F番号以外のファイルは原則変更しない。**

- えんまさ → F1〜F3（`/app/(auth)/diagnosis`, `/report`, `/chat` 等）
- ヒラメ → F4〜F7（`/supabase`, `/lib/diagnostics`, `middleware.ts` 等）

詳細は `/CLAUDE.md` および各担当者の `CLAUDE.md` を参照。

## verb-skillコマンドの使い方

Claude Code で作業する際は以下のコマンドを使う：

| 場面 | コマンド |
|---|---|
| 機能開発を始める | `/cocosil-setup` |
| Sprint計画を立てる | `/cocosil-plan` |
| 実装する | `/cocosil-work` |
| PRレビューする | `/cocosil-review` |
| リリースする | `/cocosil-release` |

コマンド詳細は `.claude/commands/` を参照。

## PRルール

- ブランチ名：`feature/F[番号]-[機能の短い説明]`
- PR説明には受け入れ条件のチェックリストを貼る
- /cocosil-review の4点チェックが完了してからレビュー依頼
- マージには相手（えんまさ or ヒラメ）の Approve が必要

## コミットメッセージ規約

```
feat(F1): MBTI診断の選択済みUI改善
fix(F3): フェーズ遷移のタイミングバグ修正
chore: PLANS.mdのSprint 2計画追加
docs: CONTRIBUTING.mdの更新
```

## 困ったとき

1. まず `/CLAUDE.md` を読む
2. 該当スキルファイル（`.claude/skills/`）を読む
3. `PLANS.md` の「外部API制約メモ」を確認する
4. ヒラメ or えんまさに Slack で聞く
```

</section>

---

<section name="STEP14_VALIDATION">

## STEP 14：自己評価チェックリストを実行してください

全ファイルの生成が完了したら、以下のチェックリストを1項目ずつ評価してください。

### チェックリスト

| # | 確認項目 | OK/NG |
|---|---|---|
| 1 | /CLAUDE.md にUXシーケンス（共感→安心→分析→行動）が明記されているか | |
| 2 | /CLAUDE.md にえんまさ/ヒラメの担当F番号が正確に記載されているか | |
| 3 | /frontend/CLAUDE.md がえんまさのClaude専用の内容になっているか | |
| 4 | /backend/CLAUDE.md にヒラメ用PLACEHOLDERが適切に配置されているか | |
| 5 | cocosil-domain/SKILL.md にアンチパターン集が含まれているか | |
| 6 | 5つのverb-skillコマンドファイルが全て生成されているか | |
| 7 | cocosil-work.md に担当ガード（触れるファイルの明示）があるか | |
| 8 | PLANS.md にSprint 1の受け入れ条件が記載されているか | |
| 9 | CONTRIBUTING.md にセットアップ手順とコマンド一覧があるか | |
| 10 | 全ファイルで担当外F番号ファイルへの書き込み禁止が徹底されているか | |

### 評価基準
- 10/10：完璧。ヒラメへの引き継ぎ準備完了と報告する
- 8〜9/10：軽微な不足あり。該当箇所を修正してから完了報告
- 7以下：重大な不足あり。NGの項目を修正してから再評価する

評価結果と「次にえんまさがやること」を最後に報告してください。

</section>

</project_init>

---PROMPT END---

---

## 実行後に生成されるファイル一覧

```
cocosil-v2/
├── CLAUDE.md                              ← 共通憲法（両者読む）
├── PLANS.md                               ← Sprint計画書
├── CONTRIBUTING.md                        ← ヒラメ引き継ぎガイド
├── frontend/
│   └── CLAUDE.md                          ← えんまさのClaude専用
├── backend/
│   └── CLAUDE.md                          ← ヒラメのClaude専用（PLACEHOLDER付き）
└── .claude/
    ├── skills/
    │   ├── cocosil-domain/
    │   │   └── SKILL.md                   ← 全スキルの親・COCOSiL哲学
    │   ├── frontend-nextjs/
    │   │   └── SKILL.md                   ← Next.js App Router作法
    │   └── backend-supabase/
    │       └── SKILL.md                   ← Supabase RLS・診断ロジック作法
    └── commands/
        ├── cocosil-setup.md               ← /cocosil-setup
        ├── cocosil-plan.md                ← /cocosil-plan
        ├── cocosil-work.md                ← /cocosil-work（担当ガード付き）
        ├── cocosil-review.md              ← /cocosil-review（4点チェック）
        └── cocosil-release.md             ← /cocosil-release
```

## ヒラメへの引き継ぎ手順

1. このリポジトリをヒラメに共有
2. ヒラメは `/backend/CLAUDE.md` の `【PLACEHOLDER】` 箇所に詳細を追記
3. Sprint 1 Day 1 に 2人で `/PLANS.md` の共有インターフェースセクションを確定する
4. 以降は各自が担当F番号ブランチで `/cocosil-work` を使って実装する
