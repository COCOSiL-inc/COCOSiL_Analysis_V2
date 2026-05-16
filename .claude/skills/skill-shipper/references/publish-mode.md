# skill-shipper — publish mode

> 本 repo の `.claude/skills/<skill>/` を中央 repo に汎用化して PR 作成。
> SKILL.md §3 から呼ばれる。

---

## §0 前提

- `.claude/skill-shipper-config.yaml` で central_repo が定義されている
- 本 repo の対象 skill が動作確認済（local で正しく triggered する）
- `gh` CLI が認証済（中央 repo に PR 作成するため）

---

## §1 9 ステップ詳細

### Step 1: 対象 skill 選択

```
ユーザー入力から対象 skill を抽出。
複数指定可能（カンマ区切り）。

確認プロンプト:
  「以下の skill を中央 repo に publish しますか？
     - <skill-name-1> (現 path: .claude/skills/<skill-name-1>/)
     - <skill-name-2>
   [y/n/修正]」
```

### Step 2: 既存ファイル inventory

```
.claude/skills/<skill>/ 配下を再帰的に list。

期待される構造:
  - SKILL.md (必須)
  - SESSION_TEMPLATE.md (任意)
  - references/*.md (任意)
  - templates/*.template (任意)
  - evals/evals.json (任意、空でも OK)
  - manifest.yaml (publish 後に追加)

不在ファイル warning:
  - SKILL.md 不在 → 中断
  - evals/evals.json 不在 → user 確認、空雛形を生成して続行可
```

### Step 3: 抽象化分析（critical）

`references/abstraction-checklist.md` のチェックリストを順に適用。

```
分析項目:
  A. hardcoded paths
     - "knowledge/25_requirements/koto/" → "<spec_path>/products/<product>/"
     - "packages/koto-api/" → "<impl_path>/<package>/"
  
  B. project-specific 名称
     - "cocosil-analysis" → "<project_name>"
     - "cocosil" → "<organization>"
     - "<consumer_repo>" repo 名 → 設定参照
  
  C. 顧客 / 内部固有名 (redact 必須)
     - "<customer_name>" / "<executive>" → 削除 or 一般化
     - 内部 D-N (D004 / D005 / D006) → 抽象化（"governance D-N" 等の総称）
  
  D. 言語 / framework hardcode
     - "uv run pytest" → manifest.dependencies.external に "uv" 宣言
     - "python 3.12" → manifest.compatibility に明示

出力:
  === 抽象化分析結果 ===
  
  検出した project-specific 部分: <N> 箇所
    1. SKILL.md:30 "knowledge/25_requirements/koto/" → suggest: "<spec_path>/products/<product>/"
    2. references/deep-mode.md:50 "cocosil" → suggest: "<organization>"
    ...
  
  redact 候補 (機密情報の可能性): <M> 箇所
    1. SKILL.md:45 "cocosil-analysis" → suggest: redact (project_name 経由で再注入)
    ...
  
  この置換を適用しますか？ [Y: 全適用 / s: 個別選択 / n: 中断]
```

### Step 4: manifest.yaml 生成

`references/manifest-spec.md` の schema に従う。雛形は `templates/manifest.yaml.template`。

```
生成内容:
  name: <skill-name>
  version: <semver, 初版 0.1.0、既存なら patch bump>
  description: <SKILL.md の description から抽出>
  authors:
    - <user 入力 or git config user.name>
  license: <user 確認、default MIT>
  compatibility:
    claude_code: ">=1.0"
    claude_models: ["opus-4.7", "sonnet-4.6", "haiku-4.5"]
  dependencies:
    skills: <skill 内で `@<other-skill>` 参照しているもの>
    external: <Bash で呼んでいる CLI: gh / uv / python 等>
  config_required: <Step 3 で抽出した必須 placeholder>
  config_optional: <任意の調整パラメータ>
  files:
    required:
      - SKILL.md
      - manifest.yaml
    optional:
      - SESSION_TEMPLATE.md
      - references/
      - templates/
      - evals/evals.json
  test_eval:
    pass_rate_min: 0.7
    benchmark_command: /benchmark-skill <name>

出力先: .claude/skills/<skill>/manifest.yaml (本 repo にも保存)
```

### Step 5: CHANGELOG.md 生成

