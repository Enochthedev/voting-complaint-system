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

// Analytics data will be calculated from real complaints data
const calculateAnalyticsFromComplaints = (complaints: any[]) => {
  const total = complaints.length;

  // Calculate status distribution
  const statusCounts: Record<string, number> = {
    new: 0,
    opened: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };
  complaints.forEach((c) => {
    if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
  });

  // Calculate category distribution
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Calculate priority distribution
  const priorityCounts: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  complaints.forEach((c) => {
    if (priorityCounts[c.priority] !== undefined) priorityCounts[c.priority]++;
  });

  const resolvedCount = statusCounts.resolved + statusCounts.closed;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const activeCases = statusCounts.new + statusCounts.opened + statusCounts.in_progress;

  return {
    keyMetrics: {
      totalComplaints: total,
      totalChange: '+0%',
      avgResponseTime: 'N/A',
      responseTimeChange: '0%',
      resolutionRate,
      resolutionRateChange: '+0%',
      activeCases,
      satisfactionRating: 0,
      satisfactionChange: '+0',
    },
    complaintsByStatus: [
      {
        status: 'New',
        count: statusCounts.new,
        percentage: total > 0 ? Math.round((statusCounts.new / total) * 100) : 0,
        color: 'bg-blue-500',
      },
      {
        status: 'Opened',
        count: statusCounts.opened,
        percentage: total > 0 ? Math.round((statusCounts.opened / total) * 100) : 0,
        color: 'bg-purple-500',
      },
      {
        status: 'In Progress',
        count: statusCounts.in_progress,
        percentage: total > 0 ? Math.round((statusCounts.in_progress / total) * 100) : 0,
        color: 'bg-yellow-500',
      },
      {
        status: 'Resolved',
        count: statusCounts.resolved,
        percentage: total > 0 ? Math.round((statusCounts.resolved / total) * 100) : 0,
        color: 'bg-green-500',
      },
      {
        status: 'Closed',
        count: statusCounts.closed,
        percentage: total > 0 ? Math.round((statusCounts.closed / total) * 100) : 0,
        color: 'bg-gray-500',
      },
    ],
    complaintsByCategory: Object.entries(categoryCounts).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    })),
    complaintsByPriority: [
      {
        priority: 'Low',
        count: priorityCounts.low,
        percentage: total > 0 ? Math.round((priorityCounts.low / total) * 100) : 0,
        color: 'bg-gray-500',
      },
      {
        priority: 'Medium',
        count: priorityCounts.medium,
        percentage: total > 0 ? Math.round((priorityCounts.medium / total) * 100) : 0,
        color: 'bg-blue-500',
      },
      {
        priority: 'High',
        count: priorityCounts.high,
        percentage: total > 0 ? Math.round((priorityCounts.high / total) * 100) : 0,
        color: 'bg-orange-500',
      },
      {
        priority: 'Critical',
        count: priorityCounts.critical,
        percentage: total > 0 ? Math.round((priorityCounts.critical / total) * 100) : 0,
        color: 'bg-red-500',
      },
    ],
    complaintsOverTime: [],
    lecturerPerformance: [],
    topComplaintTypes: Object.entries(categoryCounts)
      .map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
};

