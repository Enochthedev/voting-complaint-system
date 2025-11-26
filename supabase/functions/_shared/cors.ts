/**
 * Shared CORS headers for Supabase Edge Functions
 *
 * These headers allow the Edge Functions to be called from web browsers
 * and handle CORS preflight requests properly.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
