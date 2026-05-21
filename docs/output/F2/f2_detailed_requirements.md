# [F2] 性格分析・自動診断 詳細要件定義書

> **バージョン**: v1.0  
> **作成日**: 2026-05-17  
> **担当**: ヒラメ（バックエンド）・まあみ（フロントUI）・えんまさ（コンテンツ承認）  
> **参照要件**: [cocosil_v2_detailed_requirements_specification.md §4.2](../requirements/cocosil_v2_detailed_requirements_specification.md)  
> **関連タスク**: [TSK-UI-001](../tasks/TSK-UI-001-f2-ui-component-design.md)・[TSK-DB-001](../tasks/TSK-DB-001-db-schema-cleanup.md)

---

## 1. プロジェクト概要

COCOSiL（ココシル）の機能 F2「性格分析・自動診断」は、ユーザーの生年月日から3体系（西洋12星座・動物性格診断60アニマル・六星占術）を自動算出し、MBTI簡易診断（12問選択式）を通じて4体系の診断データを完成させる機能である。

F2で生成されるデータは、後続のすべての機能（F3統合レポート・F4共感AIチャット・F5アクション記録）の**入力素材**となる。COCOSiLの設計哲学「自己理解による解放」を実現するための起点であり、4体系統合という差別化要素の技術的基盤を担う。

F1（オンボーディング）で収集した生年月日を受け取り、非同期で3体系を算出する。MBTIはスキップ可能（後から診断可）とし、診断完了後に F3統合レポートへ遷移する。

---

## 2. ビジネス要件

- **対象課題**: 自分の性格を知りたいが、複数の診断ツールをバラバラに試す手間がかかる。単体診断では「自分は本当にこれでいいのか」という不安が残る。
- **提供価値（Value Proposition）**: 生年月日1つ入力するだけで、東洋×西洋×AI統合の4体系診断が即時完了し、「複数の視点から見た自分」を一度に知ることができる。
- **主要KPI / KGI**:
  - 診断完了率: **70%以上**（F1完了後、MBTIをスキップ含め4体系確定まで離脱しない割合）
  - 3体系自動算出の成功率: **99.9%以上**（バリデーション通過後の算出エラー率 0.1%以下）
  - MBTIスキップ率: 計測対象（閾値未定。スキップ率が50%超の場合、質問数・UIを見直す）
- **競合優位性**:
  - **Cornered Resource（希少資産）**: 60アニマル診断（動物性格診断）は自社実装の独自ナレッジベース。競合がすぐに複製できない体系数と統合深度がある。
  - **Counter-Positioning（対抗ポジション）**: 「占い」として消費させずに「根拠のある性格分析」として再定義。F2.4（哲学的根拠表示）により、スピリチュアル系競合との認知上の差別化を図る。

---

## 3. ユーザー要件

- **ターゲットユーザー**: 職場の人間関係にストレスを抱える25-35歳の若手社会人
- **ペルソナ**:
  - **名前 / 属性**: りこ（27歳・営業職・入社4年目）
  - **典型的な行動パターン**:
    - 昼休みにスマホで「MBTI診断」や「星座性格」を調べる
    - SNSのMBTI投稿を見て「私はINFJらしい」と認識しているが確信がない
    - 診断ツールを複数試すが「結局どれが正しいの？」と迷う
  - **抱えている課題・痛み**:
    - 長い診断テスト（50問以上）は途中で離脱してしまう
    - 診断結果が体感と合わないことがある（「私こんなに外向的じゃないのに」）
    - MBTIだけでは「なぜ〇〇さんと合わないのか」が分からない
  - **このプロダクトに期待すること**:
    - 生年月日を入れるだけで自動算出されることへの「ラクさ」
    - 4体系が揃うことで「別の視点でも同じ傾向が出た」という腑落ち感
    - 診断結果が「なぜこの4体系なのか」を説明してくれること（信頼の根拠）
