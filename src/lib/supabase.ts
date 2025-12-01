import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create a single supabase client for interacting with your database
// Using createBrowserClient from @supabase/ssr for proper cookie-based session management
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto-refresh tokens when they're about to expire
    autoRefreshToken: true,
    // Persist session to storage
    persistSession: true,
    // Detect session in URL (for OAuth callbacks)
    detectSessionInUrl: true,
  },
});
