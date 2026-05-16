# skill-shipper — manifest.yaml Specification

> skill 単位で必ず置く `manifest.yaml` のスキーマ仕様。
> publish mode で生成、install / update mode で参照。

---

## §1 完全な schema

```yaml
# .claude/skills/<skill>/manifest.yaml

# === 必須フィールド ===

name: <skill-name>                    # SKILL.md の name と一致必須
version: <semver>                      # x.y.z 形式（0.1.0 / 1.0.0 / 2.3.4 等）
description: |
  <skill の 1-3 行説明>
  <SKILL.md の description から自動抽出可>

# === 推奨フィールド ===

authors:                               # 作成者（複数可）
  - <name or email>

license: <SPDX license id>             # default: MIT
                                       # 推奨: MIT / Apache-2.0 / BSD-3-Clause
                                       # 機密 skill: "PROPRIETARY-INTERNAL"

# === 互換性 ===

compatibility:
  claude_code: <semver range>          # 例: ">=1.0", "^1.0", ">=1.0,<2.0"
  claude_models:                       # この skill が動作確認済の Claude model
    - opus-4.7                         # 列挙する model 全てで動作必須
    - sonnet-4.6
    - haiku-4.5

# === 依存 ===

dependencies:
  skills:                              # 他 skill への依存（同 central repo 内）
    - <skill-name>@<version-range>     # 例: "skill-shipper@>=0.1.0"
    - <skill-name>                     # version 省略時は最新
  external:                            # 外部 CLI / runtime
    - <cli>: <version-range>           # 例: gh: ">=2.0", uv: ">=0.4"
                                       # python: ">=3.12"

# === 設定 ===

config_required:                       # install 時に必ず設定が必要な項目
  - <key>                              # 単純な必須キー
  - key: <key>                         # 説明付き
    description: <human-readable>      
    default: <default value>
    type: string | number | boolean | path

config_optional:                       # 任意の調整パラメータ
  - <key>:
    description: <human-readable>
    default: <default value>

# === ファイル構造 ===

files:
  required:                            # 必ず存在しなければならない
    - SKILL.md
    - manifest.yaml
  optional:                            # あれば取り込む
    - SESSION_TEMPLATE.md
    - references/
    - references/*.md
    - templates/
    - templates/*.template
    - evals/evals.json
    - LICENSE

# === Eval ===

test_eval:
  pass_rate_min: <0.0-1.0>             # benchmark の pass_rate がこれを下回ったら fail
                                       # default: 0.7
  benchmark_command: /benchmark-skill <name>
                                       # benchmark-skill governance の trigger

# === Metadata ===

tags:                                  # 検索用 tag
  - <tag1>
  - <tag2>

repository:                            # この skill の origin
  url: <git URL>                       # publish 元 repo URL
  path: <relative path>                # 例: ".claude/skills/<skill>/"
  commit: <SHA>                        # publish 時の HEAD SHA

published_at: <ISO 8601>               # 中央 repo に publish された日時
last_updated: <ISO 8601>               # 最終更新日時

# === 抽象化フラグ ===

abstraction:
  fully_abstracted: <boolean>          # 全 placeholder が config 化済か
                                       # true 推奨、false の場合 warnings 必須
  warnings:                            # 抽象化漏れの警告
    - <message>
  redacted_count: <int>                # redact 適用箇所数

# === 廃止予定 ===

deprecation:
  status: <active | deprecated | archived>
  reason: <理由>                       # deprecated/archived 時のみ
  replacement: <skill-name>            # 後継 skill があれば
  removal_date: <ISO 8601>             # archived 予定日
```

---

## §2 最小 manifest（初版 publish 用）

```yaml
name: my-new-skill
version: 0.1.0
description: |
  最小限の skill 説明
authors:
  - your-name
license: MIT
compatibility:
  claude_code: ">=1.0"
  claude_models: [opus-4.7, sonnet-4.6, haiku-4.5]
dependencies:
  skills: []
  external: []
config_required: []
config_optional: []
files:
  required:
    - SKILL.md
    - manifest.yaml
  optional:
    - SESSION_TEMPLATE.md
    - references/
test_eval:
  pass_rate_min: 0.7
  benchmark_command: /benchmark-skill my-new-skill
tags: []
repository:
  url: <publish 元 git URL>
  path: .claude/skills/my-new-skill/
  commit: <SHA>
published_at: <ISO 8601>
last_updated: <ISO 8601>
abstraction:
  fully_abstracted: true
  warnings: []
  redacted_count: 0
```

---

## §3 SemVer policy

skill の version 採番ルール:

