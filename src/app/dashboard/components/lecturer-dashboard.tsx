'use client';

import { useState } from 'react';
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

interface LecturerDashboardProps {
  userId: string;
  userName: string;
}

// Mock data for development (following UI-first approach)
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

const mockComplaints = [
  {
    id: '1',
    title: 'Broken AC in Lecture Hall B',
    category: 'Facilities',
    priority: 'High',
    status: 'New',
    created_at: '2024-11-25T10:30:00Z',
    student_name: 'Anonymous',
    is_anonymous: true,
  },
  {
    id: '2',
    title: 'Course material not uploaded on time',
    category: 'Academic',
    priority: 'Medium',
    status: 'In Progress',
    created_at: '2024-11-24T14:20:00Z',
    student_name: 'John Smith',
    is_anonymous: false,
  },
  {
    id: '3',
    title: 'Grading discrepancy in midterm exam',
    category: 'Academic',
    priority: 'High',
    status: 'Opened',
    created_at: '2024-11-24T09:15:00Z',
    student_name: 'Sarah Johnson',
    is_anonymous: false,
  },
  {
    id: '4',
    title: 'Library computer not working',
    category: 'Facilities',
    priority: 'Low',
    status: 'Resolved',
    created_at: '2024-11-23T16:45:00Z',
    student_name: 'Anonymous',
    is_anonymous: true,
  },
  {
    id: '5',
    title: 'Assignment deadline too short',
    category: 'Course Content',
    priority: 'Medium',
    status: 'In Progress',
    created_at: '2024-11-23T11:30:00Z',
    student_name: 'Michael Chen',
    is_anonymous: false,
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'new_complaint',
    message: 'New complaint submitted: "Broken AC in Lecture Hall B"',
    time: '5 minutes ago',
  },
  {
    id: '2',
    type: 'status_change',
    message: 'Complaint #247 status changed to Resolved',
    time: '1 hour ago',
  },
  {
    id: '3',
    type: 'assignment',
    message: 'Complaint #245 assigned to Dr. Sarah Johnson',
    time: '2 hours ago',
  },
  {
    id: '4',
    type: 'feedback',
    message: 'Feedback added to complaint #243',
    time: '3 hours ago',
  },
];

export function LecturerDashboard({ userName }: LecturerDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'default';
      case 'opened':
        return 'secondary';
      case 'in progress':
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
        <Button variant="outline" size="sm">
          Assigned to Me
          <Badge variant="secondary" className="ml-2">
            12
          </Badge>
        </Button>
        <Button variant="outline" size="sm">
          High Priority
          <Badge variant="destructive" className="ml-2">
            8
          </Badge>
        </Button>
        <Button variant="outline" size="sm">
          Escalated
          <Badge variant="destructive" className="ml-2">
            3
          </Badge>
        </Button>
        <Button variant="outline" size="sm">
          Unresolved
          <Badge variant="default" className="ml-2">
            42
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
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned to Me</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">3 new</span> today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2h</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">-15%</span> improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5%</span> from last month
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
                  {mockComplaints.slice(0, 5).map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex items-start justify-between space-x-4 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{complaint.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{complaint.student_name}</span>
                          <span>•</span>
                          <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
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
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === 'new_complaint' && (
                          <FileText className="h-4 w-4 text-primary" />
                        )}
                        {activity.type === 'status_change' && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        {activity.type === 'assignment' && (
                          <Users className="h-4 w-4 text-blue-600" />
                        )}
                        {activity.type === 'feedback' && (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
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
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <FileText className="mb-2 h-5 w-5" />
                  <span className="font-semibold">Review Complaints</span>
                  <span className="text-xs text-muted-foreground">View pending items</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <Plus className="mb-2 h-5 w-5" />
                  <span className="font-semibold">Create Template</span>
                  <span className="text-xs text-muted-foreground">Add new template</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <BarChart3 className="mb-2 h-5 w-5" />
                  <span className="font-semibold">View Analytics</span>
                  <span className="text-xs text-muted-foreground">Detailed reports</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col items-start p-4">
                  <Settings className="mb-2 h-5 w-5" />
                  <span className="font-semibold">Manage Settings</span>
                  <span className="text-xs text-muted-foreground">Configure system</span>
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
                {mockComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-start justify-between space-x-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium leading-none">{complaint.title}</p>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{complaint.student_name}</span>
                        <span>•</span>
                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>ID: {complaint.id}</span>
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
                ))}
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
