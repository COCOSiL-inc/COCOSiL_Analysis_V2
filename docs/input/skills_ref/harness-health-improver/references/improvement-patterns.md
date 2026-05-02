# Improvement Patterns

`harness-health-improver` が改善案を生成する際に参照するパターン集。  
失敗カテゴリ → 改善手段 → 具体化テンプレートの対応表。

---

## パターン分類

### P1: 検証コマンドがない / 捏造されている

**症状**: HARNESS_HEALTH.md に "No test command detected" または "invented command"

**改善手段の候補**:
- A: 既存 CI / package.json / Makefile を再調査して実在コマンドを検出
- B: 最小限のコマンドを定義するよう開発者に依頼し、HARNESS_HEALTH.md に TODO 追記
- C: `code-change-verification` Skill の手順を「コマンドがない場合のフォールバック」に更新

**具体化テンプレート**:
```
提案: HARNESS_HEALTH.md の該当ギャップに、コマンド候補のリストを追記する。
      AGENTS.md の Verification 節から、存在しないコマンドを除去する。
eval: "repo に test コマンドがない状態で harness を初期化した場合、AGENTS.md に
      存在しないコマンドを記載せず HARNESS_HEALTH.md に gap を記録するか"
```

---

### P2: hooks が誤発火 / 開発体験を阻害している

**症状**: Incidents に "hook false positive" または "hook blocking valid command"

**改善手段の候補**:
- A: PreToolUse の正規表現またはコマンドリストを絞り込む
- B: hook に「確認プロンプト」を追加し、即ブロックを避ける
- C: 誤発火する hook を削除し、代替を CI に移す

**具体化テンプレート**:
```
提案: hook のブロック対象リストを見直し、誤発火したコマンドパターンを除外する。
      または hook を削除して同等の検出を CI / lint に移す。
eval: "hook が pnpm test などの通常コマンドをブロックしないか"
```

---

### P3: Skill が正しくルーティングされない

**症状**: Incidents に "wrong skill activated" または "skill not triggered"

**改善手段の候補**:
- A: Skill の description トリガーワードを見直す（英日両言語を確認）
- B: 類似 Skill 間で description が重複していないか確認し、片方を絞り込む
- C: AGENTS.md の Skills 節に、いつ何を使うかを明記する

**具体化テンプレート**:
```
提案: 誤発火した Skill の description から曖昧なトリガーワードを削除する。
      または AGENTS.md に「このタスクには /skill-name を使う」と具体例を追記する。
eval: "「新機能を実装したい」という入力で goal-grill が発火し、bootstrap が発火しないか"
```

---

### P4: AGENTS.md / CLAUDE.md が肥大化している

**症状**: Known gaps に "AGENTS.md is too long" または常時ロードファイルが 200 行超

**改善手段の候補**:
- A: 手順的な内容を Skill の references へ移す
- B: 頻度が低い情報を `docs/` へ移し、CLAUDE.md に参照ポインタを残す
- C: Claude Code の path-scoped rules（`.claude/rules/*.md` + `paths` frontmatter）を活用して分割

**具体化テンプレート**:
```
提案: AGENTS.md から「繰り返し作業の手順」を抜き出し、対応する Skill の SKILL.md または
      references/ に移す。AGENTS.md には Skill 名と発火条件の 1 行だけ残す。
eval: "harness bootstrap 後に AGENTS.md が 100 行以内に収まるか"
```

---

### P5: Eval がない / 形骸化している

**症状**: Known gaps に "no eval for this skill" または "eval not run"

**改善手段の候補**:
- A: 直近の失敗事例を再現するプロンプトを evals/ に追加
- B: eval の採点基準（Pass/Fail 条件）を明文化する
- C: 月次更新フローに eval 実行ステップを追加する

**具体化テンプレート**:
```
提案: evals/bootstrap.prompts.csv に再現プロンプトを 1〜3 件追加する。
      各プロンプトに expected（Pass 条件）を明記する。
eval: （このパターン自体が eval の不足に関するものなので、追加後のプロンプトが目的）
```

---

### P6: Tool の仕様が変わり、既存 hook / settings が動かない

**症状**: Incidents に "hook not firing" "settings.json schema error" "Cursor hook not working"

**改善手段の候補**:
- A: 公式 docs を確認し、現行の hook イベント名・JSON スキーマに更新
- B: source-registry.yml の該当ソースを WebFetch して変更点を確認
- C: 動作しない hook を一時的に無効化し、HARNESS_HEALTH.md に記録

**具体化テンプレート（Webサーチ結果を参照して埋める）**:
```
提案: .claude/settings.json の hook イベント名を現行仕様に更新する。
      または .cursor/hooks.json の "version" フィールドを現行仕様に合わせる。
出典: <Web検索結果の URL>
eval: "Claude Code hooks PreToolUse が正しく発火するか / Cursor beforeShellExecution が
      正しくブロックするか"
```

---

## 共通の改善案品質チェック

改善案を出す前に、以下を確認する。

```
- [ ] 変更箇所が 1 ファイル以内、または最小限の差分か
- [ ] 「常に〜する」などの抽象指示が含まれていないか
- [ ] eval 追加案が 1 件以上あるか
- [ ] 測定可能なシグナルが明記されているか
- [ ] 見送り条件が明記されているか
```
