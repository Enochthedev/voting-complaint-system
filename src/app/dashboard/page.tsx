'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockUser, mockSignOut } from '@/lib/mock-auth';
import type { MockUser } from '@/lib/mock-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Timer,
} from 'lucide-react';

// Mock data
const mockStats = {
  total: 12,
  pending: 5,
  inProgress: 4,
  resolved: 3,
};

const mockDrafts = [
  {
    id: 'draft-1',
    title: 'WiFi connectivity issues in library',
    category: 'facilities',
    priority: 'medium',
    updatedAt: '2024-11-19T14:30:00Z',
  },
  {
    id: 'draft-2',
    title: 'Unclear grading criteria for assignment',
    category: 'academic',
    priority: 'low',
    updatedAt: '2024-11-18T10:15:00Z',
  },
];

const mockRecentComplaints = [
  {
    id: '1',
    title: 'Broken AC in Lecture Hall B',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2024-11-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Missing course materials',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-11-19T15:30:00Z',
  },
  {
    id: '3',
    title: 'Parking lot lighting issue',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-11-18T09:00:00Z',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getMockUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

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

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      userRole={user.role as any}
      userName={user.full_name}
      userEmail={user.email}
      notificationCount={3}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.full_name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your complaints today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Timer className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Being addressed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.resolved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully closed
              </p>
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
              <div className="space-y-4">
                {mockRecentComplaints.map((complaint) => {
                  const statusInfo = getStatusBadge(complaint.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={complaint.id} className="flex items-start gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {complaint.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.variant as any} className="text-xs">
                            {statusInfo.label}
                          </Badge>
                          <Badge variant={getPriorityBadge(complaint.priority)} className="text-xs">
                            {complaint.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(complaint.createdAt)}
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
              <Separator className="my-4" />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/complaints')}
              >
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
              {mockDrafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No draft complaints
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Save complaints as drafts to continue later
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {draft.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {draft.category}
                          </Badge>
                          <Badge variant={getPriorityBadge(draft.priority)} className="text-xs">
                            {draft.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(draft.updatedAt)}
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
              <Button
                className="w-full"
                onClick={() => router.push('/complaints/new')}
              >
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
                  <div className="text-xs text-muted-foreground">
                    Report a new issue
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-4"
                onClick={() => router.push('/complaints')}
              >
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">My Complaints</div>
                  <div className="text-xs text-muted-foreground">
                    View all submissions
                  </div>
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
                  <div className="text-xs text-muted-foreground">
                    Continue saved drafts
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