```
MAJOR.MINOR.PATCH

PATCH (x.y.Z): 
  - bug fix のみ
  - SKILL.md の挙動を変えない範囲の文言修正
  - references/*.md のクリアリング
  - update mode で auto-merge 可

MINOR (x.Y.0):
  - 新機能追加 (互換性あり)
  - 新しい mode / 新しい reference 追加
  - description 拡張 (既存 trigger は維持)
  - update mode で auto-merge 可、post-eval で confirm

MAJOR (X.0.0):
  - 破壊的変更
  - 既存 trigger / mode の削除
  - SKILL.md の構造変更で旧 SESSION_TEMPLATE 互換切れ
  - manifest schema の breaking change
  - update mode で **手動承認** 必須、CHANGELOG 必読
```

初版は `0.1.0`、安定したら `1.0.0` に bump。

---

## §3.5 dependency version range

```
">=1.0"           # 1.0 以上、 全て OK
"^1.0"            # 1.x.x 系列のみ (2.0 不可)
"~1.2"            # 1.2.x のみ (1.3 不可)
">=1.0,<2.0"      # 範囲指定
"1.2.3"           # ピン (推奨しない、テスト用)
""                # 任意
```

---

## §4 Validation rules

中央 repo の CI / install / update 時に検証:

```
1. name が SKILL.md frontmatter と一致
2. version が semver 形式
3. compatibility.claude_code が範囲指定として valid
4. dependencies.skills の循環参照なし
5. files.required が全て存在
6. abstraction.fully_abstracted == true、または warnings に明示
7. test_eval.benchmark_command が `/benchmark-skill <name>` 形式
8. published_at <= last_updated
9. deprecation.status == "active" または明示的な reason
```

実装: `central_repo/tools/validate-manifest.py` (CI で実行)

---

## §5 Examples

### Example A: シンプル skill（依存なし）

```yaml
name: pr-draft-summary
version: 0.2.0
description: |
  PR 作成時のサマリー生成 skill。
  ## Summary / ## Test plan を自動構築。
authors: [cocosil]
license: MIT
compatibility:
  claude_code: ">=1.0"
  claude_models: [opus-4.7, sonnet-4.6, haiku-4.5]
dependencies:
  skills: []
  external:
    - gh: ">=2.0"
config_required: []
config_optional:
  - title_format:
      description: PR タイトルのフォーマット文字列
      default: "<type>(<scope>): <subject>"
files:
  required: [SKILL.md, manifest.yaml]
test_eval:
  pass_rate_min: 0.7
  benchmark_command: /benchmark-skill pr-draft-summary
abstraction:
  fully_abstracted: true
  warnings: []
  redacted_count: 0
```

### Example B: 複雑 skill（依存あり、multi-repo 対応）

```yaml
name: cocosil-analysis-assist
version: 0.3.0
description: |
  COCOSiL の分析セッションをガイドする仮想 skill 例。
  Light Mode (会話ベース) + Deep Mode (リサーチ + PR 作成) の 2 層構成。
  Multi-repo 対応 (.claude/analysis-config.yaml で opt-in)。
authors: [cocosil]
license: MIT
compatibility:
  claude_code: ">=1.0"
  claude_models: [opus-4.7, sonnet-4.6, haiku-4.5]
dependencies:
  skills:
    - skill-creator@>=1.0  # eval / benchmark で参照
  external:
    - gh: ">=2.0"
    - uv: ">=0.4"
config_required:
  - product:
      description: 対象 product 名 (例: cocosil-analysis / cocosil-personality)
      type: string
config_optional:
  - mode:
      description: single-repo or multi-repo
      default: single-repo
files:
  required:
    - SKILL.md
    - manifest.yaml
    - references/layers.md
    - references/web-escalation.md
  optional:
    - SESSION_TEMPLATE.md
    - references/deep-mode.md
    - references/research-protocol.md
    - references/integration-checklist.md
    - references/pr-split-strategy.md
    - references/repo-config.md
    - evals/evals.json
test_eval:
  pass_rate_min: 0.7
  benchmark_command: /benchmark-skill cocosil-analysis-assist
tags: [analysis, planning, multi-repo]
repository:
  url: https://github.com/<org>/cocosil-standard-skills
  path: skills/cocosil-analysis-assist/
  commit: <SHA>
published_at: 2026-05-07T04:31:00Z
last_updated: 2026-05-07T04:31:00Z
abstraction:
  fully_abstracted: true
  warnings: []
  redacted_count: 2
deprecation:
  status: active
```

---

## §6 関連

- publish: `references/publish-mode.md`
- install: `references/install-mode.md`
- update: `references/update-mode.md`
- 中央 repo CI: `references/central-repo-spec.md`
