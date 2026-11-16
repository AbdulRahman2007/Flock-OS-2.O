import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Only the public anon key goes in the frontend. NEVER put the service_role key here.
let client: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in, then restart "npm run dev".'
    );
  }

  client ??= createClient(url, anonKey);
  return client;
}
