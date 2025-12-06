'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Bell,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';
import { LecturerAnalyticsTab } from './lecturer-analytics-tab';
import { useAllComplaints } from '@/hooks/use-complaints';
import { useNotifications } from '@/hooks/use-notifications';
import { Skeleton } from '@/components/ui/skeleton';

interface LecturerDashboardProps {
  userId: string;
  userName: string;
}

// Analytics data structure for the analytics tab
const mockAnalyticsData = {
  keyMetrics: {
    totalComplaints: 247,
    totalChange: '+12.5%',
    avgResponseTime: '4.2h',
    responseTimeChange: '-15%',
    resolutionRate: 87,
    resolutionRateChange: '+5%',
    activeCases: 42,
    satisfactionRating: 4.3,
    satisfactionChange: '+0.3',
  },
  complaintsByStatus: [
    { status: 'New', count: 18, percentage: 17, color: 'bg-blue-500' },
    { status: 'Opened', count: 12, percentage: 11, color: 'bg-purple-500' },
    { status: 'In Progress', count: 35, percentage: 33, color: 'bg-yellow-500' },
    { status: 'Resolved', count: 28, percentage: 26, color: 'bg-green-500' },
    { status: 'Closed', count: 14, percentage: 13, color: 'bg-gray-500' },
  ],
  complaintsByCategory: [
    { category: 'Academic', count: 45, percentage: 35 },
    { category: 'Facilities', count: 38, percentage: 30 },
    { category: 'Course Content', count: 25, percentage: 20 },
    { category: 'Administrative', count: 12, percentage: 9 },
    { category: 'Harassment', count: 5, percentage: 4 },
    { category: 'Other', count: 3, percentage: 2 },
  ],
  complaintsByPriority: [
    { priority: 'Low', count: 45, percentage: 35, color: 'bg-gray-500' },
    { priority: 'Medium', count: 62, percentage: 48, color: 'bg-blue-500' },
    { priority: 'High', count: 18, percentage: 14, color: 'bg-orange-500' },
    { priority: 'Critical', count: 4, percentage: 3, color: 'bg-red-500' },
  ],
  complaintsOverTime: [
    { date: '2024-11-19', count: 12, label: 'Mon' },
    { date: '2024-11-20', count: 18, label: 'Tue' },
    { date: '2024-11-21', count: 15, label: 'Wed' },
    { date: '2024-11-22', count: 22, label: 'Thu' },
    { date: '2024-11-23', count: 19, label: 'Fri' },
    { date: '2024-11-24', count: 8, label: 'Sat' },
    { date: '2024-11-25', count: 6, label: 'Sun' },
  ],
  lecturerPerformance: [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      complaintsHandled: 45,
      avgResponseTime: '3.2h',
      resolutionRate: 92,
      satisfactionRating: 4.5,
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      complaintsHandled: 38,
      avgResponseTime: '4.1h',
      resolutionRate: 88,
      satisfactionRating: 4.3,
    },
    {
      id: '3',
      name: 'Dr. Emily Williams',
      complaintsHandled: 52,
      avgResponseTime: '2.8h',
      resolutionRate: 95,
      satisfactionRating: 4.7,
    },
    {
      id: '4',
      name: 'Prof. David Brown',
      complaintsHandled: 31,
      avgResponseTime: '5.2h',
      resolutionRate: 82,
      satisfactionRating: 4.1,
    },
  ],
  topComplaintTypes: [
    { type: 'Broken Equipment in Lab', count: 28 },
    { type: 'Course Material Access Issues', count: 24 },
    { type: 'Grading Concerns', count: 19 },
    { type: 'Classroom Temperature', count: 15 },
    { type: 'Assignment Deadline Conflicts', count: 12 },
  ],
};

