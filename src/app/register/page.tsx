import { Metadata } from 'next';
import { RegisterForm } from '@/components/register-form';

export const metadata: Metadata = {
  title: 'Register | Student Complaint System',
  description: 'Create your account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Join the Student Complaint System</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <RegisterForm />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
