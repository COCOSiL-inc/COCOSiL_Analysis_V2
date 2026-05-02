import { z } from 'zod/v4';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().startsWith('https://'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Clerk キーは .env.local に設定してから認証機能が有効になる
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

export const env = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

const serverEnvSchema = z.object({
  // Clerk シークレットキー（認証機能を使用するサーバーコードでのみ呼び出す）
  CLERK_SECRET_KEY: z.string().min(1).optional(),
});

export function getServerEnv() {
  return {
    ...env,
    ...serverEnvSchema.parse(process.env),
  } as const;
}
