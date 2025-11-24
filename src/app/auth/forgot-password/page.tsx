import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password | Student Complaint System',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Forgot password?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No worries, we&apos;ll send you reset instructions
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <ForgotPasswordForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By resetting your password, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
