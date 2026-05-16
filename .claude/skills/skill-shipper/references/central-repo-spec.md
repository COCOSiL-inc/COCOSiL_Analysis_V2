# skill-shipper — Central Repo (cocosil-standard-skills) Specification

> 中央 skill repo の構造と運用仕様。
> init mode で生成、publish/install/update で参照。

---

## §1 推奨 repo 名

```
default: cocosil-standard-skills
代替:    <org>-skills, <org>-standard-skills

GitHub URL 例: https://github.com/MasakiEndo44/cocosil-standard-skills
リポジトリ可視性:
  - private (推奨、機密 skill 含む可能性)
  - public (機密 skill が無い、OSS として公開する場合)
```

---

## §2 ディレクトリ構造

```
cocosil-standard-skills/
├── README.md                          # repo 全体説明、skill 一覧
├── CONTRIBUTING.md                    # publish 手順、style guide
├── LICENSE                            # repo 全体 license (MIT 推奨)
├── CODEOWNERS                         # owner 指定
├── CHANGELOG.md                       # repo 全体の変更ログ (skill 追加/削除等)
│
├── skills/                            # skill の本体
│   ├── <skill-name>/
│   │   ├── SKILL.md                   # skill 仕様
│   │   ├── manifest.yaml              # version + 依存
│   │   ├── CHANGELOG.md               # この skill の changelog
│   │   ├── README.md                  # 使い方サマリ (任意)
│   │   ├── SESSION_TEMPLATE.md        # 任意
│   │   ├── references/                # 任意
│   │   │   └── *.md
│   │   ├── templates/                 # 任意
│   │   │   └── *.template
│   │   └── evals/                     # 任意
│   │       └── evals.json
│   │
│   ├── pre-pr-coherence-review/
│   │   └── ... (同構造)
│   │
│   └── skill-shipper/                 # この skill 自身もここに publish される
│       └── ... (同構造)
│
├── tools/                             # CI / validation
│   ├── validate-manifest.py           # manifest.yaml schema 検証
│   ├── check-abstraction.py           # abstraction-checklist の自動 check
│   ├── publish-helper.py              # publish 時の生成補助
│   └── README.md
│
├── docs/                              # repo 自体のドキュメント
│   ├── publishing-guide.md            # publish workflow 詳細
│   ├── installing-guide.md            # install workflow 詳細
│   ├── manifest-schema.md             # manifest 完全 schema (本書のミラー)
│   ├── semver-policy.md               # SemVer 採用ポリシー
│   └── deprecation-policy.md          # deprecate / archive 手順
│
├── plans/                             # 中央 repo の roadmap
│   └── kecku-skills-roadmap.md
│
├── .github/
│   ├── workflows/
│   │   ├── validate-skills.yml        # PR 時に manifest + abstraction check
│   │   ├── benchmark-skills.yml       # 月次で全 skill benchmark
│   │   └── notify-downstream.yml      # 下流 repo に update 通知
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── new-skill.md
│       └── skill-bug.md
│
└── .gitignore
```

---

## §3 主要ファイルの内容例

### README.md

```markdown
# COCOSiL Standard Skills

Claude Code 用 skill の中央 repo。複数 project で共有・再利用される skill を集約。

## Available Skills

| Skill | Latest | Description |
|---|---|---|
| [<skill-name>](skills/<skill-name>/) | 0.1.0 | example skill row |
| [pre-pr-coherence-review](skills/pre-pr-coherence-review/) | 1.0.0 | PR 前の 5 軸整合性レビュー |
| [skill-shipper](skills/skill-shipper/) | 0.1.0 | skill の publish/install/update |
| ... |

## Usage

### Install a skill into your project

\`\`\`bash
# In your project repo, with skill-shipper installed:
/skill-shipper install <skill-name>
\`\`\`

### Update existing skills

\`\`\`bash
/skill-shipper update
\`\`\`

### Publish a new skill

See [docs/publishing-guide.md](docs/publishing-guide.md).

## Versioning

SemVer (MAJOR.MINOR.PATCH). See [docs/semver-policy.md](docs/semver-policy.md).
```

### CONTRIBUTING.md

```markdown
# Contributing to COCOSiL Standard Skills

## Publishing a new skill

1. Develop the skill in your project's `.claude/skills/<name>/`
2. Run `/skill-shipper publish <name>` to:
   - Run abstraction analysis
   - Generate `manifest.yaml`
   - Generate `CHANGELOG.md`
   - Open a PR in this repo
3. Address PR review (CI checks: manifest validation + abstraction)
4. Once merged, the skill is available via `/skill-shipper install`

## Updating an existing skill

1. Update the skill in your project (or directly clone this repo)
2. Bump version in `manifest.yaml` per SemVer policy
3. Add CHANGELOG entry
4. Open PR

## Style Guide

- SKILL.md description must be < 5000 chars
- references/*.md should be < 1000 lines each
- Use placeholder `<...>` for project-specific values
- No PII, customer names, or secrets

See [docs/publishing-guide.md](docs/publishing-guide.md) for details.
```

