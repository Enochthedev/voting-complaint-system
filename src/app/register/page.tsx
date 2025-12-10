import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register | Student Complaint System',
  description: 'Create your account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-teal-600">Join the Student Complaint System</p>
        </div>

        <div className="rounded-xl border-2 border-teal-200 bg-white p-8 shadow-xl backdrop-blur-sm">
          <RegisterForm />
        </div>

        <div className="text-center text-xs text-teal-600">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
