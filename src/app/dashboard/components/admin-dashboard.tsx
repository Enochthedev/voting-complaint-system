'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardProps {
  userId: string;
  userName: string;
}

export function AdminDashboard({ userId, userName }: AdminDashboardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - will be replaced with real API calls in Phase 12
  const stats = {
    totalUsers: 342,
    totalComplaints: 156,
    activeComplaints: 45,
    activeLecturers: 12,
  };

  const systemHealth = {
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '120ms',
  };

  const recentActivity = [
    {
      id: '1',
      type: 'complaint',
      title: 'New complaint submitted',
      description: 'Broken projector in Room 301',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'user',
      title: 'New user registered',
      description: 'Student account created',
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'resolution',
      title: 'Complaint resolved',
      description: 'WiFi connectivity issues',
      user: 'Dr. Johnson',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'announcement',
      title: 'New announcement posted',
      description: 'Campus maintenance schedule',
      user: 'Admin',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ];

  const topLecturers = [
    { name: 'Dr. Sarah Williams', resolved: 23, rating: 4.8 },
    { name: 'Prof. Mike Johnson', resolved: 19, rating: 4.6 },
    { name: 'Dr. Emily Brown', resolved: 17, rating: 4.9 },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

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

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      complaint: FileText,
      user: Users,
      resolution: CheckCircle2,
      announcement: Megaphone,
    };
    return icons[type] || Activity;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System overview and management tools for {userName}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeComplaints}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lecturers</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLecturers}</div>
            <p className="text-xs text-muted-foreground mt-1">Managing complaints</p>
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
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);

                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Lecturers with most resolutions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/analytics')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topLecturers.map((lecturer, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{lecturer.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lecturer.resolved} resolved • {lecturer.rating}★ rating
                    </p>
                  </div>
                  <Badge variant="secondary">{lecturer.resolved}</Badge>
                </div>
              ))}
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