export function LecturerDashboard({ userId, userName }: LecturerDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data
  const { data: allComplaints = [], isLoading: complaintsLoading } = useAllComplaints();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications(5);

  // Calculate real statistics from complaints
  const stats = {
    totalComplaints: allComplaints.length,
    assignedToMe: allComplaints.filter((c) => c.assigned_to === userId).length,
    newComplaints: allComplaints.filter((c) => c.status === 'new').length,
    inProgress: allComplaints.filter((c) => c.status === 'in_progress').length,
    resolved: allComplaints.filter((c) => c.status === 'resolved').length,
    closed: allComplaints.filter((c) => c.status === 'closed').length,
  };

  // Get recent complaints (last 5)
  const recentComplaints = allComplaints.slice(0, 5);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'default';
      case 'opened':
        return 'secondary';
      case 'in progress':
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (complaintsLoading) {
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
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search complaints by title, category, or student..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/complaints?filter=assigned')}
        >
          Assigned to Me
          <Badge variant="secondary" className="ml-2">
            {stats.assignedToMe}
          </Badge>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/complaints?priority=high')}
        >
          High Priority
          <Badge variant="destructive" className="ml-2">
            {allComplaints.filter((c) => c.priority === 'high' || c.priority === 'urgent').length}
          </Badge>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/complaints?status=escalated')}
        >
          Escalated
          <Badge variant="destructive" className="ml-2">
            {allComplaints.filter((c) => c.status === 'escalated').length}
          </Badge>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/complaints?status=new,open,in_progress')}
        >
          Unresolved
          <Badge variant="default" className="ml-2">
            {stats.newComplaints + stats.inProgress}
          </Badge>
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="complaints">
            <FileText className="mr-2 h-4 w-4" />
            Complaints
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="management">
            <Settings className="mr-2 h-4 w-4" />
            Management
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComplaints}</div>
                <p className="text-xs text-muted-foreground">All complaints in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned to Me</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assignedToMe}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.newComplaints} new complaints
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Currently being handled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved + stats.closed}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalComplaints > 0
                    ? Math.round(((stats.resolved + stats.closed) / stats.totalComplaints) * 100)
                    : 0}
                  % resolution rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Complaints and Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Complaints */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Complaints</CardTitle>
                <CardDescription>Latest submissions requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentComplaints.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No complaints yet</p>
                    </div>
                  ) : (
                    recentComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="flex items-start justify-between space-x-4 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/complaints/${complaint.id}`)}
                      >
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{complaint.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {complaint.is_anonymous
                                ? 'Anonymous'
                                : complaint.student?.full_name || 'Unknown'}
                            </span>
                            <span>•</span>
                            <span>{formatDate(complaint.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={getStatusBadgeVariant(complaint.status)}
                              className="text-xs"
                            >
                              {complaint.status}
                            </Badge>
                            <Badge
                              variant={getPriorityBadgeVariant(complaint.priority)}
                              className="text-xs"
                            >
                              {complaint.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {complaint.category}
                            </Badge>
                          </div>
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
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest updates and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 rounded-lg p-2 transition-colors"
                        onClick={() => {
                          if (notification.related_id) {
                            router.push(`/complaints/${notification.related_id}`);
                          }
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
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
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => router.push('/complaints')}
                >
                  <FileText className="mb-2 h-5 w-5" />
                  <span className="font-semibold">Review Complaints</span>
                  <span className="text-xs text-muted-foreground">View all complaints</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => router.push('/admin/templates')}
                >
                  <Plus className="mb-2 h-5 w-5" />
                  <span className="font-semibold">Manage Templates</span>
                  <span className="text-xs text-muted-foreground">Create templates</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => router.push('/admin/votes')}
                >
                  <BarChart3 className="mb-2 h-5 w-5" />
                  <span className="font-semibold">Manage Votes</span>
                  <span className="text-xs text-muted-foreground">Create polls</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start p-4"
                  onClick={() => router.push('/admin/announcements')}
                >
                  <Settings className="mb-2 h-5 w-5" />
                  <span className="font-semibold">Announcements</span>
                  <span className="text-xs text-muted-foreground">Post updates</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Complaints</CardTitle>
              <CardDescription>Manage and review all submitted complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allComplaints.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No complaints yet</p>
                  </div>
                ) : (
                  allComplaints.slice(0, 10).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex items-start justify-between space-x-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/complaints/${complaint.id}`)}
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium leading-none">{complaint.title}</p>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {complaint.is_anonymous
                              ? 'Anonymous'
                              : complaint.student?.full_name || 'Unknown'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(complaint.created_at)}</span>
                          <span>•</span>
                          <span>ID: {complaint.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getStatusBadgeVariant(complaint.status)}
                            className="text-xs"
                          >
                            {complaint.status}
                          </Badge>
                          <Badge
                            variant={getPriorityBadgeVariant(complaint.priority)}
                            className="text-xs"
                          >
                            {complaint.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {complaint.category}
                          </Badge>
                          {complaint.is_anonymous && (
                            <Badge variant="secondary" className="text-xs">
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <LecturerAnalyticsTab analyticsData={mockAnalyticsData} />
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Template Management</CardTitle>
                <CardDescription>Create and manage complaint templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalation Rules</CardTitle>
                <CardDescription>Configure auto-escalation settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Rules
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Create system-wide announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voting Polls</CardTitle>
                <CardDescription>Create and manage student polls</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Poll
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
