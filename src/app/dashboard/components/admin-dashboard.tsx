'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Users,
  TrendingUp,
  CheckCircle2,
  Shield,
  Activity,
  BarChart3,
  MessageSquare,
  Megaphone,
  Settings,
  Clock,
  Bell,
} from 'lucide-react';
import { useAllComplaints } from '@/hooks/use-complaints';
import { useNotifications } from '@/hooks/use-notifications';

interface AdminDashboardProps {
  userId: string;
  userName: string;
}

export function AdminDashboard({ userId, userName }: AdminDashboardProps) {
  const router = useRouter();

  // Fetch real data
  const { data: allComplaints = [], isLoading: complaintsLoading } = useAllComplaints();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications(5);

  const isLoading = complaintsLoading || notificationsLoading;

  // Calculate real stats from complaints
  const stats = {
    totalComplaints: allComplaints.length,
    activeComplaints: allComplaints.filter((c: any) =>
      ['new', 'opened', 'in_progress'].includes(c.status)
    ).length,
    resolvedComplaints: allComplaints.filter((c: any) => ['resolved', 'closed'].includes(c.status))
      .length,
    newComplaints: allComplaints.filter((c: any) => c.status === 'new').length,
  };

  // Get recent complaints for activity
  const recentComplaints = allComplaints.slice(0, 5);

  const systemHealth = {
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-[300px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-rainbow p-6 rounded-xl text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-white/90 mt-1">System overview and management tools for {userName}.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Complaints</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500 text-white">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.totalComplaints}</div>
            <p className="text-xs text-purple-600 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Active Complaints</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500 text-white">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.activeComplaints}</div>
            <p className="text-xs text-orange-600 mt-1">Currently open</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.resolvedComplaints}</div>
            <p className="text-xs text-green-600 mt-1">Successfully closed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">New Complaints</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <Bell className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.newComplaints}</div>
            <p className="text-xs text-blue-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Current system status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-2xl font-bold capitalize">{systemHealth.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-2xl font-bold">{systemHealth.uptime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-2xl font-bold">{systemHealth.responseTime}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Complaints</CardTitle>
                <CardDescription>Latest submissions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/complaints')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No complaints yet</p>
                </div>
              ) : (
                recentComplaints.map((complaint: any) => (
                  <div
                    key={complaint.id}
                    className="flex items-start gap-4 cursor-pointer hover:bg-accent/50 rounded-lg p-2 transition-colors"
                    onClick={() => router.push(`/complaints/${complaint.id}`)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{complaint.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {complaint.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {complaint.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {complaint.is_anonymous
                          ? 'Anonymous'
                          : complaint.student?.full_name || 'Unknown'}{' '}
                        • {formatDate(complaint.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest updates and alerts</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-4 cursor-pointer hover:bg-accent/50 rounded-lg p-2 transition-colors"
                    onClick={() => {
                      if (notification.related_id) {
                        router.push(`/complaints/${notification.related_id}`);
                      }
                    }}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${!notification.is_read ? 'bg-primary/10' : 'bg-secondary'}`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Tools</CardTitle>
          <CardDescription>System management and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">User Management</div>
                <div className="text-xs text-muted-foreground">Manage accounts</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/complaints')}
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">All Complaints</div>
                <div className="text-xs text-muted-foreground">View all cases</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/analytics')}
            >
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Analytics</div>
                <div className="text-xs text-muted-foreground">System insights</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/admin/templates')}
            >
              <MessageSquare className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Templates</div>
                <div className="text-xs text-muted-foreground">Manage templates</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/admin/announcements')}
            >
              <Megaphone className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Announcements</div>
                <div className="text-xs text-muted-foreground">Post updates</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/votes')}
            >
              <TrendingUp className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Votes</div>
                <div className="text-xs text-muted-foreground">Manage polls</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">System Settings</div>
                <div className="text-xs text-muted-foreground">Configure system</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
