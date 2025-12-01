'use client';

import * as React from 'react';
import { lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { VoteCardSkeleton } from '@/components/ui/skeletons';
import {
  Vote as VoteIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getVotes, submitVoteResponse, hasStudentVoted } from '@/lib/api/votes';
import type { Vote } from '@/types/database.types';
import { CardLoadingFallback } from '@/lib/utils/lazy-load';

// Lazy load vote card component for better performance
const VoteCard = lazy(() =>
  import('@/components/votes/vote-card').then((mod) => ({ default: mod.VoteCard }))
);

export default function VotesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [votes, setVotes] = React.useState<Vote[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [votedPolls, setVotedPolls] = React.useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({});
  const [submittingVote, setSubmittingVote] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successVoteId, setSuccessVoteId] = React.useState<string | null>(null);

  // TODO: Phase 12 - Get actual student ID from auth context
  const mockStudentId = user?.id || 'mock-student-id';

  React.useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
      return;
    }
    if (user) {
      loadVotes();
    }
  }, [user, authLoading, authError, router]);

  const loadVotes = async () => {
    try {
      setIsLoading(true);
      // Get only active votes
      const data = await getVotes({ isActive: true });
      setVotes(data);

      // Check which votes the student has already voted on
      const votedSet = new Set<string>();
      for (const vote of data) {
        const hasVoted = await hasStudentVoted(vote.id, mockStudentId);
        if (hasVoted) {
          votedSet.add(vote.id);
        }
      }
      setVotedPolls(votedSet);
    } catch (error) {
      console.error('Error loading votes:', error);
      setError('Failed to load votes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (voteId: string, option: string) => {
    setSelectedOptions({
      ...selectedOptions,
      [voteId]: option,
    });
  };

  const handleSubmitVote = async (voteId: string) => {
    const selectedOption = selectedOptions[voteId];
    if (!selectedOption) {
      setError('Please select an option before submitting');
      return;
    }

    setSubmittingVote(voteId);
    setError(null);
    setSuccessVoteId(null);

    try {
      await submitVoteResponse(voteId, mockStudentId, selectedOption);

      // Mark this vote as voted
      setVotedPolls(new Set([...votedPolls, voteId]));

      // Clear selection
      const newSelections = { ...selectedOptions };
      delete newSelections[voteId];
      setSelectedOptions(newSelections);

      // Show success message
      setSuccessVoteId(voteId);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessVoteId(null);
      }, 3000);
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit vote. Please try again.');
    } finally {
      setSubmittingVote(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const activeVotes = votes.filter((v) => !isVoteClosed(v));
  const closedVotes = votes.filter((v) => isVoteClosed(v));

  if (authLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Active Votes</h1>
            <p className="text-muted-foreground mt-1">
              Participate in voting polls and share your opinion
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <VoteCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Votes</h1>
          <p className="text-muted-foreground mt-1">
            Participate in voting polls and share your opinion
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <VoteCardSkeleton key={i} />
            ))}
          </div>
        ) : activeVotes.length === 0 && closedVotes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <VoteIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No votes available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back later for new voting polls
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Votes */}
            {activeVotes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Active Polls</h2>
                {activeVotes.map((vote) => {
                  const optionsArray = getOptionsArray(vote.options);
                  const hasVoted = votedPolls.has(vote.id);
                  const isSubmitting = submittingVote === vote.id;
                  const showSuccess = successVoteId === vote.id;

                  return (
                    <Card key={vote.id} className="p-4 sm:p-6">
                      <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className="cursor-pointer text-lg sm:text-xl font-semibold text-foreground hover:text-primary"
                              onClick={() => router.push(`/votes/${vote.id}`)}
                            >
                              {vote.title}
                            </h3>
                            {hasVoted && (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Voted
                              </Badge>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{vote.description}</p>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {formatDate(vote.created_at)}</span>
                        </div>

                        {vote.closes_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Closes {formatDate(vote.closes_at)}</span>
                          </div>
                        )}
                      </div>

                      {showSuccess && (
                        <Alert className="mb-4 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <AlertDescription>
                            Your vote has been submitted successfully!
                          </AlertDescription>
                        </Alert>
                      )}

                      {hasVoted ? (
                        <div className="space-y-3">
                          <div className="rounded-lg border border-border bg-muted p-4">
                            <p className="text-sm font-medium text-muted-foreground">
                              You have already voted on this poll. Thank you for participating!
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/votes/${vote.id}`)}
                            className="w-full"
                          >
                            View Results
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">Select your choice:</p>
                          {optionsArray.map((option, index) => (
                            <label
                              key={index}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                                selectedOptions[vote.id] === option
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:bg-muted'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`vote-${vote.id}`}
                                value={option}
                                checked={selectedOptions[vote.id] === option}
                                onChange={() => handleOptionSelect(vote.id, option)}
                                className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary"
                                disabled={isSubmitting}
                              />
                              <span className="flex-1 text-sm font-medium text-foreground">
                                {option}
                              </span>
                            </label>
                          ))}

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={() => handleSubmitVote(vote.id)}
                              disabled={!selectedOptions[vote.id] || isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/votes/${vote.id}`)}
                              className="sm:w-auto"
                            >
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Closed Votes */}
            {closedVotes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Closed Polls</h2>
                {closedVotes.map((vote) => {
                  const optionsArray = getOptionsArray(vote.options);
                  const hasVoted = votedPolls.has(vote.id);

                  return (
                    <Card key={vote.id} className="p-6 opacity-75">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-foreground">{vote.title}</h3>
                            <Badge variant="secondary">Closed</Badge>
                            {hasVoted && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Voted
                              </Badge>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{vote.description}</p>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Closed {vote.closes_at ? formatDate(vote.closes_at) : 'recently'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-lg border border-border bg-muted p-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            This poll has closed. {hasVoted ? 'Thank you for participating!' : ''}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/votes/${vote.id}`)}
                          className="w-full"
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
