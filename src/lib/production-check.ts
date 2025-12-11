/**
 * Production Environment Check
 *
 * This utility helps diagnose production deployment issues
 */

export function checkProductionEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBrowser = typeof window !== 'undefined';

  if (!isBrowser) return; // Only run in browser

  console.log('🔍 Production Environment Check:', {
    environment: process.env.NODE_ENV,
    isProduction,
    url: window.location.origin,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set (using default)',
  });

  // Check for common production issues
  const issues = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }

  if (isProduction && process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
    issues.push('NEXT_PUBLIC_APP_URL is set to localhost in production');
  }

  if (issues.length > 0) {
    console.error('❌ Production Configuration Issues:', issues);
  } else {
    console.log('✅ Production environment looks good');
  }

  return issues;
}

// Auto-run check in development and production
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure environment is loaded
  setTimeout(checkProductionEnvironment, 1000);
}
