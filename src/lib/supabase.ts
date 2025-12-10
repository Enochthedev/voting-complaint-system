import { createClient } from '@/lib/supabase/client';

// Create a singleton supabase client for browser use
// This uses the new client utility that properly handles cookies
export const supabase = createClient();