- **MVPの定義**: 生年月日入力→3体系自動算出→MBTI診断（またはスキップ）→診断結果保存→F3統合レポート遷移、の一連フローが途切れなく動くこと。

---

## 4. 機能要件詳細

### 4.1. F2.1 生年月日からの3体系自動算出

- **概要**: F1.2で入力・保存された `birth_date`（YYYY-MM-DD）をトリガーに、3体系（星座・動物性格診断・六星占術）をサーバーサイドで非同期算出し、Supabaseへ保存する。UIへの直接出力は行わず、F3・F4の入力素材とする。
- **担当**: ヒラメ（バックエンドのみ・UIなし）
- **対応Stage 1要件**: F2.1 / F2.1a / F2.1b / F2.1c
- **実行タイミング**: 生年月日入力完了後、バックグラウンドで非同期実行（ユーザーを待たせない）
- **入力**: `birth_date: string` (YYYY-MM-DD)
- **保存先**: Supabase `diagnoses` テーブル

#### 業務フロー（正常系）

1. F1.2でユーザーが生年月日を入力し、Zod バリデーション通過
2. バックグラウンドで `POST /api/diagnosis/auto-calc` を非同期呼び出し
3. サーバーサイドで3体系を順次算出（星座 → 動物 → 六星）
4. 算出結果を `diagnoses` テーブルに `upsert`（user_idで1件のみ保持）
5. 完了をコール元に返す（フロントは待機しない。F3レポート生成時に参照）

#### 例外系 / エラーフロー

| ケース | 対処 |
|--------|------|
| 未来日付 | `ValidationError` — Zodスキーマ（F1.2）で事前に弾く。本APIには届かない |
| 1930年以前 / 2030年以降 | `ValidationError` — 運命数DBの対応範囲外（`destiny-number-database.ts` は 1930〜2030年）。Zodスキーマで事前に弾く |
| 閏年2月29日 | 有効。各体系で通常通り処理 |
| 算出ロジック例外（予期せぬエラー） | 該当カラムを `null` 保存。「未設定」として扱い、手動補正導線を保持 |
| Supabase接続エラー | リトライ不要。エラーログのみ記録。F3レポート生成時に `null` として扱う |

---

#### F2.1a 星座算出

| 項目 | 仕様 |
|------|------|
| 判定キー | 月・日のみ（年は不使用） |
| 出力 | `zodiac_sign: string`（例: `"乙女座"`） |
| 分類数 | 12種 |
| カスプ日の扱い | 境界日は後の星座に振り分け（時刻補正なし） |
| 実装ファイル | `lib/diagnostics/zodiac.ts`（新規作成） |

**12星座日付範囲**:

| 星座 | 開始（月/日） | 終了（月/日） |
|------|------------|------------|
| 牡羊座 | 3/21 | 4/19 |
| 牡牛座 | 4/20 | 5/20 |
| 双子座 | 5/21 | 6/21 |
| 蟹座 | 6/22 | 7/22 |
| 獅子座 | 7/23 | 8/22 |
| 乙女座 | 8/23 | 9/22 |
| 天秤座 | 9/23 | 10/23 |
| 蠍座 | 10/24 | 11/21 |
| 射手座 | 11/22 | 12/21 |
| 山羊座 | 12/22 | 1/19 |
| 水瓶座 | 1/20 | 2/18 |
| 魚座 | 2/19 | 3/20 |

> ⚠️ **UIコピー注意**: 「星座」のみ使用可。「占星術」は禁止語（`lib/constitution/banned-words.ts`）。

---

#### F2.1b 動物性格診断（60アニマル）算出

