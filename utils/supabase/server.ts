import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

/**
 * Server-side Supabase client.
 * Pass the Clerk session JWT as accessToken to enforce RLS via auth.jwt() ->> 'sub'.
 * Without it, RLS policies requiring a JWT subject will block writes.
 *
 * Setup required in Clerk dashboard:
 *   JWT Templates → create "supabase" template with claim: { "sub": "{{user.id}}" }
 *
 * Usage in API Route:
 *   const { getToken } = await auth();
 *   const token = await getToken({ template: 'supabase' });
 *   const supabase = createSupabaseServerClient(token);
 */
export function createSupabaseServerClient(accessToken?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase env vars are not configured.');
  }

  return createClient<Database>(url, anonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: { persistSession: false },
  });
}
