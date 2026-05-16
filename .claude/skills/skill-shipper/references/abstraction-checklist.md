# skill-shipper — Abstraction Checklist

> publish mode Step 3 で使う「project-specific → 汎用化」のチェックリスト。
> 本セッション (PR #45/#48-50/#54/#55) で実施した抽象化作業の知見を反映。

---

## §0 チェックリストの目的

skill を中央 repo に上げる前に、以下の 5 カテゴリの project-specific 部分を識別して
**config 化 / placeholder 化 / redact** する。

| カテゴリ | リスク |
|---|---|
| A. hardcoded paths | 他 repo で path が違うと skill 動作不能 |
| B. project / 組織固有名 | 文書として汎用性低下 |
| C. 顧客 / 機密情報 | NDA 違反 / 情報漏洩 |
| D. 言語 / framework hardcode | dependency 不在で動作不能 |
| E. ローカル D-N 番号 / 内部 ID | 他 repo の番号空間と衝突 |

---

## §1 カテゴリ A: hardcoded paths

### 検出パターン

```regex
"knowledge/25_requirements/<product>/" → 既に placeholder 化済（OK）
"knowledge/25_requirements/koto/"      → "koto" が hardcoded（要修正）
"packages/koto-api/"                   → "koto-api" が hardcoded（要修正）
"docs/research/"                       → 一般的（OK）
"requirements 参考/"                   → 完全 project-specific（要 config 化）
```

### 抽象化方針

1. **frequent path** → `<placeholder>` に置換 + config_required で宣言
2. **rare path** → 削除 or コメントで「こういう path がある場合」と一般化

### 例

```
変換前:
  "knowledge/25_requirements/koto/capabilities/" を確認する

変換後:
  "<spec_path>/<product>/capabilities/" を確認する
  
manifest.yaml:
  config_required:
    - spec_path: spec の root path（例: "knowledge/25_requirements/"）
    - product: product 名（例: "koto"）
```

---

## §2 カテゴリ B: project / 組織固有名

### 検出パターン

```
"cocosil-analysis"  → project name
"cocosil"           → organization
"<consumer_repo>"   → repo name
"skill-shipper"     → 自分自身、OK
"docs/goals/"       → 一般的、OK
```

> ⚠️ Examples above are illustrative only — they do not refer to any real repo
> in this hub. Replace with your own project names when adapting this guide.

### 抽象化方針

```
project name → "<project_name>" placeholder
organization → "<organization>" placeholder
repo name    → "<impl_repo_name>" / "<spec_repo_name>" placeholder

manifest.yaml:
  config_required:
    - project_name (例: "<project_name>")
    - organization (例: "<organization>")
    - impl_repo_name (例: "<impl_repo_name>")
```

### 例外

- 「cocosil-standard-skills」は中央 repo 名そのもの → そのまま残す（README で明示）
- 「Anthropic」「Claude」「GCP」「Vertex AI」など外部商品名 → そのまま残す

---

## §3 カテゴリ C: 顧客 / 機密情報

### 検出パターン

```
"<customer_name>"  → 顧客名 (機密)
"<executive>"                  → 個人名 (機密)
"PoC 月50万円"              → 取引額 (機密)
"<sensitive_domain>"        → 機密領域 (例: M&A, 訴訟, 個人医療情報 等)
"OAuth scope: chat:write"   → 公開 OK (技術仕様)
```

### 抽象化方針

```
顧客名 / 取引情報 → 完全 redact（削除）
個人名           → "<executive>" placeholder + 「ロール置換」コメント
具体的な金額     → 削除 or "<amount>" placeholder
業務領域 (<sensitive_domain> 等) → 「機密領域」「sensitive domain」に一般化
```

### Redaction の判断基準

```
判定基準:
  Q1. この情報が公開 GitHub に載っても問題ないか？
       - No → 必ず redact
       - Yes → そのまま OK
  
  Q2. 別 repo の skill ユーザーに有益か？
       - No → 削除
       - Yes → 一般化
```

### Redaction フロー

```
1. 該当箇所を `<REDACTED>` placeholder に置換
2. 直前に「## Note」コメントで「この skill は <文脈> 想定だが汎用化済」と記載
3. publish 前に grep で `<REDACTED>` の数を確認、user に最終確認
```

---

## §4 カテゴリ D: 言語 / framework hardcode

### 検出パターン

```
"uv run pytest"          → uv 必須
"python 3.12"            → python 3.12 必須
"npm install"            → npm 必須（NG）、uv 統一前提
"ruff check"             → ruff 必須
".venv/"                 → venv 系統使用
"FastAPI" / "Slack Bolt" → framework 依存
```

### 抽象化方針

```
2 通り:

A. dependency として manifest 宣言（推奨）
   manifest.yaml:
     dependencies:
       external:
         - uv: ">=0.4"
         - python: ">=3.12"
         - gh: ">=2.0"
         - ruff: ">=0.6"

B. config 化
   config_optional:
     test_command: "uv run pytest"  # default、override 可能

選択基準:
  - skill の core 機能に必須 → A (dependency 宣言)
  - 任意のショートカット → B (config 化)
```

---

## §5 カテゴリ E: ローカル D-N / 内部 ID

> ⚠️ The identifier examples in this section (D004, CAP-009, FEAT-009-P1, TASK-MEM-01)
> are illustrative placeholders showing the anti-pattern. They do not refer to any
> real decision register in this hub — they exist purely to demonstrate the format
> that should NOT be hardcoded into a published skill.

### 検出パターン

```
"D004 / D005 / D006"     → 本 repo 固有の D-N
"CAP-009"                → 本 repo 固有の Capability
"FEAT-009-P1"            → 本 repo 固有の Feature
"TASK-MEM-01"            → 本 repo 固有の Task ID
```

### 抽象化方針

```
原則: ローカル D-N / CAP / FEAT を skill に hardcoded しない。

例外的に必要な場合:
  - "governance D-N (例: D004 trace_id 強制)" のように「総称 + 具体例」形式
  - "新 Capability (例: CAP-009 Mnemonic Sovereignty)" 形式
  - 番号は「sample」と明示

完全 generic 化:
  "D004" → "trace_id 強制 governance D-number"
  "CAP-009" → "新 Capability"
```

---

## §6 抽象化分析の自動化

```python
# skill-shipper の publish mode Step 3 で実行する pseudo code

import re

PATTERNS = {
    "hardcoded_paths": [
        r"knowledge/25_requirements/[a-z]+/",  # product hardcoded
        r"packages/[a-z]+-[a-z]+/",            # package name hardcoded
    ],
    "project_names": [
        # Examples — replace with your org's project/repo identifiers
        r"cocosil-analysis", r"cocosil",
    ],
    "secrets": [
        # Examples — replace with your org's sensitive terms (customer / exec / domain)
        r"<sensitive_term_a>", r"<sensitive_term_b>",
    ],
    "framework_hardcode": [
        r"uv run", r"python 3\.\d+", r"FastAPI", r"Slack Bolt",
    ],
    "local_ids": [
        r"D0\d{2}",                # D-N
        r"CAP-\d{3}",              # Capability
        r"FEAT-\d{3}-P\d",         # Feature
        r"TASK-[A-Z]+-\d{2}",      # Task
    ],
}

for category, patterns in PATTERNS.items():
    for pattern in patterns:
        matches = grep_in_skill(pattern)
        if matches:
            propose_abstraction(category, matches)
```

実装は MVP では正規表現ベース、将来的に LLM-based なコンテキスト判定に拡張。

---

## §7 user 確認ゲート

```
=== 抽象化分析結果 ===

カテゴリ A (hardcoded paths): 5 件
  1. SKILL.md:30 "knowledge/25_requirements/koto/" → "<spec_path>/<product>/"
  2. SKILL.md:45 "packages/koto-api/" → "<impl_path>/<package>/"
  ...

カテゴリ B (project names): 3 件
  1. references/deep-mode.md:50 "cocosil-analysis" → "<project_name>"
  ...

カテゴリ C (secrets, REDACT): 2 件 ⚠️
  1. SKILL.md:120 "<customer_name>" → REDACT 必須
  2. references/install-mode.md:80 "<executive>" → "<executive>" + redact note
  ...

カテゴリ D (framework): manifest 宣言推奨 4 件
カテゴリ E (local IDs): 6 件

このまま全適用しますか？
  [Y: 全適用]
  [s: カテゴリ別に確認 (A/B/C/D/E)]
  [n: 中断]
```

---

## §8 抽象化漏れの検知

publish 後の中央 repo に CI を仕込む:

```yaml
# central_repo/.github/workflows/validate-skills.yml
on: [pull_request]
jobs:
  abstract-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python tools/check-abstraction.py skills/
        # PATTERNS と同じ正規表現で検出、見つかったら fail
```

中央 repo に project-specific が混入したまま入ると後続の install で問題になるため、
CI で阻止する。

---

## §9 関連

- publish mode: `references/publish-mode.md`
- manifest schema: `references/manifest-spec.md`
- 中央 repo CI: `references/central-repo-spec.md`