// Placeholder for backwards compatibility
const mockAnalyticsData = {
  keyMetrics: {
    totalComplaints: 0,
    totalChange: '+0%',
    avgResponseTime: 'N/A',
    responseTimeChange: '0%',
    resolutionRate: 0,
    resolutionRateChange: '+0%',
    activeCases: 0,
    satisfactionRating: 0,
    satisfactionChange: '+0',
  },
  complaintsByStatus: [
    { status: 'New', count: 0, percentage: 0, color: 'bg-blue-500' },
    { status: 'Opened', count: 0, percentage: 0, color: 'bg-purple-500' },
    { status: 'In Progress', count: 0, percentage: 0, color: 'bg-yellow-500' },
    { status: 'Resolved', count: 0, percentage: 0, color: 'bg-green-500' },
    { status: 'Closed', count: 0, percentage: 0, color: 'bg-gray-500' },
  ],
  complaintsByCategory: [],
  complaintsByPriority: [
    { priority: 'Low', count: 0, percentage: 0, color: 'bg-gray-500' },
    { priority: 'Medium', count: 0, percentage: 0, color: 'bg-blue-500' },
    { priority: 'High', count: 0, percentage: 0, color: 'bg-orange-500' },
    { priority: 'Critical', count: 0, percentage: 0, color: 'bg-red-500' },
  ],
  complaintsOverTime: [],
  lecturerPerformance: [],
  topComplaintTypes: [],
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
        <div className="bg-gradient-rainbow p-6 rounded-xl text-white shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
          <p className="text-white/90">Welcome back, {userName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-pink-300 text-pink-700 hover:bg-pink-50"
          >
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
          className="border-teal-300 text-teal-700 hover:bg-teal-50"
          onClick={() => router.push('/complaints')}
        >
          Assigned to Me
          <Badge className="ml-2 bg-teal-500 text-white">{stats.assignedToMe}</Badge>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
          onClick={() => router.push('/complaints?priority=high')}
        >
          High Priority
          <Badge className="ml-2 bg-orange-500 text-white">
            {allComplaints.filter((c) => c.priority === 'high' || c.priority === 'urgent').length}
          </Badge>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => router.push('/complaints?status=escalated')}
        >
          Escalated
          <Badge className="ml-2 bg-red-500 text-white">
            {allComplaints.filter((c) => c.status === 'escalated').length}
          </Badge>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
          onClick={() => router.push('/complaints?status=new,open,in_progress')}
        >
          Unresolved
          <Badge className="ml-2 bg-purple-500 text-white">
            {stats.newComplaints + stats.inProgress}
          </Badge>
        </Button>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="complaints"
            className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Complaints
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            Management
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover-colorful">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">
                  Total Complaints
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <FileText className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{stats.totalComplaints}</div>
                <p className="text-xs text-purple-600">All complaints in system</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover-colorful">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-800">Assigned to Me</CardTitle>
                <div className="p-2 rounded-lg bg-teal-500 text-white">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-900">{stats.assignedToMe}</div>
                <p className="text-xs text-teal-600">{stats.newComplaints} new complaints</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover-colorful">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">In Progress</CardTitle>
                <div className="p-2 rounded-lg bg-orange-500 text-white">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{stats.inProgress}</div>
                <p className="text-xs text-orange-600">Currently being handled</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover-colorful">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
                <div className="p-2 rounded-lg bg-green-500 text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {stats.resolved + stats.closed}
                </div>
                <p className="text-xs text-green-600">
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
                              className={`text-xs status-${complaint.status.toLowerCase().replace('_', '-')}`}
                            >
                              {complaint.status}
                            </Badge>
                            <Badge
                              className={`text-xs priority-${complaint.priority.toLowerCase()}`}
                            >
                              {complaint.priority}
                            </Badge>
                            <Badge
                              className={`text-xs category-${complaint.category.toLowerCase()}`}
                            >
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
                            className={`text-xs status-${complaint.status.toLowerCase().replace('_', '-')}`}
                          >
                            {complaint.status}
                          </Badge>
                          <Badge className={`text-xs priority-${complaint.priority.toLowerCase()}`}>
                            {complaint.priority}
                          </Badge>
                          <Badge className={`text-xs category-${complaint.category.toLowerCase()}`}>
                            {complaint.category}
                          </Badge>
                          {complaint.is_anonymous && (
                            <Badge className="text-xs bg-indigo-500 text-white">Anonymous</Badge>
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
          <LecturerAnalyticsTab analyticsData={calculateAnalyticsFromComplaints(allComplaints)} />
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
