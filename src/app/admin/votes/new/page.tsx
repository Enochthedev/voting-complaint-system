'use client';

import * as React from 'react';
import { lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { createVote } from '@/lib/api/votes';
import { useAuth } from '@/hooks/useAuth';
import type { Vote } from '@/types/database.types';

// Lazy load the vote form component
const VoteForm = lazy(() =>
  import('@/components/votes').then((mod) => ({ default: mod.VoteForm }))
);

export default function NewVotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSave = async (voteData: Partial<Vote>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!user?.id) {
        setError('You must be logged in to create votes.');
        return;
      }

      // Create the vote using the API
      const createdVote = await createVote({
        created_by: user.id,
        title: voteData.title!,
        description: voteData.description!,
        options: voteData.options!,
        is_active: voteData.is_active ?? true,
        related_complaint_id: voteData.related_complaint_id || null,
        closes_at: voteData.closes_at || null,
      });

      console.log('Vote created:', createdVote);

      // Show success message
      setSuccess(true);

      // Redirect to votes list after 2 seconds
      setTimeout(() => {
        router.push('/admin/votes');
      }, 2000);
    } catch (err) {
      console.error('Error creating vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/votes');
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Create New Vote</h1>
        <p className="mt-2 text-muted-foreground">
          Create a voting poll for students to participate in
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription>
            Vote created successfully! Redirecting to votes list...
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          }
        >
          <VoteForm onSave={handleSave} onCancel={handleCancel} isLoading={isLoading} />
        </Suspense>
      </Card>
    </div>
  );
}
