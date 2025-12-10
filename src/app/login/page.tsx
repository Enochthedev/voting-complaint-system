import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login | Student Complaint System',
  description: 'Sign in to your account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const showResetSuccess = params.reset === 'success';
  const errorType = params.error;
  const redirectPath = params.redirect;

  // Error messages mapping
  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      auth_callback_failed: 'Authentication failed. Please try again.',
      no_code: 'Invalid authentication link. Please try again.',
      unexpected_error: 'An unexpected error occurred. Please try again.',
      auth_required: 'You need to sign in to access that page.',
      session_expired: 'Your session has expired. Please sign in again.',
      invalid_token: 'Invalid or expired authentication token. Please sign in again.',
    };

    return errorMessages[error] || 'An error occurred. Please try again.';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* App Logo/Branding */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg animate-pulse">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-purple-600">
            Sign in to your Student Complaint System account
          </p>
        </div>

        {showResetSuccess && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your password has been reset successfully. You can now sign in with your new password.
            </AlertDescription>
          </Alert>
        )}

        {errorType && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage(errorType)}</AlertDescription>
          </Alert>
        )}

        {redirectPath && !errorType && (
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please sign in to continue to your requested page.</AlertDescription>
          </Alert>
        )}

        <div className="rounded-xl border-2 border-purple-200 bg-white p-8 shadow-xl backdrop-blur-sm">
          <LoginForm />
        </div>

        <div className="text-center text-xs text-purple-600">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
