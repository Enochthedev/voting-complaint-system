'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { getVoteById, submitVoteResponse, hasStudentVoted, getVoteResults } from '@/lib/api/votes';
import type { Vote } from '@/types/database.types';

export default function VoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const voteId = params.id as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [vote, setVote] = React.useState<Vote | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [results, setResults] = React.useState<Record<string, number>>({});
  const [showResults, setShowResults] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Get user role from auth context
  const userRole = user?.role || 'student';
  const userId = user?.id;

  React.useEffect(() => {
    // Wait for auth to load before fetching vote details
    if (!isAuthLoading) {
      loadVoteDetails();
    }
  }, [voteId, isAuthLoading, userRole]);

  const loadVoteDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load vote data
      const voteData = await getVoteById(voteId);

      if (!voteData) {
        setError('Vote not found');
        setIsLoading(false);
        return;
      }

      setVote(voteData);

      // Check if student has voted
      const voted = userId ? await hasStudentVoted(voteId, userId) : false;
      setHasVoted(voted);

      // Load results if user has voted or if user is a lecturer/admin
      const isLecturerOrAdmin = userRole === 'lecturer' || userRole === 'admin';
      if (voted || isLecturerOrAdmin) {
        const voteResults = await getVoteResults(voteId);
        setResults(voteResults);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Error loading vote details:', err);
      setError('Failed to load vote details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedOption) {
      setError('Please select an option before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!userId) {
        setError('You must be logged in to vote');
        return;
      }
      await submitVoteResponse(voteId, userId, selectedOption);

      // Update state
      setHasVoted(true);
      setSelectedOption('');
      setSuccessMessage('Your vote has been submitted successfully!');

      // Load results after voting
      const voteResults = await getVoteResults(voteId);
      setResults(voteResults);
      setShowResults(true);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOptionsArray = (options: any): string[] => {
    if (Array.isArray(options)) {
      return options;
    }
    return [];
  };

  const isVoteClosed = (vote: Vote): boolean => {
    return vote.closes_at ? new Date(vote.closes_at) < new Date() : false;
  };

  const getTotalVotes = (): number => {
    return Object.values(results).reduce((sum, count) => sum + count, 0);
  };

  const getPercentage = (count: number): number => {
    const total = getTotalVotes();
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const canVote = vote && !hasVoted && !isVoteClosed(vote) && vote.is_active;
  const isLecturerOrAdmin = userRole === 'lecturer' || userRole === 'admin';

  if (isLoading || isAuthLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Card className="p-6">
            <Skeleton className="mb-4 h-8 w-3/4" />
            <Skeleton className="mb-6 h-20 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error && !vote) {
    return (
      <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.push('/votes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Votes
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (!vote) {
    return null;
  }

  const optionsArray = getOptionsArray(vote.options);
  const isClosed = isVoteClosed(vote);
  const totalVotes = getTotalVotes();

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/votes')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Votes
        </Button>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Vote Card */}
        <Card className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">{vote.title}</h1>
              {isClosed && <Badge variant="secondary">Closed</Badge>}
              {!vote.is_active && <Badge variant="secondary">Inactive</Badge>}
              {hasVoted && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Voted
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground">{vote.description}</p>
          </div>

          {/* Metadata */}
          <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDate(vote.created_at)}</span>
            </div>

            {vote.closes_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {isClosed ? 'Closed' : 'Closes'} {formatDate(vote.closes_at)}
                </span>
              </div>
            )}

            {showResults && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            )}
          </div>

          {/* Voting Section or Results */}
          {canVote ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Cast Your Vote</h2>
              </div>

              <div className="space-y-3">
                {optionsArray.map((option, index) => (
                  <label
                    key={index}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      selectedOption === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vote-option"
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => setSelectedOption(option)}
                      className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                      disabled={isSubmitting}
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">{option}</span>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleSubmitVote}
                disabled={!selectedOption || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  <BarChart3 className="mr-2 inline-block h-5 w-5" />
                  Vote Results
                </h2>
                {isLecturerOrAdmin && !isClosed && vote.is_active && (
                  <Badge variant="outline">Live Results</Badge>
                )}
              </div>

              {showResults && totalVotes > 0 ? (
                <div className="space-y-4">
                  {optionsArray.map((option, index) => {
                    const count = results[option] || 0;
                    const percentage = getPercentage(count);

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{option}</span>
                          <span className="text-muted-foreground">
                            {count} {count === 1 ? 'vote' : 'votes'} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-6 rounded-lg border border-border bg-muted p-4">
                    <p className="text-center text-sm font-medium text-muted-foreground">
                      Total Votes: {totalVotes}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted p-8 text-center">
                  <p className="text-sm text-muted-foreground">No votes have been cast yet</p>
                </div>
              )}

              {hasVoted && !isClosed && vote.is_active && (
                <Alert className="border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                  <AlertDescription>
                    Thank you for participating! You can view the results above.
                  </AlertDescription>
                </Alert>
              )}

              {isClosed && (
                <Alert>
                  <AlertDescription>
                    This poll has closed. {hasVoted ? 'Thank you for participating!' : ''}
                  </AlertDescription>
                </Alert>
              )}

              {!vote.is_active && (
                <Alert>
                  <AlertDescription>This poll is currently inactive.</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Related Complaint Link */}
          {vote.related_complaint_id && (
            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Related to:</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/complaints/${vote.related_complaint_id}`)}
              >
                View Related Complaint
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
