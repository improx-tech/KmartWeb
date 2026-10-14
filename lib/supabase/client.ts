import { createClient as _createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Single shared client — required for Realtime WebSocket to work correctly.
// Using @supabase/supabase-js createClient (NOT @supabase/ssr) so that the
// Realtime channel is shared across all components and never duplicated.
export const supabase = _createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Named export so browser.ts can re-export it
export function createClient() {
  return supabase;
}
