import * as React from 'react';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  History,
  Star,
  Tag,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import type { ComplaintStatus, ComplaintPriority, ComplaintCategory } from '@/types/database.types';

/**
 * Status badge configuration
 */
export const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border-border',
    icon: <FileText className="h-4 w-4" />,
  },
  new: {
    label: 'New',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  opened: {
    label: 'Opened',
    className: 'bg-accent/10 text-accent-foreground border-accent/20',
    icon: <FileText className="h-4 w-4" />,
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-accent/10 text-accent-foreground border-accent/20',
    icon: <Clock className="h-4 w-4" />,
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground border-border',
    icon: <XCircle className="h-4 w-4" />,
  },
  reopened: {
    label: 'Reopened',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

/**
 * Priority configuration
 */
export const PRIORITY_CONFIG: Record<
  ComplaintPriority,
  { label: string; className: string; dotColor: string }
> = {
  low: {
    label: 'Low',
    className: 'text-primary',
    dotColor: 'bg-primary',
  },
  medium: {
    label: 'Medium',
    className: 'text-accent-foreground',
    dotColor: 'bg-accent',
  },
  high: {
    label: 'High',
    className: 'text-destructive',
    dotColor: 'bg-destructive',
  },
  critical: {
    label: 'Critical',
    className: 'text-destructive',
    dotColor: 'bg-destructive',
  },
};

/**
 * Category labels
 */
export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  academic: 'Academic',
  facilities: 'Facilities',
  harassment: 'Harassment',
  course_content: 'Course Content',
  administrative: 'Administrative',
  other: 'Other',
};

/**
 * Get action icon for timeline
 * Maps each action type to an appropriate icon for visual clarity
 */
export function getActionIcon(action: string): React.ReactNode {
  switch (action) {
    case 'created':
      return <FileText className="h-4 w-4" />;
    case 'status_changed':
      return <Clock className="h-4 w-4" />;
    case 'assigned':
      return <UserPlus className="h-4 w-4" />;
    case 'reassigned':
      return <User className="h-4 w-4" />;
    case 'comment_added':
      return <MessageSquare className="h-4 w-4" />;
    case 'feedback_added':
      return <MessageSquare className="h-4 w-4" />;
    case 'reopened':
      return <AlertCircle className="h-4 w-4" />;
    case 'escalated':
      return <TrendingUp className="h-4 w-4" />;
    case 'rated':
      return <Star className="h-4 w-4" />;
    case 'tags_added':
      return <Tag className="h-4 w-4" />;
    default:
      return <History className="h-4 w-4" />;
  }
}
