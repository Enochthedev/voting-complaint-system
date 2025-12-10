import { createBrowserClient, type SupabaseClient } from '@supabase/ssr';

// Singleton instance for browser client
let browserClient: SupabaseClient | null = null;

/**
 * Create a Supabase client for use in the browser (Client Components)
 * This client handles session management automatically via cookies
 * Uses singleton pattern to ensure consistent session state across the app
 */
export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
