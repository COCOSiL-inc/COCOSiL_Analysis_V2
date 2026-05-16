---
name: skill-shipper
description: >
  Publish, install, update, list, or init Claude Code skills across repos via
  a central skills hub (cocosil-standard-skills). 5 modes: publish (generalize
  a local skill and PR to hub), install (pull hub skill into current repo),
  update (propagate new hub version), list (compare local vs hub versions),
  init (create hub skeleton). Handles abstraction of project-specific paths,
  hardcoded language/framework, secrets, and dependency declarations in
  manifest.yaml. Use when: "skill を共有したい" "skill を publish したい"
  "central repo に上げたい" "cocosil-standard-skills に追加"
  "他のプロジェクトでも使いたい" "skill のアップデート" "skill を install"
  "skill version を上げたい" "skill manifest" "skill changelog"
  "skill abstraction" "skill 抽象化" — or whenever a project-local skill
  in .claude/skills/ proves useful enough to share across repos.
---

# skill-shipper Skill

> プロジェクトローカル skill を中央 repo に汎用化して publish / install / update する meta-skill。
> 「ある repo で書いた skill を他の repo でも使いたい」「version 管理して propagation したい」用途。

---

## §1 PURPOSE

このSkillは「**skill を artifact として版管理 + 共有**」する仕組みを提供する。

### 解決したい問題

- A repo で書いた skill (例: `<my-skill>`) を B repo でも使いたい → 手動コピーは陳腐化が早い
- 複数 repo に同じ skill が散在し、improve しても他の repo に反映されない
- skill の依存関係 (Claude Code version / 他 skill / 外部 CLI) が宣言されておらず、移植時に動かない
- skill にプロジェクト固有の hardcode（path / product 名 / 顧客名）が混入し、再利用しにくい

### 解決アプローチ

1. **中央 repo** (例: `cocosil-standard-skills`) に skill を集約
2. **manifest.yaml** で version / 依存 / config 必須項目を宣言
3. **abstraction checklist** で project-specific 部分を config 化
4. **3 つの sync mode** (publish / install / update) で双方向同期
5. **changelog + semver** で破壊的変更を追跡

### 既存 skill との棲み分け

| Skill | 役割 |
|---|---|
| `skill-creator` (Anthropic plugin) | skill を **新規作成 / improve / benchmark** |
| `skill-improver` (本 repo) | 既存 skill の対話的 improve |
| `kecku-harness-bootstrap` | 新規 repo に harness 全体を bootstrap |
| **`skill-shipper`** (本 skill) | **既存 skill を中央 repo に publish / 中央から install / update 伝播** |

skill-creator が「skill 1 個の品質改善」を担うのに対し、skill-shipper は「skill 1 個の **配布チャネル**」を担う。

---

## §2 BOOTSTRAP

新規セッション開始時に以下を実行。

### Step 1: モード判定

ユーザー入力から mode を抽出:

| 入力例 | mode |
|---|---|
| 「skill を publish」「cocosil-standard-skills に上げる」 | `publish` |
| 「skill を install」「<skill> を取り込む」 | `install` |
| 「skill を update」「新 version に上げる」 | `update` |
| 「skill list」「中央に何がある」 | `list` |
| 「中央 repo を作る」「cocosil-standard-skills 初期化」 | `init` |
| モード不明 | user に確認 |

### Step 2: Config Detection

`~/.claude/skill-shipper-config.yaml` または `.claude/skill-shipper-config.yaml` の存在を check:

```
存在する → YAML を parse
  - central_repo.git_url / local_path を取得
  - 中央 repo へのアクセス可能性を確認 (clone / pull 可能か)
存在しない → user に config 作成を促す
  - `.claude/skill-shipper-config.yaml.example` をコピーして編集する手順を提示
  - mode == init の場合のみ、config 不在でも続行可能（init で生成）
```

### Step 3: OPENING LINE

```
---
skill-shipper を起動しました。

モード: <publish | install | update | list | init>
中央 repo: <name> (<git_url>) [status: <accessible | not-found | not-configured>]
本 repo: <current repo name>
対象 skill: <skill name or "all">

コントロール:
  「stop」      → 中断
  「キャンセル」 → 操作取消
  「承認」      → 次ステップへ進む

では始めましょう。
---
```

