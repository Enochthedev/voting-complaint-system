'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
  CheckCircle2,
  Timer,
  Megaphone,
  Vote as VoteIcon,
  Bell,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { useUserComplaints, useUserDrafts, useUserComplaintStats } from '@/hooks/use-complaints';
import { useRecentAnnouncements } from '@/hooks/use-announcements';
import { useNotifications } from '@/hooks/use-notifications';
import { useVotes, useHasStudentVoted } from '@/hooks/use-votes';
import type { Announcement, Notification, Vote } from '@/types/database.types';

type Complaint = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
};

type Stats = {
  total: number;
  new: number;
  opened: number;
  in_progress: number;
  resolved: number;
  closed: number;
};

interface StudentDashboardProps {
  userId: string;
  userName: string;
}

export function StudentDashboard({ userId, userName }: StudentDashboardProps) {
  const router = useRouter();
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  // Use React Query hooks for data fetching
  const { data: stats, isLoading: statsLoading, error: statsError } = useUserComplaintStats(userId);
  const { data: complaints = [], isLoading: complaintsLoading } = useUserComplaints(userId);
  const { data: drafts = [], isLoading: draftsLoading } = useUserDrafts(userId);
  const { data: announcements = [], isLoading: announcementsLoading } = useRecentAnnouncements(3);
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications(5);
  const { data: activeVotes = [], isLoading: votesLoading } = useVotes({ isActive: true });

  // Derive loading and error states
  const isLoading =
    statsLoading ||
    complaintsLoading ||
    draftsLoading ||
    announcementsLoading ||
    notificationsLoading ||
    votesLoading;

  // Log errors for debugging
  if (statsError) {
    console.error('Stats error:', statsError);
  }

  // Don't show error if we have complaints data - we can calculate stats from that
  const error =
    statsError && complaints.length === 0
      ? 'Failed to load dashboard data. Please try again.'
      : null;

  // Calculate stats from complaints if stats query failed but we have complaints
  const calculatedStats: Stats = stats || {
    total: complaints.length,
    new: complaints.filter((c) => c.status === 'new').length,
    opened: complaints.filter((c) => c.status === 'opened').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    closed: complaints.filter((c) => c.status === 'closed').length,
  };

  // Get recent complaints (first 3)
  const recentComplaints = complaints.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: 'warning', label: 'Pending', icon: Timer },
      in_progress: { variant: 'info', label: 'In Progress', icon: TrendingUp },
      resolved: { variant: 'success', label: 'Resolved', icon: CheckCircle2 },
    };
    return variants[status] || variants.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'warning',
      high: 'destructive',
      critical: 'destructive',
    };
    return variants[priority] || 'secondary';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-rainbow p-6 rounded-xl text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {userName.split(' ')[0]}!
        </h1>
        <p className="text-sm sm:text-base text-white/90 mt-1">
          Here's what's happening with your complaints today.
        </p>
      </div>

      {/* Statistics Widget */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <div className="p-2 rounded-lg bg-purple-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            Your Complaint Statistics
          </CardTitle>
          <CardDescription className="text-purple-600">
            Overview of your complaint activity and resolution metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Complaints */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{calculatedStats.total}</div>
                <p className="text-xs text-muted-foreground">All time submissions</p>
              </div>
            </div>

            {/* Pending */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Timer className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Pending</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{calculatedStats.new + calculatedStats.opened}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
                {calculatedStats.total > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${((calculatedStats.new + calculatedStats.opened) / calculatedStats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {Math.round(((calculatedStats.new + calculatedStats.opened) / calculatedStats.total) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">In Progress</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{calculatedStats.in_progress}</div>
                <p className="text-xs text-muted-foreground">Being addressed</p>
                {calculatedStats.total > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${(calculatedStats.in_progress / calculatedStats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {Math.round((calculatedStats.in_progress / calculatedStats.total) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Resolved */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Resolved</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{calculatedStats.resolved + calculatedStats.closed}</div>
                <p className="text-xs text-muted-foreground">Successfully closed</p>
                {calculatedStats.total > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{
                          width: `${((calculatedStats.resolved + calculatedStats.closed) / calculatedStats.total) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {Math.round(((calculatedStats.resolved + calculatedStats.closed) / calculatedStats.total) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Statistics Row */}
          {calculatedStats.total > 0 && (
            <>
              <Separator className="my-4" />
              <div className="grid gap-4 md:grid-cols-3">
                {/* Resolution Rate */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Resolution Rate
                    </span>
                  </div>
                  <div className="text-xl font-bold">
                    {Math.round(((calculatedStats.resolved + calculatedStats.closed) / calculatedStats.total) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {calculatedStats.resolved + calculatedStats.closed} of {calculatedStats.total} resolved
                  </p>
                </div>

                {/* Active Complaints */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Active</span>
                  </div>
                  <div className="text-xl font-bold">
                    {calculatedStats.new + calculatedStats.opened + calculatedStats.in_progress}
                  </div>
                  <p className="text-xs text-muted-foreground">Complaints in progress</p>
                </div>

                {/* Drafts */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Drafts</span>
                  </div>
                  <div className="text-xl font-bold">{drafts.length}</div>
                  <p className="text-xs text-muted-foreground">Saved for later</p>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {calculatedStats.total === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground mb-1">No complaints yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Submit your first complaint to see your statistics
              </p>
              <Button size="sm" onClick={() => router.push('/complaints/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Complaint
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Announcements
                </CardTitle>
                <CardDescription>Latest updates and news</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/announcements')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Megaphone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-semibold leading-none">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(announcement.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifications Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Recent activity and updates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent cursor-pointer ${
                      !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                    onClick={() => {
                      if (notification.related_id) {
                        if (notification.type.includes('complaint')) {
                          router.push(`/complaints/${notification.related_id}`);
                        } else if (notification.type.includes('vote')) {
                          router.push(`/votes/${notification.related_id}`);
                        }
                      }
                    }}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        !notification.is_read ? 'bg-primary/10' : 'bg-secondary'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Votes Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <VoteIcon className="h-5 w-5" />
                  Active Votes
                </CardTitle>
                <CardDescription>Participate in ongoing polls</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/votes')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeVotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <VoteIcon className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">No active votes</p>
                <p className="text-xs text-muted-foreground mt-1">Check back later for new polls</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeVotes.slice(0, 3).map((vote) => {
                  const hasVoted = votedPolls.has(vote.id);
                  const daysLeft = vote.closes_at
                    ? Math.ceil(
                        (new Date(vote.closes_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                    : null;

                  return (
                    <div
                      key={vote.id}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                        <VoteIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{vote.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {vote.description}
                        </p>
                        <div className="flex items-center gap-2">
                          {hasVoted ? (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Voted
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">
                              Pending
                            </Badge>
                          )}
                          {daysLeft !== null && daysLeft > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/votes/${vote.id}`)}
                      >
                        {hasVoted ? 'View' : 'Vote'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Your latest submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">No complaints yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit your first complaint to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => {
                  const statusInfo = getStatusBadge(complaint.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={complaint.id} className="flex items-start gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{complaint.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.variant as any} className="text-xs">
                            {statusInfo.label}
                          </Badge>
                          <Badge variant={getPriorityBadge(complaint.priority)} className="text-xs">
                            {complaint.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(complaint.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/complaints/${complaint.id}`)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <Separator className="my-4" />
            <Button variant="outline" className="w-full" onClick={() => router.push('/complaints')}>
              View All Complaints
            </Button>
          </CardContent>
        </Card>

        {/* Draft Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Draft Complaints</CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">No draft complaints</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save complaints as drafts to continue later
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{draft.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {draft.category}
                        </Badge>
                        <Badge variant={getPriorityBadge(draft.priority)} className="text-xs">
                          {draft.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(draft.updated_at)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/complaints/new?draft=${draft.id}`)}
                    >
                      Continue
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Separator className="my-4" />
            <Button className="w-full" onClick={() => router.push('/complaints/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/complaints/new')}
            >
              <Plus className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Submit Complaint</div>
                <div className="text-xs text-muted-foreground">Report a new issue</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/complaints/new?useTemplate=true')}
            >
              <FileCheck className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Use Template</div>
                <div className="text-xs text-muted-foreground">Start from a template</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/votes')}
            >
              <VoteIcon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Active Votes</div>
                <div className="text-xs text-muted-foreground">Participate in polls</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/complaints/drafts')}
            >
              <Clock className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Drafts</div>
                <div className="text-xs text-muted-foreground">Continue saved drafts</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/announcements')}
            >
              <Megaphone className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Announcements</div>
                <div className="text-xs text-muted-foreground">View all updates</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Notifications</div>
                <div className="text-xs text-muted-foreground">View all notifications</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