| 項目 | 仕様 |
|------|------|
| 判定キー | 年・月・日すべて使用（Excelシリアル値ベース） |
| 出力 | `animal_type: string`（例: `"こじか"`）、`animal_character: string`（例: `"旅人こじか"`） |
| 分類数 | 12動物 × 5タイプ = 60アニマル |
| 実装ファイル | `lib/diagnostics/animal.ts`（算出ロジックを移植） |
| ナレッジデータ | `lib/data/animal-characters.ts`（`ANIMAL_60_CHARACTERS` を移植） |
| 参照元 | `docs/input/fortune_calculate/precision-calculator.ts`（関数 `calculate60AnimalCharacter` / 定数 `ANIMAL_60_CHARACTERS`） |

**算出アルゴリズム**（`precision-calculator.ts` `calculate60AnimalCharacter` より）:

1. 生年月日から Excel シリアル値を算出（1900年1月1日基準・うるう年バグ補正込み）
2. 動物番号 = `(serialValue + 8) % 60 + 1`（1〜60）
3. `ANIMAL_60_CHARACTERS[animalNumber]` から `baseAnimal`・`character`・`color` を取得

> ⚠️ **著作権注意**: 動物性格診断のデータ構造は公開情報から自主構成するが、**法人設立後に弁護士確認必須**。法的確認前は外部公開しない前提で実装（v1.3 §8リスク継承）。  
> ⚠️ **UIコピー注意**: 「動物性格診断」「60アニマル診断」使用可。「動物占い」は禁止語。

---

#### F2.1c 六星占術算出

| 項目 | 仕様 |
|------|------|
| 判定キー | 年・月・日すべて使用 |
| 出力 | `six_star: string`（例: `"土星人(+)"`) |
| 分類数 | 6星 × 陰陽 = 12分類 |
| 実装ファイル | `lib/diagnostics/six-star.ts`（算出ロジックを移植） |
| 運命数DB | `lib/data/destiny-number-database.ts`（`DESTINY_NUMBER_DATABASE` を移植） |
| 参照元 | `docs/input/fortune_calculate/precision-calculator.ts`（関数 `calculateSixStar`）・`docs/input/fortune_calculate/destiny-number-database.ts`（運命数テーブル 1930〜2030年・1212エントリ） |

**算出アルゴリズム**（`precision-calculator.ts` `calculateSixStar` より）:

1. 運命数DB（`DESTINY_NUMBER_DATABASE`）から `(year, month)` で運命数を取得
2. 星番号 = `(destinyNumber - 1) + day`（> 60 の場合は 60 を引く）
3. 星番号 1〜10→土星人 / 11〜20→金星人 / 21〜30→火星人 / 31〜40→天王星人 / 41〜50→木星人 / 51〜60→水星人
4. 陰陽判定: 偶数年 → `(+)` / 奇数年 → `(-)`

**対応年度範囲**: 1930〜2030年（運命数DBの収録範囲）

**12分類**:

| 星 | 陽 | 陰 |
|----|----|----|
| 土星人 | 土星人(+) | 土星人(-) |
| 金星人 | 金星人(+) | 金星人(-) |
| 火星人 | 火星人(+) | 火星人(-) |
| 天王星人 | 天王星人(+) | 天王星人(-) |
| 木星人 | 木星人(+) | 木星人(-) |
| 水星人 | 水星人(+) | 水星人(-) |

> ⚠️ **UIコピー注意**: 「六星占術」または「生年月日ベースの性格診断」使用可。

---

### 4.2. F2.2 MBTI簡易診断（12問・スキップ可）

- **概要**: 選択式12問（5段階リッカート尺度）でMBTIタイプを簡易判定する。スキップ（自己申告選択）も可能。**実装済み**（`app/diagnosis/mbti/`）。
- **担当**: まあみ（UIコンポーネント改良）・ヒラメ（API・DB）
- **対応Stage 1要件**: F2.2
- **実装ステータス**: ✅ コア実装済み（TSK-UI-001で改良中）

#### 業務フロー（正常系）

1. 3体系自動算出の非同期実行と並行して、ユーザーをMBTI診断ページへ遷移
2. 12問（各軸3問 × 4軸）を1問ずつ表示（進行状況バー付き）
3. 全問回答完了後、`POST /api/diagnosis/mbti` でスコア算出・DB保存
4. 診断完了 → F2.3保存 → F3統合レポートページへ自動遷移

