import { z } from 'zod/v4';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().startsWith('https://'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

const serverEnvSchema = z.object({});

export function getServerEnv() {
  return {
    ...env,
    ...serverEnvSchema.parse(process.env),
  } as const;
}
