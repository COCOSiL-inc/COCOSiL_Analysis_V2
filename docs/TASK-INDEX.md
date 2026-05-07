---
doc_id: canonical.cocosil.task-index
title: COCOSiL V2 TASK-INDEX — 機能別タスク管理
doc_type: task-index
product: cocosil
layer: canonical
status: active
updated_at: 2026-05-07
---

# COCOSiL V2 TASK-INDEX

> **目的**: 機能別・担当者別の作業状況を一覧管理し、「今の自分のタスクに必要な文書」に5秒でたどり着けるようにする。  
> **更新タイミング**: PR作成前（`/finish-task` のStep 1.5 で確認）。フェーズが変わったら必ずこの表を更新する。

---

## TSK ID 命名規則

```
TSK-[分類]-[番号3桁]
```

| 分類 | 対象領域 | 例 |
|------|---------|-----|
| `DB` | DBスキーマ・マイグレーション | TSK-DB-001 |
| `UI` | フロントエンド・コンポーネント | TSK-UI-001 |
| `API` | APIルート・バックエンドロジック | TSK-API-001 |
| `PROMPT` | AIプロンプト・言語設計 | TSK-PROMPT-001 |
| `DOCS` | ドキュメント・ハーネス設計 | TSK-DOCS-001 |
| `CHORE` | 設定・依存関係・CI | TSK-CHORE-001 |

---

## 機能別タスク一覧

### F1 — オンボーディング・登録

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| TSK-UI-002 | F1 ウェルカム対話UIコンポーネント | まあみ | 未着手 | — | — | [§4.1](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| TSK-API-001 | F1 オンボーディングAPI | ヒラメ | 未着手 | — | — | [§4.1](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F2 — 性格分析・自動診断

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-UI-001** | F2 フロントUI改良＆UIコンポーネント定義 | まあみ | 🟡 実装中 | [#28](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/28) | [TSK-UI-001-f2-ui-component-design.md](output/tasks/TSK-UI-001-f2-ui-component-design.md) | [§4.2](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| **TSK-DB-001** | DB構造整理（profiles/chat_sessions/weights） | ヒラメ | 🟡 実装中 | [#27](https://github.com/COCOSiL-inc/COCOSiL_Analysis_V2/issues/27) | [TSK-DB-001-db-schema-cleanup.md](output/tasks/TSK-DB-001-db-schema-cleanup.md) | [§4.1〜4.2](output/requirements/cocosil_v2_detailed_requirements_specification.md) + [impl-plan](output/roadmap/impl-plan-near-soft-feedback-loop.md) |

---

### F3 — 統合レポート

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F3 統合レポートUI | まあみ | 未着手 | — | — | [§4.3](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| — | F3 Gammaレポート生成API | ヒラメ | 未着手 | — | — | [§4.3](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| — | F3 統合レポートプロンプト | えんまさ | 未着手 | — | — | [§4.3](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F4 — 共感AIチャット

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F4 チャットUIコンポーネント | まあみ | 未着手 | — | — | [§4.4](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| — | F4 チャットAPIルート | ヒラメ | 未着手 | — | — | [§4.4](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| — | F4 5フェーズ共感プロンプト | えんまさ | 未着手 | — | — | [§4.4](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F5 — アクション記録

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F5 アクション記録UI | まあみ | 未着手 | — | — | [§4.5](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| — | F5 アクション記録API | ヒラメ | 未着手 | — | — | [§4.5](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F6 — SNSシェアカード

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F6 シェアカード生成UI | まあみ | 未着手 | — | — | [§4.6](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F7 — 課金・サブスクリプション（Stripe）

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F7 Stripe統合API | ヒラメ | 未着手 | — | — | [§4.7](output/requirements/cocosil_v2_detailed_requirements_specification.md) |
| — | F7 課金UIコンポーネント | まあみ | 未着手 | — | — | [§4.7](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F8 — データオーナーシップ・プライバシー

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F8 データエクスポート/削除API | ヒラメ | 未着手 | — | — | [§4.8](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F9 — 管理・運用基盤

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F9 管理ダッシュボード | 未定 | 未着手 | — | — | [§4.9](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### F10 — 言語ガバナンス

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| — | F10 言語ガバナンスCI整備 | 未定 | 未着手 | — | — | [§4.10](output/requirements/cocosil_v2_detailed_requirements_specification.md) |

---

### ハーネス・ドキュメント

| TSK ID | タスク名 | 担当 | フェーズ | Issue | TSKファイル | 参照要件 |
|--------|---------|------|---------|-------|-------------|---------|
| **TSK-DOCS-001** | 開発体制強化（TASK管理・ハーネス修正） | えんまさ | 🔴 レビュー中 | — | [TSK-DOCS-001-dev-harness-task-management.md](output/tasks/TSK-DOCS-001-dev-harness-task-management.md) | [AGENTS.md §7〜9](../AGENTS.md) |

---

## フェーズ凡例

| アイコン | フェーズ | 意味 |
|---------|---------|------|
| — | 未着手 | Issue未作成・実装着手前 |
| 🔵 | 設計中 | Issue作成済み・設計検討中 |
| 🟡 | 実装中 | ブランチ作成済み・実装進行中 |
| 🔴 | レビュー中 | PR作成済み・レビュー待ち |
| ✅ | 完了 | main マージ済み |

---

> **TASK-INDEXの更新方法**:  
> 1. `/start-task` → Issue作成後に Issue # 列を更新  
> 2. ブランチ作成後に「未着手 → 実装中」  
> 3. PR作成後に「実装中 → レビュー中」  
> 4. マージ後に「レビュー中 → 完了」  
> `/finish-task` の Step 1.5 がこの更新を毎回促す。