#### 例外系 / エラーフロー

| ケース | 対処 |
|--------|------|
| スキップ選択 | 16タイプ一覧からユーザーが直接選択。`directType`パラメータでAPI呼び出し。PCI=0として保存 |
| 途中で通信エラー | エラーメッセージ表示・リトライ導線。回答は一時的にローカルステートで保持 |
| MBTI後から診断 | 「未設定」状態でF3へ進むことができる。プロフィール画面からいつでも診断可 |

#### 判定ロジック仕様

| 項目 | 仕様 |
|------|------|
| 問題数 | 12問（各軸3問: positive 2問 + reverse 1問） |
| スコアリング | positive: そのまま加算 / reverse: 6 - value で反転加算 |
| 各軸合計範囲 | 3〜15（中央値=9） |
| タイプ判定 | 合計 > 9 → 第一極(E/S/T/J)、合計 ≦ 9 → 第二極(I/N/F/P)（同点はI/N/F/P） |
| PCI算出 | `|合計 - 9| / 6 × 100`（0〜100%） |
| 実装ファイル | `app/diagnosis/mbti/logic.ts`（実装済み） |

> 設計根拠: [MBTI簡易診断のベストプラクティス調査](../F1/MBTI簡易診断のベストプラクティス調査.md)

---

### 4.3. F2.3 診断結果の内部保存と参照API

- **概要**: MBTI診断結果（`mbti_results`テーブル）と3体系自動算出結果（`diagnoses`テーブル）をSupabaseへ保存し、F3・F4から参照可能なAPIを提供する。
- **担当**: ヒラメ（バックエンド）
- **対応Stage 1要件**: F2.3

#### DBスキーマ設計方針

| テーブル | 用途 | 現状 |
|--------|------|------|
| `mbti_results` | MBTI診断結果（type・scores・pci・answers） | ✅ 実装済み（migration適用済み） |
| `diagnoses` | 3体系自動算出結果（zodiac / animal / six_star） | ❌ 未実装（要migration追加） |

**`diagnoses` テーブル設計（案）**:

```sql
CREATE TABLE IF NOT EXISTS diagnoses (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT        NOT NULL,  -- Clerk user_id
  zodiac_sign    TEXT,                  -- 星座（null = 算出失敗）
  animal_type    TEXT,                  -- 動物タイプ（null = 算出失敗）
  animal_character TEXT,               -- 動物キャラクター（null = 算出失敗）
  six_star       TEXT,                  -- 六星占術（null = 算出失敗）
  calculated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT diagnoses_user_id_unique UNIQUE (user_id)  -- 1ユーザー1レコード（upsert）
);

-- RLS
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own diagnoses" ON diagnoses
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can insert own diagnoses" ON diagnoses
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can update own diagnoses" ON diagnoses
  FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));
```

> ⚠️ **Layer 1保護**: `supabase db push` はhookでブロックされる。Supabase Dashboard SQL Editorから手動適用すること（AGENTS.md §7）。

#### APIエンドポイント設計

| エンドポイント | メソッド | 用途 | 担当 |
|------------|--------|------|------|
| `POST /api/diagnosis/mbti` | POST | MBTI診断結果保存 | ✅ 実装済み |
| `POST /api/diagnosis/auto-calc` | POST | 3体系自動算出・保存 | ❌ 未実装 |
| `GET /api/diagnosis` | GET | 全診断結果取得（F3・F4用） | ❌ 未実装 |

**`GET /api/diagnosis` レスポンス型（案）**:

```typescript
interface DiagnosisAllResult {
  mbti: {
    mbtiType: string;    // "INFJ"
    pci: MbtiPCI;       // 各軸の明瞭性指数
  } | null;
  zodiacSign: string | null;      // "乙女座"
  animalType: string | null;      // "こじか"
  animalCharacter: string | null; // "旅人こじか"
  sixStar: string | null;         // "土星人(+)"
}
```

