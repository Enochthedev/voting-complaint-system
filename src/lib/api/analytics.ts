import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';
import type { Complaint, ComplaintRating, User } from '@/types/database.types';

export interface AnalyticsData {
  timePeriod: string;
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

/**
 * Get analytics data from the database
 */
async function getAnalyticsDataImpl(days: number = 30): Promise<AnalyticsData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateISO = startDate.toISOString();

  // Fetch all complaints for the period
  const { data: complaints, error: complaintsError } = await supabase
    .from('complaints')
    .select('id, status, category, priority, created_at, resolved_at, assigned_to, is_draft')
    .eq('is_draft', false)
    .gte('created_at', startDateISO);

  if (complaintsError) {
    console.error('Error fetching complaints for analytics:', complaintsError);
    throw new Error('Failed to fetch analytics data');
  }

  const allComplaints = complaints || [];
  const total = allComplaints.length;

  // Calculate status distribution
  const statusCounts: Record<string, number> = {
    new: 0,
    opened: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    reopened: 0,
  };

  allComplaints.forEach((c: any) => {
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++;
    }
  });

  const complaintsByStatus = [
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
      color: 'bg-yellow-500',
    },
    {
      status: 'In Progress',
      count: statusCounts.in_progress,
      percentage: total > 0 ? Math.round((statusCounts.in_progress / total) * 100) : 0,
      color: 'bg-purple-500',
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
  ];

  // Calculate category distribution
  const categoryCounts: Record<string, number> = {};
  allComplaints.forEach((c: any) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const complaintsByCategory = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate priority distribution
  const priorityCounts: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  allComplaints.forEach((c: any) => {
    if (priorityCounts[c.priority] !== undefined) {
      priorityCounts[c.priority]++;
    }
  });

  const complaintsByPriority = [
    {
      priority: 'Critical',
      count: priorityCounts.critical,
      percentage: total > 0 ? Math.round((priorityCounts.critical / total) * 100) : 0,
      color: 'bg-red-600',
    },
    {
      priority: 'High',
      count: priorityCounts.high,
      percentage: total > 0 ? Math.round((priorityCounts.high / total) * 100) : 0,
      color: 'bg-orange-500',
    },
    {
      priority: 'Medium',
      count: priorityCounts.medium,
      percentage: total > 0 ? Math.round((priorityCounts.medium / total) * 100) : 0,
      color: 'bg-yellow-500',
    },
    {
      priority: 'Low',
      count: priorityCounts.low,
      percentage: total > 0 ? Math.round((priorityCounts.low / total) * 100) : 0,
      color: 'bg-green-500',
    },
  ];

  // Calculate complaints over time (group by day)
  const dateCounts: Record<string, number> = {};
  allComplaints.forEach((c: any) => {
    const date = new Date(c.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });

  const complaintsOverTime = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count, label: date }))
    .slice(-14); // Last 14 data points

  // Calculate key metrics
  const resolvedCount = statusCounts.resolved + statusCounts.closed;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const activeCases = statusCounts.new + statusCounts.opened + statusCounts.in_progress;

  // Get satisfaction ratings
  const { data: ratings } = await supabase
    .from('complaint_ratings')
    .select('rating')
    .gte('created_at', startDateISO);

  const avgRating =
    ratings && ratings.length > 0
      ? Math.round(
          (ratings.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / ratings.length) * 10
        ) / 10
      : 0;

  // Get lecturer performance
  const { data: lecturers } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'lecturer');

  const lecturerPerformance = (lecturers || [])
    .map((lecturer: any) => {
      const handled = allComplaints.filter((c: any) => c.assigned_to === lecturer.id).length;
      const resolved = allComplaints.filter(
        (c: any) =>
          c.assigned_to === lecturer.id && (c.status === 'resolved' || c.status === 'closed')
      ).length;
      return {
        id: lecturer.id,
        name: lecturer.full_name || 'Unknown',
        complaintsHandled: handled,
        avgResponseTime: 'N/A',
        resolutionRate: handled > 0 ? Math.round((resolved / handled) * 100) : 0,
        satisfactionRating: 0,
      };
    })
    .filter((l: any) => l.complaintsHandled > 0);

  return {
    timePeriod: `Last ${days} days`,
    keyMetrics: {
      totalComplaints: total,
      totalChange: '+0%',
      avgResponseTime: 'N/A',
      responseTimeChange: '0%',
      resolutionRate,
      resolutionRateChange: '+0%',
      activeCases,
      satisfactionRating: avgRating,
      satisfactionChange: '+0',
    },
    complaintsByStatus,
    complaintsByCategory,
    complaintsByPriority,
    complaintsOverTime,
    lecturerPerformance,
    topComplaintTypes: complaintsByCategory
      .slice(0, 5)
      .map((c) => ({ type: c.category, count: c.count })),
  };
}

export const getAnalyticsData = withRateLimit(getAnalyticsDataImpl, 'read');