### tools/validate-manifest.py

```python
#!/usr/bin/env python3
"""
Validate skill manifest.yaml against schema.
Used by CI (validate-skills.yml).
"""

import sys
import yaml
from pathlib import Path

REQUIRED_FIELDS = ["name", "version", "description"]
SEMVER_PATTERN = re.compile(r"^\d+\.\d+\.\d+$")

def validate(manifest_path: Path) -> list[str]:
    errors = []
    with open(manifest_path) as f:
        m = yaml.safe_load(f)
    
    for field in REQUIRED_FIELDS:
        if field not in m:
            errors.append(f"Missing required field: {field}")
    
    if "version" in m and not SEMVER_PATTERN.match(m["version"]):
        errors.append(f"version must be semver: {m['version']}")
    
    # ... (省略)
    
    return errors

if __name__ == "__main__":
    skills_dir = Path("skills")
    all_errors = []
    for manifest in skills_dir.rglob("manifest.yaml"):
        errors = validate(manifest)
        if errors:
            all_errors.append((manifest, errors))
    
    if all_errors:
        for path, errors in all_errors:
            print(f"❌ {path}")
            for e in errors:
                print(f"   - {e}")
        sys.exit(1)
    print("✅ All manifests valid")
```

### .github/workflows/validate-skills.yml

```yaml
name: Validate Skills

on:
  pull_request:
    paths:
      - 'skills/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install pyyaml
      - run: python tools/validate-manifest.py
      - run: python tools/check-abstraction.py skills/
```

---

## §4 init mode の動作

skill-shipper の init mode で本構造を自動生成:

```
1. user 確認:
   「中央 repo 名 (default: cocosil-standard-skills): _」
   「git URL: _」
   「private repo を作成 (推奨)? [Y/n]: _」

2. ローカルに repo を init:
   mkdir cocosil-standard-skills && cd cocosil-standard-skills
   git init

3. skeleton を生成:
   - README.md (template から)
   - CONTRIBUTING.md
   - LICENSE (MIT デフォルト)
   - CODEOWNERS (user 入力)
   - .gitignore
   - skills/.gitkeep
   - tools/validate-manifest.py
   - tools/check-abstraction.py
   - .github/workflows/validate-skills.yml
   - docs/*.md (4 ファイル)
   - plans/kecku-skills-roadmap.md (空)

4. 初回 commit + push:
   git add -A
   git commit -m "feat: initialize cocosil-standard-skills central repo"
   gh repo create <user>/<repo> --private --source=. --push

5. user に repo URL 提示
6. .claude/skill-shipper-config.yaml に設定書込みを案内
```

---

## §5 運用ルール

### Skill 命名

- kebab-case (例: `<verb>-<target>`, `pre-pr-coherence-review`)
- 動詞-対象 形式（例: `pr-draft-summary` = PR を draft から summary する）
- 既に同名 skill がある場合は scope prefix（例: `<scope>-<name>`）

### Branch / PR

- 中央 repo は `main` のみ運用、feature branch は merge 後削除
- skill 単位の PR (publish 1 skill = 1 PR)
- PR title: `feat(skills): <skill>@<version> - <summary>`

### CODEOWNERS

```
# .github/CODEOWNERS
* @<owner>
skills/**/manifest.yaml @<reviewer>  # manifest 変更は厳格 review
```

### Skill 削除 / archive

- 削除しない（過去 install 済の repo に対する fetch を壊さないため）
- 代わりに `manifest.deprecation` で archive
- 半年後に skills/<name>/ARCHIVED.md を追加

---

## §6 Bootstrap 既存 skill の publish 順

中央 repo を初期化したあと、本 repo の skill を順次 publish:

```
原則:
  1. skill-shipper 自身（自己持続性のため最優先）
  2. 汎用 skill（依存なし）
  3. project-specific 多めだが汎用化可能な skill
  4. 他 skill に依存する skill（依存先 publish 後に）

各 publish 後に PR review、マージ確認後に次へ進む。
具体的な順序は [plans/example-roadmap.md](../../../plans/example-roadmap.md) を参照。
```

---

## §7 関連

- publish: `references/publish-mode.md`
- install / list: `references/install-mode.md`
- update: `references/update-mode.md`
- manifest: `references/manifest-spec.md`
- abstraction: `references/abstraction-checklist.md`