---

### 4.4. F2.4 4体系の哲学的根拠表示

- **概要**: 診断結果画面の各体系名の横に「？」アイコンを設置し、タップでアコーディオン展開。「なぜこの4体系か」「東洋×西洋×AI統合の根拠」をユーザーが自発的に知れるようにする。
- **担当**: まあみ（UIコンポーネント）・えんまさ（コンテンツ設計・Gate 2承認）
- **対応Stage 1要件**: F2.4
- **実装ステータス**: ❌ 未実装

#### UI仕様

| 項目 | 仕様 |
|------|------|
| トリガー | 各体系名横の「？」アイコンタップ |
| 展開方式 | アコーディオン（CSSトランジション。1つ展開で他は閉じる） |
| コンテンツ長 | 200〜300文字（えんまさが設計） |
| 設置場所 | 診断結果ページ（F2診断完了後の結果確認画面） |

#### 各体系の根拠テキスト（えんまさ設計・要Gate 2承認）

| 体系 | コンテンツの方向性（えんまさ承認前の仮案） |
|------|----------------------------------------|
| MBTI | カール・ユングの心理類型論に基づく4軸フレームワーク。職場のコミュニケーション研究で広く活用されている理由 |
| 星座 | 西洋天文学の歴史と季節パターン研究。科学的根拠ではなく「共通言語として機能する文化的コード」という位置づけ |
| 動物性格診断 | 干支・陰陽五行思想を現代向けに再解釈した東洋的人格分類。60パターンの細分化が「自分だけの傾向」を見つけやすくする |
| 六星占術 | 生年月日の数値パターンから性格傾向を導く命数学。東洋哲学の「気質の循環」概念を数値化したもの |

> ⚠️ **Gate 2必須**: F2.4のUIコピー（根拠テキスト）はえんまさ承認後にのみ本番適用可能。

---

## 5. 非機能要件

| カテゴリ | 要件 | 目標値 | 根拠 |
|--------|------|--------|------|
| **パフォーマンス** | 3体系算出API（`auto-calc`）レスポンスタイム | 500ms以内 | バックグラウンド実行なのでユーザーは待たないが、F3生成前までに完了が必要 |
| **パフォーマンス** | MBTI診断 画面遷移・次問表示 | 200ms以内 | スムーズな診断体験の維持 |
| **パフォーマンス** | MBTI APIレスポンスタイム（保存処理） | 2秒以内 | UX断絶を防ぐ |
| **可用性** | 3体系算出の成功率 | 99.9%以上 | バリデーション通過後の算出エラーは許容しない |
| **セキュリティ** | `diagnoses` テーブルのRLS | `user_id = auth.jwt() ->> 'sub'` | IDOR防御（AGENTS.md Gate 1） |
| **セキュリティ** | `mbti_results` テーブルのRLS | 適用済み（migration確認済み） | — |
| **保守性** | 診断ロジックとデータの分離 | `lib/diagnostics/` + `lib/data/` 構成 | 体系追加・変更が容易 |
| **UI/UX** | スマホ表示（375px）での正常表示 | 崩れなし | COCOSiLのプライマリデバイスはスマホ |
| **UI/UX** | MBTIスキップ導線の可視性 | 初期画面で確認できる | スキップ率計測のため常時表示 |
| **言語** | UIコピーの禁止語彙チェック | 占い・鑑定・運勢・動物占い・占星術を含まない | `lib/constitution/banned-words.ts` |

---

## 6. インテグレーション要件

1. **Supabase（PostgreSQL）**:
   - **用途**: `diagnoses`（3体系結果）・`mbti_results`（MBTI結果）の永続化
   - **連携方式**: `@supabase/ssr` + Supabase JS Client
   - **認証方式**: Clerk JWT（`auth.jwt() ->> 'sub'` でuser_id照合）
   - **RLS**: 全テーブルに適用。`user_id = auth.jwt() ->> 'sub'` が必須

