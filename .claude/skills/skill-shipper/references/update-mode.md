# skill-shipper — update mode

> 中央 repo の最新 version を本 repo の既存 skill に伝播。
> SKILL.md §5 から呼ばれる。

---

## §1 7 ステップ詳細

### Step 1: 対象 skill 選択

```
入力例:
  "/skill-shipper update"               → 本 repo 内の全 skill が対象
  "/skill-shipper update <skill-name>"    → 個別 skill
  "/skill-shipper update --major-only"  → major bump のみ確認

list mode 結果から「update 推奨」のみ抽出することも可能。
```

### Step 2: 中央 repo を pull

```
cd <central_repo.local_path>
git fetch origin main
git checkout main && git pull

各 skill の最新 manifest.yaml を取得し version を読み取る。
```

### Step 3: 本 repo 内の現 version 取得

```
for each skill in .claude/skills/<*>:
  read manifest.yaml の version
  if manifest.yaml が存在しない:
    "本 repo の <skill> は manifest.yaml なし、update 対象外。"
    "publish モードで manifest を生成してから update できます。"
```

### Step 4: version diff 表示

```
=== Update 対象 ===

| Skill            | Local | Central | Type    | Action     |
|------------------|-------|---------|---------|------------|
| <skill-name>       | 0.2.1 | 0.3.0   | minor   | auto merge |
| pre-pr-coherence | 1.0.0 | 2.0.0   | major   | manual ⚠️   |
| skill-shipper    | 0.1.0 | 0.1.2   | patch   | auto merge |

凡例:
  patch: バグ修正のみ、安全に auto merge
  minor: 機能追加 (互換あり)、auto merge + post-update eval
  major: 破壊的変更、CHANGELOG 確認 + 手動 merge
```

### Step 5: user 確認 (skill 単位)

```
skill 単位で user に確認:

  <skill-name> 0.2.1 → 0.3.0 (minor)
    CHANGELOG:
      [0.3.0] - 2026-06-01
        ### Added
        - Phase 0.5 Repo Detection で multi-repo モード追加
        - references/repo-config.md
      ### Changed
        - SKILL.md description (新 trigger 追加)

    本 repo の現状との互換性 check:
      - SKILL.md にローカル変更あり: 0 件
      - references/ にローカル変更あり: 0 件
      → 安全に update 可能

    [y: update / n: skip / d: diff 詳細表示]
```

### Step 6: update 適用

```
適用ロジック (skill 単位):

A. patch / minor (auto merge):
  1. 中央の最新ファイルで .claude/skills/<skill>/ を上書き
  2. 本 repo 固有の config (config_required の置換値) は preserve
     - 例: <product> → koto の置換は維持
  3. manifest.yaml の version を更新

B. major (手動 merge):
  1. CHANGELOG の Breaking Changes セクションを user に提示
  2. 移行ガイドがあれば提示
  3. 一時 branch を作って中央版を別ファイル名でコピー
     例: SKILL.md → SKILL.md.new
  4. user に「diff を比較して手動マージしてください」と案内
  5. 完了後に user が「適用」と言ったら merge を確定

ローカル変更があった場合:
  - merge conflict として扱い、user に解決を委ねる
  - 大事な local 変更は publish mode で逆方向に上げることを提案
```

### Step 7: post-update eval

```
update 完了後に eval を実行 (benchmark-skill governance 連携):

for each updated skill:
  if .claude/skills/<skill>/evals/evals.json が存在:
    /benchmark-skill <skill> を user に提案
    結果を pre-update vs post-update で比較
    pass_rate 低下 ≥ 10% なら rollback 候補として警告

PR body に eval 結果を含める:
  ### Post-update Eval
  - <skill-name>: 0.85 → 0.83 (within tolerance)
  - pre-pr-coherence: 0.78 → 0.45 ⚠️ DEGRADATION
    → rollback または 手動修正を user に確認
```

---

## §2 update PR の作成

```
git checkout -b chore/skill-update-<YYYY-MM-DD>
git add .claude/skills/<updated skills>/

git commit -m "chore(skills): update skills from <central_repo>

Updated:
  - <skill-name>: 0.2.1 → 0.3.0 (minor)
  - skill-shipper: 0.1.0 → 0.1.2 (patch)

Skipped:
  - pre-pr-coherence: 1.0.0 → 2.0.0 (major, manual review pending)

Post-update eval:
  - <skill-name>: pass_rate 0.83 (was 0.85)
  - skill-shipper: not benchmarked

Source:
  - 中央 repo: <central_repo_url>
  - 中央 commit SHA: <SHA>
"
```

---

## §3 失敗モード対策

| 状況 | 対策 |
|---|---|
| 中央 repo の skill が削除されていた | 「中央から削除されました。本 repo の skill は手動で deprecation 判断」 |
| local 変更との merge conflict | 通常の git merge と同じ手順で user に解決させる |
| post-update eval が大幅低下 | 自動 rollback 提案 (`git restore .claude/skills/<skill>`) |
| 中央 repo の manifest schema が breaking change | skill-shipper 自体の update を先に促す |
| 依存 skill が未 install | 連鎖 install を提案、または skip して warning |

---

## §4 自動化のヒント

```
weekly cron で skill-shipper update の dry-run を回す:
  - 「update 推奨があります」を Slack DM で通知 (人手確認後に実行)
  - benchmark-skill 月次計測と組み合わせて中央 repo の品質を監視

CI で「中央 repo に push されたら下流の repo に update PR を起票」する設定:
  - GitHub Actions の repository_dispatch を中央 repo から下流に発火
  - 各下流 repo で自動で skill-shipper update が走る
  - 安全のため auto-merge ではなく PR 作成までにとどめる
```
