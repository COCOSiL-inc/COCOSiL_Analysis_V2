# skill-shipper — install / list modes

> 中央 repo から本 repo に skill を取り込む / list を表示。
> SKILL.md §4, §6 から呼ばれる。

---

## §1 install mode 8 ステップ

### Step 1: 対象 skill + version 選択

```
入力例:
  "/skill-shipper install <skill-name>"           → latest version
  "/skill-shipper install <skill-name>@0.2.1"     → 特定 version
  "/skill-shipper install <skill-name>,pre-pr"    → 複数

未指定の場合は list mode を先に表示し、user に選ばせる。
```

### Step 2: 中央 repo を clone / pull

```
publish-mode.md Step 7 と同じ。
中央 repo の skills/<skill>/manifest.yaml を読む。
```

### Step 3: manifest 解析

```
中央 manifest.yaml から取得:
  - version
  - dependencies.skills (再帰 install 対象)
  - dependencies.external (CLI 確認)
  - config_required (本 repo で設定必須項目)
  - files (コピー対象一覧)
  - compatibility (claude_code / claude_models)

本 repo の互換性チェック:
  - claude_code version (現状は固定値、将来 manifest で取得)
  - 既存の claude_models (本 repo の AGENTS.md / CLAUDE.md から取得)
  - 不一致あれば warning
```

### Step 4: 依存解決

```
dependencies.skills を再帰的に解決:

graph_visit(skill):
  for dep in central[skill].dependencies.skills:
    if dep not in local_skills:
      確認: 「依存 skill <dep> も install しますか？ [y/n]」
      if y: graph_visit(dep) して install
      if n: 中断 or skill そのものを install しない選択

dependencies.external (gh / uv / python など):
  各 CLI の version check (--version)
  不足あれば user に install 案内 (中断はしない、warning のみ)
```

### Step 5: config_required 確認

```
中央 manifest.config_required に列挙された placeholder を本 repo で解決:

例: <product>, <impl_path>, <spec_path>

本 repo の既存 .claude/grill-config.yaml や .claude/skill-shipper-config.yaml に
ある場合は自動採用。無ければ user に入力を促す:

  「skill <name> は以下の config が必須です:
     - product: ?
     - impl_path: ?
   入力してください (Enter for default):
     product (default: koto): _
     ...」
```

### Step 6: PREVIEW 承認ゲート

```
=== Install Preview ===

対象 skill: <name>@<version>
中央 repo: <central_repo>
本 repo: <current repo>

依存 skill (auto install):
  - <dep1>@<ver>
  - <dep2>@<ver>

config:
  product: koto
  impl_path: .

書込み計画:
  + .claude/skills/<skill>/SKILL.md
  + .claude/skills/<skill>/manifest.yaml
  + .claude/skills/<skill>/SESSION_TEMPLATE.md (該当時)
  + .claude/skills/<skill>/references/*.md
  + .claude/skills/<skill>/templates/*.template (該当時)
  + .claude/skills/<skill>/evals/evals.json (該当時)

CLAUDE.md 更新 (任意):
  - "## Skills" 節に <skill> 行を追加 [y/n]

依存外部 CLI:
  ✓ gh: 2.40.0 OK
  ✗ uv: not installed (warning) → 後で `brew install uv` 等を実行してください

このまま install しますか？ [承認/n/修正]
```

### Step 7: ファイルコピー

```
cd <本 repo>
mkdir -p .claude/skills/<skill>

中央 repo の skills/<skill>/* を .claude/skills/<skill>/ にコピー。
config_required の placeholder は user 入力で置換 (本 repo 専用版を生成)。

例:
  中央: <product> → 本 repo: koto に置換
  中央: <impl_path> → 本 repo: . に置換
```

### Step 8: 本 repo の git workflow

```
git checkout -b feat/install-<skill>-<version>
git add .claude/skills/<skill>/
git add CLAUDE.md (任意更新時)
git commit -m "feat(skills): install <skill>@<version> from <central_repo>

依存 skill:
  - <dep1>@<ver>
  - <dep2>@<ver>

config:
  - product: koto
  ...

Source:
  - 中央 repo: <central_repo_url>
  - 中央 manifest version: <ver>
  - 中央 commit SHA: <SHA>

Refs: <decision-id>, <skill>"
git push -u origin feat/install-<skill>-<version>
gh pr create ...
```

---

## §2 list mode

### 表示形式

```
=== Skill 一覧 ===

中央 repo: <central_repo_name> (<git_url>) [last fetch: YYYY-MM-DD HH:MM]

| Skill            | Latest | Local  | Status        |
|------------------|--------|--------|---------------|
| <skill-name>       | 0.3.0  | 0.2.1  | 🆙 update 推奨  |
| pre-pr-coherence | 1.0.0  | 1.0.0  | ✅ up to date  |
| skill-shipper    | 0.1.0  | 0.1.0  | ✅ up to date  |
| <new-skill>      | 0.1.0  | -      | 📦 install 可  |
| <deprecated>     | 0.5.0  | 0.6.0  | ⚠️ local newer |

依存関係:
  <skill-name>@0.3.0:
    - skills: skill-shipper@>=0.1.0
    - external: gh, uv

実行可能:
  - /skill-shipper update <skill-name>
  - /skill-shipper install <new-skill>
  - /skill-shipper publish <local newer> （local が central より新しい場合）
```

### 取得ロジック

```
1. 中央 repo を git pull (--depth 1 で速く)
2. 中央 repo の skills/*/manifest.yaml を全 parse
3. 本 repo の .claude/skills/*/manifest.yaml を全 parse
4. 比較表生成 (semver compare)

中央 repo が未設定:
  「中央 repo が設定されていません。
   /skill-shipper init で初期化するか、~/.claude/skill-shipper-config.yaml に
   設定してください。」
```

---

## §3 失敗モード

| 状況 | 対策 |
|---|---|
| 中央 repo に target skill が無い | typo 確認、list mode で正確な name を提示 |
| 依存 skill の install で循環参照 | 検出して中断、user に「skill 設計の見直しが必要」と通知 |
| 本 repo に既に install 済 | update mode を提案 |
| config_required が解決できない | 各 placeholder の意味を user に説明、デフォルト値があれば採用提案 |
| version 不一致で manifest schema が違う | 中央 repo の最新 schema に追従、本 repo の skill-shipper 自体を update 提案 |

---

## §4 install 後の検証

```
install 完了後に自動実行:

1. .claude/skills/<skill>/SKILL.md を Read
2. SKILL description が正しく triggered するか static check
3. references/*.md のリンク切れチェック
4. evals/evals.json があれば /benchmark-skill <skill> を user に提案

異常があれば PR body に warning として記載。
```