2. **Clerk（認証）**:
   - **用途**: ユーザー識別（`user_id`の取得）
   - **連携方式**: API Route ハンドラ内で `auth()` を直接呼び出してJWT取得（`"use server"` Server Action は使用しない）
   - **注意**: `request.headers` からの直接JWT読み取り禁止（AGENTS.md Gate 1）

3. **PostHog（テレメトリ）**:
   - **用途**: 診断完了イベント計測（`mbti_diagnosis_saved`は既存実装済み）
   - **追加イベント案**: `auto_calc_completed`（3体系算出完了）・`mbti_skipped`（スキップ選択）
   - **連携方式**: `lib/telemetry/client.ts` 経由

4. **F3統合レポート（内部連携）**:
   - **用途**: `GET /api/diagnosis` で全診断結果を取得し、レポート生成プロンプトへ注入
   - **前提条件**: F2完了（3体系 + MBTI or スキップ）後にF3生成可能

---

## 7. 技術選定とアーキテクチャ

- **フレームワーク**: Next.js 16（App Router必須）
- **フロントエンド**: React（Server Components優先）、Tailwind CSS 4、TypeScript 5
- **バックエンドAPI**: Next.js API Routes（Edge Runtime / Node.js Runtime）
- **データベース**: Supabase（PostgreSQL）。型定義は `pnpm db:types` で生成
- **認証**: Clerk（JWT連携）
- **状態管理**: サーバーサイドで完結。クライアント側状態は最小限（MBTI回答の一時保持のみ）
- **バリデーション**: `zod/v4`（`import { z } from 'zod/v4'`）
- **環境変数**: `@/lib/env` 経由のみ。`process.env` 直接参照禁止

#### アーキテクチャ方針

| 方針 | 詳細 |
|------|------|
| Server Component優先 | `'use client'` は `MbtiQuizForm` など本当にインタラクティブな部分のみ |
| API-First | `GET /api/diagnosis` の型定義を先に確定してからUI実装 |
| バックグラウンド算出 | 3体系算出はUIをブロックしない非同期実行 |
| Upsert戦略 | `diagnoses` は `user_id` でUNIQUE制約。再診断時も1レコードのみ保持 |
| `lib/diagnostics/` 分離 | 算出ロジックはPure Functionとして実装。Vitestでの単体テストが可能 |

#### ファイル構成（目標状態）

```
app/
  ├── api/
  │   └── diagnosis/
  │       ├── mbti/route.ts         ✅ 実装済み
  │       ├── auto-calc/route.ts    ❌ 新規作成
  │       └── route.ts              ❌ 新規作成（全診断結果取得）
  └── (auth)/
      └── diagnosis/
          ├── page.tsx              🟡 改良中（TSK-UI-001）
          └── result/page.tsx       ❌ 新規作成

components/
  └── diagnosis/
      ├── MbtiQuizForm.tsx          🟡 改良中
      ├── DiagnosisResultCard.tsx   ❌ 新規作成
      ├── AutoCalcResultBadge.tsx   ❌ 新規作成
      ├── DiagnosisProgress.tsx     ❌ 新規作成
      └── PhilosophyAccordion.tsx   ❌ 新規作成（F2.4）

lib/
  ├── diagnostics/
  │   ├── zodiac.ts                 ❌ 新規作成（F2.1a・precision-calculatorから移植）
  │   ├── animal.ts                 ❌ 新規作成（F2.1b・precision-calculatorから移植）
  │   └── six-star.ts               ❌ 新規作成（F2.1c・precision-calculatorから移植）
  └── data/
      ├── animal-characters.ts      ❌ 新規作成（ANIMAL_60_CHARACTERSを移植・著作権確認後）
      └── destiny-number-database.ts ❌ 新規作成（DESTINY_NUMBER_DATABASEを移植）

docs/input/fortune_calculate/           ← 算出ロジック参照元（読み取り専用）
  ├── precision-calculator.ts           ← 星座・動物・六星の計算エンジン v3.0
  └── destiny-number-database.ts        ← 運命数テーブル（1930-2030年）

supabase/migrations/
  └── YYYYMMDD_diagnoses_table.sql  ❌ 新規作成（手動適用）
```

