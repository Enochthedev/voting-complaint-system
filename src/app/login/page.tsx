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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Student Complaint System account
          </p>
          <div className="mt-4 rounded-md bg-muted p-3">
            <p className="text-xs text-foreground">
              🎭 <strong>Mock Auth Mode:</strong> Use any test account with password{' '}
              <code className="rounded bg-background px-1 border">password123</code>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try: student@test.com, lecturer@test.com, or admin@test.com
            </p>
          </div>
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

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <LoginForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
