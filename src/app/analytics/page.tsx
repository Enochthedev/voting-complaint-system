'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartSkeleton, DashboardCardSkeleton, TableSkeleton } from '@/components/ui/skeletons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Star,
  Users,
  Timer,
  Target,
  Activity,
  X,
  FileDown,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import {
  exportAnalyticsAsCSV,
  exportAnalyticsAsJSON,
  exportAnalyticsAsPDF,
} from '@/lib/utils/export-analytics';
import { ChartLoadingFallback } from '@/lib/utils/lazy-load';
import { getAnalyticsData, type AnalyticsData } from '@/lib/api/analytics';

// Default empty analytics data
const emptyAnalyticsData: AnalyticsData = {
  timePeriod: 'Last 30 days',
  keyMetrics: {
    totalComplaints: 245,
    totalChange: '+12%',
    avgResponseTime: '2.4h',
    responseTimeChange: '-15%',
    resolutionRate: 87,
    resolutionRateChange: '+5%',
    activeCases: 45,
    satisfactionRating: 4.2,
    satisfactionChange: '+0.3',
  },
  complaintsByStatus: [
    { status: 'New', count: 12, percentage: 5, color: 'bg-blue-500' },
    { status: 'Opened', count: 18, percentage: 7, color: 'bg-yellow-500' },
    { status: 'In Progress', count: 45, percentage: 18, color: 'bg-purple-500' },
    { status: 'Resolved', count: 145, percentage: 59, color: 'bg-green-500' },
    { status: 'Closed', count: 25, percentage: 10, color: 'bg-gray-500' },
  ],
  complaintsByCategory: [
    { category: 'Academic', count: 85, percentage: 35 },
    { category: 'Facilities', count: 62, percentage: 25 },
    { category: 'Course Content', count: 45, percentage: 18 },
    { category: 'Administrative', count: 32, percentage: 13 },
    { category: 'Harassment', count: 15, percentage: 6 },
    { category: 'Other', count: 6, percentage: 2 },
  ],
  complaintsByPriority: [
    { priority: 'Critical', count: 8, percentage: 3, color: 'bg-red-600' },
    { priority: 'High', count: 45, percentage: 18, color: 'bg-orange-500' },
    { priority: 'Medium', count: 132, percentage: 54, color: 'bg-yellow-500' },
    { priority: 'Low', count: 60, percentage: 24, color: 'bg-green-500' },
  ],
  complaintsOverTime: [
    { date: 'Nov 1', count: 8, label: 'Nov 1' },
    { date: 'Nov 3', count: 12, label: 'Nov 3' },
    { date: 'Nov 5', count: 10, label: 'Nov 5' },
    { date: 'Nov 7', count: 15, label: 'Nov 7' },
    { date: 'Nov 9', count: 13, label: 'Nov 9' },
    { date: 'Nov 11', count: 18, label: 'Nov 11' },
    { date: 'Nov 13', count: 16, label: 'Nov 13' },
    { date: 'Nov 15', count: 20, label: 'Nov 15' },
    { date: 'Nov 17', count: 17, label: 'Nov 17' },
    { date: 'Nov 19', count: 22, label: 'Nov 19' },
    { date: 'Nov 21', count: 19, label: 'Nov 21' },
    { date: 'Nov 23', count: 24, label: 'Nov 23' },
    { date: 'Nov 25', count: 21, label: 'Nov 25' },
  ],
  lecturerPerformance: [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      complaintsHandled: 42,
      avgResponseTime: '1.8h',
      resolutionRate: 92,
      satisfactionRating: 4.5,
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      complaintsHandled: 38,
      avgResponseTime: '2.1h',
      resolutionRate: 89,
      satisfactionRating: 4.3,
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      complaintsHandled: 35,
      avgResponseTime: '2.5h',
      resolutionRate: 85,
      satisfactionRating: 4.1,
    },
    {
      id: '4',
      name: 'Prof. David Kim',
      complaintsHandled: 31,
      avgResponseTime: '3.2h',
      resolutionRate: 81,
      satisfactionRating: 3.9,
    },
  ],
  topComplaintTypes: [
    { type: 'Broken Equipment', count: 28 },
    { type: 'Course Material Issues', count: 24 },
    { type: 'Grading Concerns', count: 22 },
    { type: 'Facility Maintenance', count: 19 },
    { type: 'Schedule Conflicts', count: 15 },
  ],
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(emptyAnalyticsData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDaysFromPeriod = (period: string): number => {
    switch (period) {
      case '7days':
        return 7;
      case '30days':
        return 30;
      case '90days':
        return 90;
      default:
        return 30;
    }
  };

  const loadAnalytics = async (days: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAnalyticsData(days);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
      return;
    }

    // Only allow lecturers and admins to access analytics
    if (user && user.role === 'student') {
      router.push('/dashboard');
      return;
    }

    // Load analytics data when user is authenticated
    if (user && (user.role === 'lecturer' || user.role === 'admin')) {
      loadAnalytics(getDaysFromPeriod(selectedPeriod));
    }
  }, [user, authLoading, authError, router, selectedPeriod]);

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    const exportData = {
      timePeriod: getDisplayPeriod(),
      keyMetrics: analyticsData.keyMetrics,
      complaintsByStatus: analyticsData.complaintsByStatus,
      complaintsByCategory: analyticsData.complaintsByCategory,
      complaintsByPriority: analyticsData.complaintsByPriority,
      complaintsOverTime: analyticsData.complaintsOverTime,
      lecturerPerformance: analyticsData.lecturerPerformance,
      topComplaintTypes: analyticsData.topComplaintTypes,
    };

    switch (format) {
      case 'csv':
        exportAnalyticsAsCSV(exportData);
        break;
      case 'json':
        exportAnalyticsAsJSON(exportData);
        break;
      case 'pdf':
        exportAnalyticsAsPDF(exportData);
        break;
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      loadAnalytics(getDaysFromPeriod(period));
    }
  };

  const handleApplyCustomDates = () => {
    if (customStartDate && customEndDate) {
      setShowCustomDatePicker(false);
      // Calculate days between dates
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      loadAnalytics(days > 0 ? days : 30);
    }
  };

  const handleCancelCustomDates = () => {
    setShowCustomDatePicker(false);
    setSelectedPeriod('30days');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const getDisplayPeriod = () => {
    switch (selectedPeriod) {
      case '7days':
        return 'Last 7 days';
      case '30days':
        return 'Last 30 days';
      case '90days':
        return 'Last 90 days';
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
        }
        return 'Custom Range';
      default:
        return 'Last 30 days';
    }
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (authError) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'lecturer'}
        userName={user?.full_name || 'Error'}
        userEmail={user?.email || ''}
      >
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-lg font-medium">Error loading user</p>
              <p className="text-sm text-muted-foreground mt-1">{authError}</p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const {
    keyMetrics,
    complaintsByStatus,
    complaintsByCategory,
    complaintsByPriority,
    complaintsOverTime,
    lecturerPerformance,
    topComplaintTypes,
  } = analyticsData;

  // Show loading state
  if (isLoading && !analyticsData.keyMetrics.totalComplaints) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'lecturer'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <Skeleton className="h-12 w-[300px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'lecturer'}
        userName={user?.full_name || 'Error'}
        userEmail={user?.email || ''}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        {/* Header with Time Period Selector and Export */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive complaint statistics and insights • {getDisplayPeriod()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-card p-1">
              <Button
                variant={selectedPeriod === '7days' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange('7days')}
              >
                7 Days
              </Button>
              <Button
                variant={selectedPeriod === '30days' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange('30days')}
              >
                30 Days
              </Button>
              <Button
                variant={selectedPeriod === '90days' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange('90days')}
              >
                90 Days
              </Button>
              <Button
                variant={selectedPeriod === 'custom' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange('custom')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Custom
              </Button>
            </div>
            <DropdownMenu align="end">
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {showCustomDatePicker && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Select Custom Date Range</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCancelCustomDates}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Choose a start and end date to view analytics for a specific period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate || undefined}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelCustomDates}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyCustomDates}
                  disabled={!customStartDate || !customEndDate}
                >
                  Apply Date Range
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.totalComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{keyMetrics.totalChange}</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{keyMetrics.responseTimeChange}</span> improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.resolutionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{keyMetrics.resolutionRateChange}</span> from last
                period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.satisfactionRating}/5.0</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{keyMetrics.satisfactionChange}</span> from last
                period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Complaints Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Complaints Over Time
              </CardTitle>
              <CardDescription>Daily complaint submission trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chart Area */}
                <div className="relative h-64 w-full">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-muted-foreground">
                    {[30, 25, 20, 15, 10, 5, 0].map((value) => (
                      <div key={value} className="h-0 flex items-center">
                        <span className="w-6 text-right">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart container */}
                  <div className="absolute left-8 right-0 top-0 bottom-8">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-px w-full bg-border" />
                      ))}
                    </div>

                    {/* Chart bars and line */}
                    <div className="relative h-full flex items-end justify-between gap-1 px-2">
                      {complaintsOverTime.map((dataPoint, index) => {
                        const maxCount = 30; // Max value for scaling
                        const heightPercentage = (dataPoint.count / maxCount) * 100;
                        const prevDataPoint = complaintsOverTime[index - 1];

                        return (
                          <div
                            key={index}
                            className="relative flex-1 flex flex-col items-center group"
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-xs whitespace-nowrap">
                                <div className="font-semibold">{dataPoint.label}</div>
                                <div className="text-muted-foreground">
                                  {dataPoint.count} complaints
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-popover border-l border-b border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                            </div>

                            {/* Bar */}
                            <div
                              className="w-full bg-primary/20 rounded-t-sm transition-all group-hover:bg-primary/30 cursor-pointer"
                              style={{ height: `${heightPercentage}%` }}
                            />

                            {/* Data point dot */}
                            <div
                              className="absolute w-2 h-2 bg-primary rounded-full border-2 border-background transition-transform group-hover:scale-150"
                              style={{ bottom: `${heightPercentage}%` }}
                            />

                            {/* Connecting line to next point */}
                            {index < complaintsOverTime.length - 1 && (
                              <svg
                                className="absolute left-1/2 pointer-events-none"
                                style={{
                                  bottom: `${heightPercentage}%`,
                                  width: '100%',
                                  height: '100%',
                                }}
                              >
                                <line
                                  x1="0"
                                  y1="0"
                                  x2="100%"
                                  y2={`${heightPercentage - (complaintsOverTime[index + 1].count / maxCount) * 100}%`}
                                  stroke="hsl(var(--primary))"
                                  strokeWidth="2"
                                  className="opacity-50"
                                />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute left-8 right-0 bottom-0 flex justify-between text-xs text-muted-foreground">
                    {complaintsOverTime.map((dataPoint, index) => {
                      // Show every other label to avoid crowding
                      if (index % 2 === 0) {
                        return (
                          <div key={index} className="flex-1 text-center">
                            {dataPoint.label.split(' ')[1]}
                          </div>
                        );
                      }
                      return <div key={index} className="flex-1" />;
                    })}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.max(...complaintsOverTime.map((d) => d.count))}
                    </div>
                    <div className="text-xs text-muted-foreground">Peak Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(
                        complaintsOverTime.reduce((sum, d) => sum + d.count, 0) /
                          complaintsOverTime.length
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Daily Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {complaintsOverTime[complaintsOverTime.length - 1].count >
                      complaintsOverTime[0].count
                        ? '+'
                        : ''}
                      {Math.round(
                        ((complaintsOverTime[complaintsOverTime.length - 1].count -
                          complaintsOverTime[0].count) /
                          complaintsOverTime[0].count) *
                          100
                      )}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">Period Change</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Complaints by Status
              </CardTitle>
              <CardDescription>Current status distribution and breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Donut Chart Visualization */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* SVG Donut Chart */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {(() => {
                        let currentAngle = 0;
                        const radius = 40;
                        const centerX = 50;
                        const centerY = 50;
                        const strokeWidth = 12;

                        return complaintsByStatus.map((item, index) => {
                          const angle = (item.percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;

                          // Convert angles to radians
                          const startRad = (startAngle * Math.PI) / 180;
                          const endRad = (endAngle * Math.PI) / 180;

                          // Calculate arc path
                          const startX = centerX + radius * Math.cos(startRad);
                          const startY = centerY + radius * Math.sin(startRad);
                          const endX = centerX + radius * Math.cos(endRad);
                          const endY = centerY + radius * Math.sin(endRad);

                          const largeArcFlag = angle > 180 ? 1 : 0;

                          const pathData = [
                            `M ${startX} ${startY}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                          ].join(' ');

                          currentAngle = endAngle;

                          // Map color classes to actual colors
                          const colorMap: Record<string, string> = {
                            'bg-blue-500': '#3b82f6',
                            'bg-yellow-500': '#eab308',
                            'bg-purple-500': '#a855f7',
                            'bg-green-500': '#22c55e',
                            'bg-gray-500': '#6b7280',
                          };

                          return (
                            <g key={index} className="group cursor-pointer">
                              <path
                                d={pathData}
                                fill="none"
                                stroke={colorMap[item.color] || '#3b82f6'}
                                strokeWidth={strokeWidth}
                                className="transition-all hover:opacity-80"
                              />
                            </g>
                          );
                        });
                      })()}
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold">{keyMetrics.totalComplaints}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>

                {/* Status List with Progress Bars */}
                <div className="space-y-3">
                  {complaintsByStatus.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${item.color}`} />
                          <span className="font-medium">{item.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-semibold">{item.count}</span>
                          <span className="text-xs text-muted-foreground">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Open Cases</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {complaintsByStatus
                        .filter((s) => ['New', 'Opened', 'In Progress'].includes(s.status))
                        .reduce((sum, s) => sum + s.count, 0)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Completed</div>
                    <div className="text-2xl font-bold text-green-600">
                      {complaintsByStatus
                        .filter((s) => ['Resolved', 'Closed'].includes(s.status))
                        .reduce((sum, s) => sum + s.count, 0)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Completion Rate</div>
                    <div className="text-lg font-bold">
                      {Math.round(
                        (complaintsByStatus
                          .filter((s) => ['Resolved', 'Closed'].includes(s.status))
                          .reduce((sum, s) => sum + s.count, 0) /
                          keyMetrics.totalComplaints) *
                          100
                      )}
                      %
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">In Progress</div>
                    <div className="text-lg font-bold text-purple-600">
                      {complaintsByStatus.find((s) => s.status === 'In Progress')?.count || 0}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Complaints by Category
              </CardTitle>
              <CardDescription>Distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Bar Chart Area */}
                <div className="relative h-64 w-full">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-muted-foreground">
                    {[100, 80, 60, 40, 20, 0].map((value) => (
                      <div key={value} className="h-0 flex items-center">
                        <span className="w-8 text-right">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart container */}
                  <div className="absolute left-10 right-0 top-0 bottom-12">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-px w-full bg-border" />
                      ))}
                    </div>

                    {/* Chart bars */}
                    <div className="relative h-full flex items-end justify-between gap-2 px-2">
                      {complaintsByCategory.map((item, index) => {
                        const maxCount = Math.max(...complaintsByCategory.map((c) => c.count));
                        const heightPercentage = (item.count / maxCount) * 100;

                        // Color palette for different categories
                        const colors = [
                          'bg-blue-500',
                          'bg-green-500',
                          'bg-purple-500',
                          'bg-orange-500',
                          'bg-red-500',
                          'bg-gray-500',
                        ];
                        const barColor = colors[index % colors.length];

                        return (
                          <div
                            key={index}
                            className="relative flex-1 flex flex-col items-center group"
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-xs whitespace-nowrap">
                                <div className="font-semibold">{item.category}</div>
                                <div className="text-muted-foreground">{item.count} complaints</div>
                                <div className="text-muted-foreground">
                                  {item.percentage}% of total
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-popover border-l border-b border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                            </div>

                            {/* Bar */}
                            <div
                              className={`w-full ${barColor} rounded-t-md transition-all group-hover:opacity-80 cursor-pointer relative`}
                              style={{ height: `${heightPercentage}%` }}
                            >
                              {/* Count label on top of bar */}
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground">
                                {item.count}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute left-10 right-0 bottom-0 flex justify-between text-xs text-muted-foreground">
                    {complaintsByCategory.map((item, index) => (
                      <div key={index} className="flex-1 text-center px-1">
                        <div className="truncate" title={item.category}>
                          {item.category.length > 8
                            ? item.category.substring(0, 7) + '...'
                            : item.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {complaintsByCategory[0]?.category || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Top Category</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{complaintsByCategory.length}</div>
                    <div className="text-xs text-muted-foreground">Total Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {complaintsByCategory[0]?.percentage || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Top Share</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaints by Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Complaints by Priority
              </CardTitle>
              <CardDescription>Priority level breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Bar Chart Area */}
                <div className="relative h-64 w-full">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-muted-foreground">
                    {[150, 120, 90, 60, 30, 0].map((value) => (
                      <div key={value} className="h-0 flex items-center">
                        <span className="w-8 text-right">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart container */}
                  <div className="absolute left-10 right-0 top-0 bottom-12">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-px w-full bg-border" />
                      ))}
                    </div>

                    {/* Chart bars */}
                    <div className="relative h-full flex items-end justify-around gap-4 px-4">
                      {complaintsByPriority.map((item, index) => {
                        const maxCount = Math.max(...complaintsByPriority.map((p) => p.count));
                        const heightPercentage = (item.count / maxCount) * 100;

                        return (
                          <div
                            key={index}
                            className="relative flex-1 flex flex-col items-center group max-w-[80px]"
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-xs whitespace-nowrap">
                                <div className="font-semibold">{item.priority}</div>
                                <div className="text-muted-foreground">{item.count} complaints</div>
                                <div className="text-muted-foreground">
                                  {item.percentage}% of total
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-popover border-l border-b border-border rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                            </div>

                            {/* Bar */}
                            <div
                              className={`w-full ${item.color} rounded-t-md transition-all group-hover:opacity-80 cursor-pointer relative`}
                              style={{ height: `${heightPercentage}%` }}
                            >
                              {/* Count label on top of bar */}
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground">
                                {item.count}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute left-10 right-0 bottom-0 flex justify-around text-xs text-muted-foreground px-4">
                    {complaintsByPriority.map((item, index) => (
                      <div key={index} className="flex-1 text-center max-w-[80px]">
                        <div className="truncate" title={item.priority}>
                          {item.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {complaintsByPriority.find((p) => p.priority === 'Medium')?.count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Medium Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {complaintsByPriority.find((p) => p.priority === 'High')?.count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {complaintsByPriority.find((p) => p.priority === 'Critical')?.count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Critical</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lecturer Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lecturer Performance
            </CardTitle>
            <CardDescription>Performance metrics for complaint handlers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Lecturer</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Handled</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Avg Response</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Resolution Rate</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturerPerformance.map((lecturer, index) => (
                    <tr key={lecturer.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {lecturer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <span className="font-medium">{lecturer.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground">
                        {lecturer.complaintsHandled}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary">{lecturer.avgResponseTime}</Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge
                          variant={
                            lecturer.resolutionRate >= 90
                              ? 'default'
                              : lecturer.resolutionRate >= 80
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {lecturer.resolutionRate}%
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{lecturer.satisfactionRating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Ratings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Satisfaction Ratings Summary
            </CardTitle>
            <CardDescription>Student satisfaction with complaint resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Rating Display */}
              <div className="flex items-center justify-between p-6 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Overall Satisfaction
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{keyMetrics.satisfactionRating}</span>
                    <span className="text-2xl text-muted-foreground">/5.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(keyMetrics.satisfactionRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {Math.round(keyMetrics.totalComplaints * 0.65)} ratings
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    {keyMetrics.satisfactionChange}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">vs last period</p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Rating Distribution</h4>
                {[
                  { stars: 5, count: 98, percentage: 61 },
                  { stars: 4, count: 42, percentage: 26 },
                  { stars: 3, count: 15, percentage: 9 },
                  { stars: 2, count: 4, percentage: 3 },
                  { stars: 1, count: 2, percentage: 1 },
                ].map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating.stars}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${rating.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-24 justify-end">
                      <span className="text-sm font-medium">{rating.count}</span>
                      <span className="text-xs text-muted-foreground">({rating.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Satisfaction by Category */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-semibold">Satisfaction by Category</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { category: 'Academic', rating: 4.3, count: 55 },
                    { category: 'Facilities', rating: 4.1, count: 40 },
                    { category: 'Course Content', rating: 4.4, count: 29 },
                    { category: 'Administrative', rating: 3.9, count: 21 },
                    { category: 'Harassment', rating: 4.5, count: 10 },
                    { category: 'Other', rating: 4.0, count: 4 },
                  ].map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{item.category}</div>
                        <div className="text-xs text-muted-foreground">{item.count} ratings</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-bold">{item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insights */}
              <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Positive Ratings</div>
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-xs text-muted-foreground">4-5 stars</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Response Rate</div>
                  <div className="text-2xl font-bold">65%</div>
                  <div className="text-xs text-muted-foreground">Rated complaints</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Improvement</div>
                  <div className="text-2xl font-bold text-green-600">+7%</div>
                  <div className="text-xs text-muted-foreground">From last period</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Complaint Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Common Complaint Types
            </CardTitle>
            <CardDescription>Top 5 complaint categories by frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topComplaintTypes.map((item, index) => {
                const maxCount = Math.max(...topComplaintTypes.map((t) => t.count));
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{item.type}</span>
                        <span className="text-muted-foreground">{item.count} complaints</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                  <Timer className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{keyMetrics.activeCases}</div>
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">18.5h</div>
                  <p className="text-xs text-muted-foreground">From submission to resolution</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Escalated Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