---

## §3 MODE: publish

詳細: `references/publish-mode.md`

### 概要

本 repo の `.claude/skills/<skill>/` を **抽象化 → manifest 化 → 中央 repo に PR** する。

### 9 ステップ

```
1. 対象 skill 選択 (user 入力)
2. 既存ファイル inventory (SKILL.md / references/ / templates/ / evals/)
3. **抽象化分析** (references/abstraction-checklist.md):
   - hardcoded paths → <product> placeholder + config
   - 顧客名 / 内部 D-N → 一般化 or redact
   - 言語 / framework 依存 → manifest.dependencies に宣言
4. **manifest.yaml 生成** (references/manifest-spec.md):
   - version (semver、初版なら 0.1.0)
   - description / authors / license
   - compatibility (claude_code / claude_models)
   - dependencies (skills / external CLIs)
   - config_required / config_optional
5. **CHANGELOG.md 生成** (templates/CHANGELOG.md.template)
6. user 承認ゲート (Stage 1: PREVIEW)
7. 中央 repo を clone / pull
8. 中央 repo の `skills/<skill>/` に書き込み
9. 中央 repo で PR 作成 (gh pr create)
```

### 出力

- 中央 repo に PR 作成
- 本 repo の skill には manifest.yaml が追加されるが、internal config は `.claude/skill-shipper-config.yaml` (gitignore) で管理

---

## §4 MODE: install

詳細: `references/install-mode.md`

### 概要

中央 repo の `<skill>@<version>` を本 repo の `.claude/skills/<skill>/` に取り込む。

### 8 ステップ

```
1. install 対象 skill + version 選択 (user 入力 or list mode から選ぶ)
2. 中央 repo を clone / pull
3. 中央 skill の manifest.yaml を読む
4. **依存解決**:
   - dependencies.skills が現 repo に install 済か check
   - 未 install なら自動 install (再帰)
   - external CLIs (gh / uv / 等) の version check
5. **config_required の確認**:
   - 本 repo に対応する config (例: <product>) が無い場合、user に入力を促す
6. user 承認ゲート (Stage 1: PREVIEW with diff)
7. ファイルコピー (中央 → 本 repo `.claude/skills/<skill>/`)
8. 本 repo の CLAUDE.md / AGENTS.md に skill 参照を追記 (任意)
```

### 出力

- 本 repo に skill 配置完了
- 本 repo で PR 作成 (一連の変更をコミット)

---

## §5 MODE: update

詳細: `references/update-mode.md`

### 概要

中央 repo の最新 version を、本 repo の既存 skill に伝播。**version diff + changelog 確認 + 破壊的変更チェック**。

### 7 ステップ

```
1. 対象 skill 選択 (省略時は本 repo 内の全 skill が対象)
2. 中央 repo を pull、各 skill の latest version を取得
3. 本 repo 内の各 skill の現 version を読む (manifest.yaml)
4. **version diff 表示**:
   - skill A: 0.2.1 → 0.3.0 (minor、互換あり)
   - skill B: 1.0.0 → 2.0.0 (major、破壊的変更あり)
5. user 確認 (skill 単位で承認 / skip / preview)
6. update 適用:
   - minor / patch: 自動 merge (config 部分は preserve)
   - major: user に CHANGELOG を提示、手動 merge ガイド
7. **post-update eval**:
   - `/benchmark-skill <name>` を実行 (benchmark-skill governance 連携)
   - pass_rate 低下があれば rollback 候補として提示
```

### 出力

- 本 repo の skill 更新 + PR 作成
- post-update eval レポート

---

## §6 MODE: list

詳細: `references/install-mode.md` §3

### 概要

中央 repo の利用可能 skill 一覧と、本 repo の現 version を表で表示。

