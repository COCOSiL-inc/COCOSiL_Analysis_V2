import { PostHog } from 'posthog-node'
import { getServerEnv } from '@/lib/env'

let _client: PostHog | null = null

export function getPostHogClient(): PostHog | null {
  const { POSTHOG_API_KEY, POSTHOG_HOST } = getServerEnv()
  if (!POSTHOG_API_KEY) return null

  if (!_client) {
    _client = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST ?? 'https://app.posthog.com',
      flushAt: 20,
      flushInterval: 10000,
    })
  }
  return _client
}

export async function shutdownPostHog(): Promise<void> {
  if (_client) {
    await _client.shutdown()
    _client = null
  }
}
