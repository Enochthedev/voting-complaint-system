/**
 * Application Constants
 */

// Complaint Categories
export const COMPLAINT_CATEGORIES = [
  'academic',
  'facilities',
  'harassment',
  'course_content',
  'administrative',
  'other',
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

// Complaint Priorities
export const COMPLAINT_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export type ComplaintPriority = (typeof COMPLAINT_PRIORITIES)[number];

// Complaint Statuses
export const COMPLAINT_STATUSES = [
  'draft',
  'new',
  'opened',
  'in_progress',
  'resolved',
  'closed',
  'reopened',
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

// User Roles
export const USER_ROLES = ['student', 'lecturer', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

// Notification Types
export const NOTIFICATION_TYPES = [
  'complaint_opened',
  'feedback_received',
  'new_complaint',
  'new_announcement',
  'new_vote',
  'comment_added',
  'assignment',
  'escalation',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// File Upload Constraints
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_COMPLAINT = 5;
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Real-time
export const NOTIFICATION_CHANNEL = 'notifications';

// Category Labels
export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  academic: 'Academic',
  facilities: 'Facilities',
  harassment: 'Harassment',
  course_content: 'Course Content',
  administrative: 'Administrative',
  other: 'Other',
};

// Priority Labels
export const PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// Status Labels
export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  draft: 'Draft',
  new: 'New',
  opened: 'Opened',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  reopened: 'Reopened',
};
