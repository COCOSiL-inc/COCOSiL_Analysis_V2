# Google Workspace会社ロゴ 要件定義

## 目的

株式会社COCOSILのGoogle Workspace環境で使用する会社ロゴを制作する。Gmail、Drive、CalendarなどのWorkspaceサービス上で、組織としての信頼感とCOCOSiLらしい温かさが伝わることを目的とする。

## 確定要件

| 項目 | 要件 |
|---|---|
| 用途 | Google Workspace 管理画面の会社ロゴ |
| 最終サイズ | `320x132px` |
| 推奨形式 | PNG |
| ファイルサイズ目標 | 可能なら `30KB` 以下 |
| 表記 | `COCOSIL` |
| ブランドカラー | `#5B21B6`, `#A855F7`, `#7C3AED -> #A855F7 -> #C062F5`, `#FFFFFF`, `#F9FAFB` |
| トーン | 落ち着いた、誠実、科学的、信頼感、少し温かい |
| 避ける印象 | 怪しい、過度に派手、スピリチュアルに見える、チャラい |

## 比較案

| 案 | ファイル | 狙い | 評価 |
|---|---|---|---|
| A | `variant-a-existing-heart.png` | 既存ハートロゴを活かし、COCOSIL表記を添えた案 | ブランド継承は強いが、Workspaceの小サイズでは余白調整が必要 |
| B | `variant-b-wordmark.png` | ハートアイコン + `COCOSIL` ワードマークの横長案 | 会社ロゴとして最も読みやすく、Google Workspace用途に適する |
| C | `variant-c-minimal-symbol.png` | ハートシンボル中心のミニマル案 | シンボル認知には強いが、会社名の明示性は低い |

## 推奨案

最終版は案Bをベースにする。

理由:

- Google Workspaceの横長表示で、会社名 `COCOSIL` が最も読みやすい。
- 既存のハートシンボルを残しつつ、会社ロゴとしての信頼感を出しやすい。
- 小さく表示された場合も、シンボルと文字の役割が分かれ、識別しやすい。

## 納品物

| ファイル | 用途 |
|---|---|
| `variant-a-existing-heart.png` | 比較用案A |
| `variant-b-wordmark.png` | 比較用案B |
| `variant-c-minimal-symbol.png` | 比較用案C |
| `google-workspace-company-logo-320x132.png` | Google Workspaceアップロード用の最終版 |
| `google-workspace-company-logo-source.png` | 最終版の元画像 |

## Google Workspace設定メモ

- 管理コンソールの `Account settings -> Personalization` からアップロードする。
- PNG形式を推奨する。
- 反映には最大数日かかる場合がある。
- 表示は主にデスクトップ向けで、モバイルでは表示されない場合がある。
