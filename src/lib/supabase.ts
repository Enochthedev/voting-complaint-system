import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Lazy-load singleton supabase client for browser use
// This uses the new client utility that properly handles cookies
// Client is created only when first accessed (at runtime, not build time)
let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient();
  }
  return _supabase;
}

// Export a getter that creates the client on first access
// This prevents client creation during build time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // Bind methods to the client instance
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