```
初版なら新規作成、既存なら版エントリ追加。

雛形: templates/CHANGELOG.md.template
形式: Keep a Changelog (https://keepachangelog.com/)

[0.1.0] - YYYY-MM-DD - Initial publish
  ### Added
  - <SKILL.md の主機能>

publish 履歴は中央 repo の skills/<skill>/CHANGELOG.md に維持。
```

### Step 6: user 承認ゲート (PREVIEW)

```
=== Publish Preview ===

対象 skill: <name>
中央 repo: <central_repo_name>
ブランチ: feat/publish-<skill>-v<version>

変更計画:
  本 repo (.claude/skills/<skill>/):
    + manifest.yaml (新規)
    ~ SKILL.md (抽象化反映、<N> 箇所)
    ~ references/*.md (抽象化反映、<M> 箇所)
  
  中央 repo (skills/<skill>/):
    + SKILL.md (汎用化版)
    + manifest.yaml
    + CHANGELOG.md
    + references/, templates/, evals/

抽象化サマリ:
  - <N> 個の path を <product> placeholder + config に置換
  - <K> 個の機密情報を redact
  - <L> 個の依存を manifest.dependencies に宣言

このまま publish を実行しますか？ [承認/n/修正]
```

### Step 7: 中央 repo を clone / pull

```
config.central_repo.local_path が存在する → cd して git pull
存在しない → git clone <git_url> <local_path>

エラー時:
  - 認証失敗 → user に gh auth login 案内
  - clone 失敗 → user に repo URL 確認
```

### Step 8: 中央 repo にファイル書込み

```
cd <central_repo.local_path>
git checkout main && git pull
git checkout -b feat/publish-<skill>-v<version>

# 中央 repo の skills/<skill>/ にファイルを書く
mkdir -p skills/<skill>
cp <本 repo>/.claude/skills/<skill>/* skills/<skill>/
# manifest.yaml は publish 専用版（中央 repo 用）

git add skills/<skill>
git commit -m "feat(skills): publish <skill>@<version>

<changelog の最新エントリ抜粋>

Co-Authored-By: Claude <noreply@anthropic.com>"

# CI が validate-skills.yml で manifest 検証
```

### Step 9: PR 作成

```
git push -u origin feat/publish-<skill>-v<version>

gh pr create --title "feat(skills): publish <skill>@<version>" --body "
## Summary
新 skill <name> を中央 repo に publish。

## Manifest
\`\`\`yaml
<manifest.yaml の主要部分>
\`\`\`

## Changelog
<CHANGELOG.md の最新エントリ>

## Source
- 元 repo: <本 repo の git URL>
- 元 path: .claude/skills/<skill>/
- 元 commit: <本 repo の HEAD SHA>

## 抽象化サマリ
- <N> path placeholder
- <M> redact
- <L> dependencies 宣言

## Refs
- <central-repo-adoption-decision-id> (consumer 側の governance ADR)
- 元 repo PR # (本 PR が source 側)
"

中央 repo の PR URL を user に提示。
review / merge は中央 repo 側で実施。
```

---

## §2 失敗モード対策

| 状況 | 対策 |
|---|---|
| 中央 repo が未作成 | `init` mode に誘導、初期化後に retry |
| 認証失敗 | `gh auth status` で確認、再 auth を案内 |
| 抽象化分析で残存する project-specific が許容範囲超過 | user に「abstraction より skip 多めで進む？」を確認、許容するなら manifest に `not_fully_abstracted: true` フラグ |
| manifest.yaml validation 失敗 (CI) | 中央 repo の tools/validate-manifest.py エラーを表示、修正案を提示 |
| 同名 skill が中央 repo に既に存在 | update mode を提案、または major version bump で再 publish |

---

## §3 publish 後の本 repo 側処理

```
本 repo の skill には manifest.yaml が追加された状態。
これにより以下が可能に:

1. /skill-shipper list で「local 0.1.0 == central 0.1.0」と表示
2. /skill-shipper update でアップデート対象として認識
3. 他 repo に install する際の dependency check が機能
```

---

## §4 関連

- 中央 repo 構造: `references/central-repo-spec.md`
- manifest schema: `references/manifest-spec.md`
- 抽象化 checklist: `references/abstraction-checklist.md`
- GOVERNANCE_DECISIONS: <central-repo-adoption-decision-id>
