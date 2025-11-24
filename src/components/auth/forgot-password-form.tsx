'use client';

import * as React from 'react';
import { resetPassword, isValidEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface FormErrors {
  email?: string;
  general?: string;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('');
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors and success state
    setErrors({});
    setIsSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const error = await resetPassword(email.trim());

      if (error) {
        setErrors({
          general: error.message || 'Failed to send password reset email. Please try again.',
        });
        return;
      }

      // Success - show success message
      setIsSuccess(true);
      setEmail(''); // Clear the email field
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear email error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Password reset email sent! Please check your inbox and follow the instructions to reset your password.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you don&apos;t see the email, please check your spam folder.
          </p>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsSuccess(false)}
          >
            Send another email
          </Button>

          <div className="text-center">
            <a
              href="/auth/login"
              className="text-sm font-medium text-foreground hover:underline"
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="student@university.edu"
          value={email}
          onChange={handleEmailChange}
          disabled={isLoading}
          className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
          autoComplete="email"
          autoFocus
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          'Send reset link'
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          Remember your password?{' '}
        </span>
        <a
          href="/auth/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </a>
      </div>
    </form>
  );
}