---

## 8. 開発プロセス / スケジュール

**担当体制**:

| 担当 | 作業範囲 |
|------|---------|
| ヒラメ | 3体系算出ロジック（`lib/diagnostics/`）、`diagnoses`テーブルmigration、API実装 |
| まあみ | MBTI診断UIコンポーネント改良、診断結果カード、F2.4アコーディオンUI |
| えんまさ | F2.4根拠テキスト設計（Gate 2）、UIコピー確認・承認 |

**フェーズ**:

- **Phase 1（バックエンド基盤）**:
  - `diagnoses` テーブルmigration確定・適用（TSK-DB-001に含める）
  - `lib/diagnostics/zodiac.ts` + `six-star.ts` 実装（単体テスト付き）
  - `POST /api/diagnosis/auto-calc` 実装
  - `GET /api/diagnosis` 実装（型定義先行）

- **Phase 2（フロントエンド実装）**:
  - `MbtiQuizForm.tsx` 改良（進行状況バー・スキップ導線）
  - `DiagnosisResultCard.tsx`・`AutoCalcResultBadge.tsx` 実装（モックデータで並行開発）
  - 診断完了 → F3遷移ロジック

- **Phase 3（コンテンツ・品質）**:
  - `lib/data/animal-characters.ts` 実装（著作権確認タイミングに依存）
  - F2.4 `PhilosophyAccordion.tsx` 実装
  - えんまさによるUIコピー確認（Gate 2）
  - Vitestによる `lib/diagnostics/` 単体テスト

---

## 9. リスクと課題

| カテゴリ | リスク | 影響 | 対策 |
|--------|--------|------|------|
| **法的** | 動物性格診断データの著作権 | 外部公開不可・実装やり直しのリスク | 法人設立後に弁護士確認必須。確認前は外部公開しない前提で実装。`lib/data/animal-characters.ts` は「公開情報から自主構成」として設計 |
| **技術的** | 六星占術の命数算出ロジックの正確性 | 診断結果が既存ツールと異なり信頼を損なう | 複数の生年月日サンプルで既知の結果と照合するリグレッションテストを用意 |
| **技術的** | `diagnoses` テーブルと `mbti_results` テーブルの分離管理 | F3/F4でのデータ取得が複雑化 | `GET /api/diagnosis` でJOINして返す。フロントはこのAPIのみを参照 |
| **UX** | MBTIスキップ率が想定以上に高い場合 | 診断精度が下がりF3レポートの質が低下 | スキップ率を計測し、50%超の場合は問題数・UI・質問文を見直す |
| **ビジネス** | 4体系統合の「腑落ち感」がユーザーに伝わらない | F2.4への到達率が低く差別化が機能しない | F2.4アコーディオンの展開率をPostHogで計測。展開率が30%未満の場合はUI改善 |
| **品質** | UIコピーへの禁止語彙混入 | ブランドイメージ毀損・Gate 2差し戻し | `lib/prompts/__tests__/banned-words.test.ts` パターンでF2のUIコピーも検証 |

---

## 10. ランニング費用と運用方針

- **インフラ費用**: Supabase無料枠（0.5GB上限）内で運用。`diagnoses` テーブルはインデックス最小化・全文保存なし（文字列のみ）でストレージを最小化
- **API費用**: F2は外部AIを使わない。費用はゼロ
- **算出ロジック**: `lib/diagnostics/` はPure Function。外部API呼び出しなし
- **ストレージ戦略**: `diagnoses` は `user_id` UNIQUE（upsert）で1ユーザー1レコード。データ増加は線形のみ
- **モニタリング**: PostHog でイベント計測（`auto_calc_completed`・`mbti_diagnosis_saved`・`mbti_skipped`）。Supabaseダッシュボードでテーブルサイズを月次確認

