'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Vote as VoteIcon,
  Calendar,
  Users,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { getVotes, deleteVote, closeVote, reopenVote, getVoteResults } from '@/lib/api/votes';
import { VoteForm } from '@/components/votes/vote-form';
import type { Vote } from '@/types/database.types';

export default function AdminVotesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [votes, setVotes] = React.useState<Vote[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingVote, setEditingVote] = React.useState<Vote | null>(null);
  const [deletingVoteId, setDeletingVoteId] = React.useState<string | null>(null);
  const [voteResults, setVoteResults] = React.useState<Record<string, Record<string, number>>>({});
  const [expandedVoteId, setExpandedVoteId] = React.useState<string | null>(null);

  // TODO: Phase 12 - Get actual lecturer ID from auth context
  const mockLecturerId = user?.id || 'lecturer-1';

  React.useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
      return;
    }
    // Only allow lecturers and admins
    if (user && user.role === 'student') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      loadVotes();
    }
  }, [user, authLoading, authError, router]);

  const loadVotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Get all votes created by this lecturer
      const data = await getVotes({ createdBy: mockLecturerId });
      setVotes(data);

      // Load results for all votes
      const results: Record<string, Record<string, number>> = {};
      for (const vote of data) {
        const voteResult = await getVoteResults(vote.id);
        results[vote.id] = voteResult;
      }
      setVoteResults(results);
    } catch (err) {
      console.error('Error loading votes:', err);
      setError('Failed to load votes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVote = async (voteData: Partial<Vote>) => {
    try {
      setError(null);
      // TODO: Phase 12 - Use real API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setShowCreateForm(false);
      await loadVotes();
    } catch (err) {
      console.error('Error creating vote:', err);
      setError('Failed to create vote. Please try again.');
    }
  };

  const handleUpdateVote = async (voteData: Partial<Vote>) => {
    try {
      setError(null);
      // TODO: Phase 12 - Use real API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setEditingVote(null);
      await loadVotes();
    } catch (err) {
      console.error('Error updating vote:', err);
      setError('Failed to update vote. Please try again.');
    }
  };

  const handleDeleteVote = async (voteId: string) => {
    if (!confirm('Are you sure you want to delete this vote? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingVoteId(voteId);
      setError(null);
      await deleteVote(voteId);
      await loadVotes();
    } catch (err) {
      console.error('Error deleting vote:', err);
      setError('Failed to delete vote. Please try again.');
    } finally {
      setDeletingVoteId(null);
    }
  };

  const handleToggleVoteStatus = async (vote: Vote) => {
    try {
      setError(null);
      if (vote.is_active) {
        await closeVote(vote.id);
      } else {
        await reopenVote(vote.id);
      }
      await loadVotes();
    } catch (err) {
      console.error('Error toggling vote status:', err);
      setError('Failed to update vote status. Please try again.');
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

  const getTotalVotes = (voteId: string): number => {
    const results = voteResults[voteId] || {};
    return Object.values(results).reduce((sum, count) => sum + count, 0);
  };

  const getOptionPercentage = (voteId: string, option: string): number => {
    const total = getTotalVotes(voteId);
    if (total === 0) return 0;
    const count = voteResults[voteId]?.[option] || 0;
    return Math.round((count / total) * 100);
  };

  const isVoteClosed = (vote: Vote): boolean => {
    return vote.closes_at ? new Date(vote.closes_at) < new Date() : false;
  };

  const toggleExpandVote = (voteId: string) => {
    setExpandedVoteId(expandedVoteId === voteId ? null : voteId);
  };

  if (authLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'lecturer'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <Skeleton className="h-12 w-[300px]" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showCreateForm) {
    return (
      <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Vote</h1>
            <p className="text-muted-foreground mt-1">
              Create a voting poll for students to participate in
            </p>
          </div>

          <Card className="p-6">
            <VoteForm onSave={handleCreateVote} onCancel={() => setShowCreateForm(false)} />
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (editingVote) {
    return (
      <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Vote</h1>
            <p className="text-muted-foreground mt-1">Update the voting poll details</p>
          </div>

          <Card className="p-6">
            <VoteForm
              vote={editingVote}
              onSave={handleUpdateVote}
              onCancel={() => setEditingVote(null)}
            />
          </Card>
        </div>
      </AppLayout>
    );
  }

  const activeVotes = votes.filter((v) => v.is_active && !isVoteClosed(v));
  const closedVotes = votes.filter((v) => !v.is_active || isVoteClosed(v));

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Votes</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage voting polls for students
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Vote
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-3/4 rounded bg-muted"></div>
                  <div className="h-4 w-full rounded bg-muted"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-24 rounded bg-muted"></div>
                    <div className="h-8 w-24 rounded bg-muted"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : votes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <VoteIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No votes created yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first voting poll to gather student opinions
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4">
              <Plus className="h-4 w-4" />
              Create Your First Vote
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Votes */}
            {activeVotes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Active Polls ({activeVotes.length})
                </h2>
                {activeVotes.map((vote) => {
                  const optionsArray = getOptionsArray(vote.options);
                  const totalVotes = getTotalVotes(vote.id);
                  const isExpanded = expandedVoteId === vote.id;
                  const isDeleting = deletingVoteId === vote.id;

                  return (
                    <Card key={vote.id} className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-foreground">{vote.title}</h3>
                            <Badge className="bg-green-500 text-white">Active</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{vote.description}</p>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(vote.created_at)}</span>
                        </div>

                        {vote.closes_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Closes {formatDate(vote.closes_at)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                      </div>

                      {/* Results Preview */}
                      <div className="mb-4 rounded-lg border border-border bg-muted p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground">Current Results</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpandVote(vote.id)}
                          >
                            <BarChart3 className="h-4 w-4" />
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </Button>
                        </div>

                        {isExpanded ? (
                          <div className="space-y-3">
                            {optionsArray.map((option, index) => {
                              const count = voteResults[vote.id]?.[option] || 0;
                              const percentage = getOptionPercentage(vote.id, option);

                              return (
                                <div key={index} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">{option}</span>
                                    <span className="text-muted-foreground">
                                      {count} ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                                    <div
                                      className="h-full bg-primary transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {totalVotes === 0
                              ? 'No votes yet'
                              : `${totalVotes} ${totalVotes === 1 ? 'student has' : 'students have'} voted`}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingVote(vote)}>
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVoteStatus(vote)}
                        >
                          <Lock className="h-4 w-4" />
                          Close Vote
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVote(vote.id)}
                          disabled={isDeleting}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Closed Votes */}
            {closedVotes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Closed Polls ({closedVotes.length})
                </h2>
                {closedVotes.map((vote) => {
                  const optionsArray = getOptionsArray(vote.options);
                  const totalVotes = getTotalVotes(vote.id);
                  const isExpanded = expandedVoteId === vote.id;
                  const isDeleting = deletingVoteId === vote.id;

                  return (
                    <Card key={vote.id} className="p-6 opacity-75">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-foreground">{vote.title}</h3>
                            <Badge variant="secondary">Closed</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{vote.description}</p>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Closed {vote.closes_at ? formatDate(vote.closes_at) : 'manually'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}
                          </span>
                        </div>
                      </div>

                      {/* Final Results */}
                      <div className="mb-4 rounded-lg border border-border bg-muted p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground">Final Results</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpandVote(vote.id)}
                          >
                            <BarChart3 className="h-4 w-4" />
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </Button>
                        </div>

                        {isExpanded ? (
                          <div className="space-y-3">
                            {optionsArray.map((option, index) => {
                              const count = voteResults[vote.id]?.[option] || 0;
                              const percentage = getOptionPercentage(vote.id, option);

                              return (
                                <div key={index} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-foreground">{option}</span>
                                    <span className="text-muted-foreground">
                                      {count} ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                                    <div
                                      className="h-full bg-primary transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {totalVotes === 0
                              ? 'No votes received'
                              : `${totalVotes} ${totalVotes === 1 ? 'student' : 'students'} participated`}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVoteStatus(vote)}
                        >
                          <Unlock className="h-4 w-4" />
                          Reopen Vote
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVote(vote.id)}
                          disabled={isDeleting}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? 'Deleting...' : 'Delete'}
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
