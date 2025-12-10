import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const supabase = await createServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        // Redirect to login with error
        return NextResponse.redirect(
          new URL('/login?error=auth_callback_failed', requestUrl.origin)
        );
      }

      // Check if this is a password reset flow
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // If user just signed up or reset password, redirect to reset-password page
        // Otherwise redirect to the next page (usually dashboard)
        const isPasswordReset = requestUrl.searchParams.get('type') === 'recovery';

        if (isPasswordReset) {
          return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
        }

        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(new URL('/login?error=unexpected_error', requestUrl.origin));
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin));
}
