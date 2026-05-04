<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your project. The following changes were made:

- **`instrumentation-client.ts`** (新規作成): Next.js 15.3+ 推奨の `instrumentation-client.ts` で `posthog-js` を初期化。リバースプロキシ経由 (`/ingest`) で送信し、例外キャプチャ (`capture_exceptions: true`) を有効化。
- **`next.config.ts`** (更新): `/ingest/*` と `/ingest/static/*`、`/ingest/array/*` を PostHog の取り込みエンドポイントにリダイレクトするリバースプロキシを設定。
- **`app/diagnosis/mbti/components/MbtiQuiz.tsx`** (更新): `mbti_quiz_completed`（クイズ完了送信時）と `mbti_direct_type_selected`（既知タイプ直接選択時）を追加。サーバー側との correlate のため `X-POSTHOG-DISTINCT-ID` ヘッダーを API リクエストに付与。エラーキャプチャも追加。
- **`app/diagnosis/mbti/components/MbtiResult.tsx`** (更新): `mbti_result_viewed`（結果表示時、ファネル上位）を `useEffect` で送信、`mbti_quiz_retried`（再診断ボタンクリック時）をイベントハンドラで送信。
- **`app/api/diagnosis/mbti/route.ts`** (更新): 既存の `getPostHogClient()` を使用してサーバーサイドイベント `mbti_diagnosis_saved` を送信。クライアントから受け取った `X-POSTHOG-DISTINCT-ID` で distinct ID を統一。
- **`.npmrc`** (新規作成): pnpm ストアパスを統一するための設定。
- **環境変数**: `.env.local` に `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`、`NEXT_PUBLIC_POSTHOG_HOST`、`POSTHOG_API_KEY`、`POSTHOG_HOST` を設定。

## Events

| イベント名 | 説明 | ファイル |
|---|---|---|
| `mbti_quiz_completed` | ユーザーが12問すべてに回答して送信 | `app/diagnosis/mbti/components/MbtiQuiz.tsx` |
| `mbti_direct_type_selected` | ユーザーが既知のMBTIタイプを直接選択 | `app/diagnosis/mbti/components/MbtiQuiz.tsx` |
| `mbti_result_viewed` | 診断結果画面を閲覧（ファネル最上位） | `app/diagnosis/mbti/components/MbtiResult.tsx` |
| `mbti_quiz_retried` | 「もう一度診断する」ボタンをクリック | `app/diagnosis/mbti/components/MbtiResult.tsx` |
| `mbti_diagnosis_saved` | サーバー側：診断結果を DB に保存完了 | `app/api/diagnosis/mbti/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: https://us.posthog.com/project/409078/dashboard/1541830
- **MBTI診断 コンバージョンファネル**: https://us.posthog.com/project/409078/insights/jVrw9nWt
- **診断完了数（日別トレンド）**: https://us.posthog.com/project/409078/insights/zPIU3mrq
- **クイズ完了 vs 直接選択**: https://us.posthog.com/project/409078/insights/tJNcU09M
- **リトライ率（結果閲覧後の再診断）**: https://us.posthog.com/project/409078/insights/QDvoRV4K
- **MBTIタイプ別 結果閲覧分布**: https://us.posthog.com/project/409078/insights/eFttWNWE

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
