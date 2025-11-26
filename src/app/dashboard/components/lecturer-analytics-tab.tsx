import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Clock,
  CheckCircle2,
  Star,
  Activity,
  Target,
  BarChart3,
  AlertCircle,
  Users,
  TrendingUp,
  Timer,
} from 'lucide-react';

interface AnalyticsData {
  keyMetrics: {
    totalComplaints: number;
    totalChange: string;
    avgResponseTime: string;
    responseTimeChange: string;
    resolutionRate: number;
    resolutionRateChange: string;
    activeCases: number;
    satisfactionRating: number;
    satisfactionChange: string;
  };
  complaintsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  complaintsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  complaintsByPriority: Array<{
    priority: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  complaintsOverTime: Array<{
    date: string;
    count: number;
    label: string;
  }>;
  lecturerPerformance: Array<{
    id: string;
    name: string;
    complaintsHandled: number;
    avgResponseTime: string;
    resolutionRate: number;
    satisfactionRating: number;
  }>;
  topComplaintTypes: Array<{
    type: string;
    count: number;
  }>;
}

interface LecturerAnalyticsTabProps {
  analyticsData: AnalyticsData;
}

export function LecturerAnalyticsTab({ analyticsData }: LecturerAnalyticsTabProps) {
  const {
    keyMetrics,
    complaintsByStatus,
    complaintsByCategory,
    complaintsByPriority,
    complaintsOverTime,
    lecturerPerformance,
    topComplaintTypes,
  } = analyticsData;

  return (
    <>
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
              {/* Simple bar chart visualization */}
              <div className="h-48 flex items-end justify-between gap-1">
                {complaintsOverTime.map((dataPoint, index) => {
                  const maxCount = Math.max(...complaintsOverTime.map((d) => d.count));
                  const heightPercentage = (dataPoint.count / maxCount) * 100;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        {/* Tooltip */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          <div className="bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg border text-xs">
                            <div className="font-semibold">{dataPoint.label}</div>
                            <div className="text-muted-foreground">{dataPoint.count}</div>
                          </div>
                        </div>
                        {/* Bar */}
                        <div
                          className="w-full bg-primary/20 rounded-t-sm transition-all group-hover:bg-primary/30 cursor-pointer"
                          style={{ height: `${heightPercentage * 1.5}px` }}
                        />
                      </div>
                    </div>
                  );
                })}
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
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                        <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
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
              {/* Simple bar chart */}
              <div className="h-48 flex items-end justify-between gap-2">
                {complaintsByCategory.map((item, index) => {
                  const maxCount = Math.max(...complaintsByCategory.map((c) => c.count));
                  const heightPercentage = (item.count / maxCount) * 100;
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
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          <div className="bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg border text-xs">
                            <div className="font-semibold">{item.category}</div>
                            <div className="text-muted-foreground">
                              {item.count} ({item.percentage}%)
                            </div>
                          </div>
                        </div>
                        {/* Bar */}
                        <div
                          className={`w-full ${barColor} rounded-t-md transition-all group-hover:opacity-80 cursor-pointer`}
                          style={{ height: `${heightPercentage * 1.5}px` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {complaintsByCategory[0]?.category || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Top Category</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{complaintsByCategory.length}</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
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
              {/* Simple bar chart */}
              <div className="h-48 flex items-end justify-around gap-4">
                {complaintsByPriority.map((item, index) => {
                  const maxCount = Math.max(...complaintsByPriority.map((p) => p.count));
                  const heightPercentage = (item.count / maxCount) * 100;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center group max-w-[80px]"
                    >
                      <div className="relative w-full">
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          <div className="bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg border text-xs">
                            <div className="font-semibold">{item.priority}</div>
                            <div className="text-muted-foreground">
                              {item.count} ({item.percentage}%)
                            </div>
                          </div>
                        </div>
                        {/* Bar */}
                        <div
                          className={`w-full ${item.color} rounded-t-md transition-all group-hover:opacity-80 cursor-pointer`}
                          style={{ height: `${heightPercentage * 1.5}px` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {complaintsByPriority.find((p) => p.priority === 'Medium')?.count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {complaintsByPriority.find((p) => p.priority === 'High')?.count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">High</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
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
                {lecturerPerformance.map((lecturer) => (
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
    </>
  );
}