```
=== cocosil-standard-skills (中央) ===

| Skill            | Latest | Local | Status     |
|------------------|--------|-------|------------|
| <skill-name>     | 0.3.0  | 0.2.1 | update 推奨 |
| pre-pr-coherence | 1.0.0  | 1.0.0 | up to date |
| skill-shipper    | 0.1.0  | 0.1.0 | up to date |
| <new skill>      | 0.1.0  | -     | install 可  |

実行: `/skill-shipper update <skill-name>` で update
      `/skill-shipper install <new skill>` で install
```

---

## §7 MODE: init

詳細: `references/central-repo-spec.md`

### 概要

中央 repo (cocosil-standard-skills) が未作成の場合、skeleton を作る。**1 回限り**。

### 6 ステップ

```
1. user に repo 名 / git URL を確認 (default: "cocosil-standard-skills")
2. ローカルに repo を init or clone
3. 中央 repo の標準構造を生成:
   - README.md (使い方、CONTRIBUTING へのリンク)
   - CONTRIBUTING.md (publish/install workflow)
   - skills/ (空ディレクトリ)
   - tools/validate-manifest.py (CI 用 manifest validator)
   - .github/workflows/validate-skills.yml (CI)
4. 初回 commit + push
5. GitHub repo を gh repo create で作成 (private 推奨)
6. user に repo URL を提示、`.claude/skill-shipper-config.yaml` に書き込む手順
```

詳細構造: `references/central-repo-spec.md`

---

## §8 SAFETY

cross-repo 操作のため特に注意:

| リスク | 対策 |
|---|---|
| 本 repo の機密情報を中央 repo に漏らす | 抽象化チェックリスト (references/abstraction-checklist.md) を必ず通す。redact 対象を明示 |
| 中央 repo に壊れた skill を push | manifest.yaml validation + eval pass を pre-commit gate に |
| 破壊的 update で本 repo の skill が動かなくなる | major version bump は自動適用しない、user 確認必須 |
| 中央 repo の force push | 本 skill は force push を使わない、新ブランチで対応 (R3 制約準拠) |
| dependencies.skills の循環参照 | install 時に topological sort で検出、循環あれば中断 |

---

## §9 SESSION SAVE PROTOCOL

```
1. docs/<sessions>/<slug>-skill-shipper-session.md を保存
2. State:
   - mode: publish | install | update | list | init
   - target_skill: <name>
   - target_version: <version>
   - central_repo_status: accessible | not-found
   - current_step: 1-9 (mode 別の step 番号)
3. 次回再開: 「skill-shipper を resume」
```

---

## §10 REFERENCES

| ファイル | 役割 | ロードタイミング |
|---|---|---|
| `references/publish-mode.md` | publish モード 9 ステップ詳細 | publish mode 開始時 |
| `references/install-mode.md` | install / list モード詳細 | install / list mode 開始時 |
| `references/update-mode.md` | update モード詳細 + version diff 戦略 | update mode 開始時 |
| `references/abstraction-checklist.md` | プロジェクト固有 → 汎用化のチェックリスト | publish Step 3 |
| `references/manifest-spec.md` | manifest.yaml schema + バリデーション | publish Step 4 / install Step 3 / update Step 3 |
| `references/central-repo-spec.md` | 中央 repo の構造 + CI workflow | init mode 全体 / publish Step 7-9 |
| `templates/manifest.yaml.template` | manifest 雛形 | publish Step 4 |
| `templates/CHANGELOG.md.template` | CHANGELOG 雛形 | publish Step 5 |
| `SESSION_TEMPLATE.md` | セッション state | RESUME / SESSION SAVE |
| `.claude/skill-shipper-config.yaml.example` | 中央 repo 設定の雛形 | bootstrap Step 2 |

---

## §11 関連 GOVERNANCE_DECISIONS

> 本 hub では governance ADR は consumer 側 (`<consumer_repo>`) の運用ドキュメントに集約する想定。
> 関連する意思決定が公開可能になった時点でリンクを追記する。

- **benchmark-skill governance**: skill-creator 系 skill で品質を計測し、skill-shipper の post-update eval と連携
- **central-repo adoption decision**: cocosil-standard-skills を中央 hub として採用する判断（consumer 側に記録）
