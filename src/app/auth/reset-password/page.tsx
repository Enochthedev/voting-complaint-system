import { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Reset Password | Student Complaint System',
  description: 'Set your new password',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <ResetPasswordForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Make sure to choose a strong password to keep your account secure
        </div>
      </div>
    </div>
  );
}