---

## 11. 確定済み設計決定（Design Decisions Log）

| # | 決定事項 | 根拠・理由 | 反映先 |
|---|---------|----------|--------|
| 1 | 3体系算出はUIなし・バックエンドのみ | F3レポート・F4チャットの入力素材として使うため、ユーザーへの直接表示は不要 | §4.1 業務フロー |
| 2 | `diagnoses` テーブルは `user_id` UNIQUE（upsert） | 1ユーザーにつき1診断レコードが原則。再診断でも上書き | §4.3 DBスキーマ |
| 3 | MBTI問題数は12問（各軸3問）に確定 | 実装済み実績あり。診断完了率70%目標に対して十分な手軽さ | §4.2 判定ロジック仕様 |
| 4 | 動物性格診断（60アニマル）は著作権確認前に外部公開しない | v1.3 §8リスク継承。弁護士確認必須 | §4.1 F2.1b・§9 リスク |
| 5 | F2.4根拠テキストはえんまさがコンテンツ設計（Gate 2） | UIコピー・文言変更はえんまさ承認必須（AGENTS.md §7） | §4.4 F2.4・§8 フェーズ3 |
| 6 | `lib/diagnostics/` はPure Functionで実装 | Vitestによる単体テストが可能。算出ロジックのデグレ防止 | §7 ファイル構成 |

---

## 12. 変更管理

| 日付 | バージョン | 概要 | 承認者 |
|------|----------|------|-------|
| 2026-05-17 | v1.0 | 初版作成（F1スタイルに準拠。既存実装・タスク状況を踏まえて詳細化） | えんまさ（要確認） |

---

## 13. 参考資料

- **全体要件（Stage 2）**: [cocosil_v2_detailed_requirements_specification.md §4.2](../requirements/cocosil_v2_detailed_requirements_specification.md)
- **全体要件（Stage 1）**: [cocosil_v2_system_requirements.md](../requirements/cocosil_v2_system_requirements.md)
- **F1詳細要件（参考フォーマット）**: [f1_detailed_requirements.md](../F1/f1_detailed_requirements.md)
- **MBTI調査資料**: [MBTI簡易診断のベストプラクティス調査.md](../F1/MBTI簡易診断のベストプラクティス調査.md)
- **関連タスク**:
  - [TSK-UI-001-f2-ui-component-design.md](../tasks/TSK-UI-001-f2-ui-component-design.md)
  - [TSK-DB-001-db-schema-cleanup.md](../tasks/TSK-DB-001-db-schema-cleanup.md)
- **設計中枢**: [COCOSiL設計中枢.md](../../input/concepts/COCOSiL設計中枢.md)
- **MVP要件**: [mvp-requirements-v1-3.md](../../input/requirements_input/mvp-requirements-v1-3.md)
- **算出ロジック参照元**（`lib/diagnostics/` 実装時に移植するソース）:
  - [precision-calculator.ts](../../input/fortune_calculate/precision-calculator.ts) — 星座・動物（Excelシリアル値法）・六星占術の計算エンジン v3.0。`calculateFortuneSimplified` / `calculate60AnimalCharacter` / `calculateSixStar` / `calculateWesternZodiac` を参照
  - [destiny-number-database.ts](../../input/fortune_calculate/destiny-number-database.ts) — 六星占術の運命数テーブル（1930〜2030年・1212エントリ）。`lib/data/destiny-number-database.ts` へ移植する
- **六星占術算出参考**: [sanmeigaku-calculation-guide.md](../../input/fortune_calculate/sanmeigaku-calculation-guide.md)

---

> *本ドキュメントは 2026-05-17 時点の詳細要件定義書（Stage 2）です。実装中に発見された追加要件や仕様変更は「12. 変更管理」セクションに追記してください。*
