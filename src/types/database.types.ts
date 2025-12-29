// Database types for Supabase
export type UserRole = 'student' | 'lecturer' | 'admin';

export type ComplaintCategory =
  | 'academic'
  | 'facilities'
  | 'harassment'
  | 'course_content'
  | 'administrative'
  | 'other';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'draft'
  | 'new'
  | 'opened'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type HistoryAction =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'reassigned'
  | 'feedback_added'
  | 'comment_added'
  | 'reopened'
  | 'escalated'
  | 'rated'
  | 'tags_added';

export type NotificationType =
  | 'complaint_opened'
  | 'feedback_received'
  | 'new_complaint'
  | 'new_announcement'
  | 'new_vote'
  | 'comment_added'
  | 'complaint_assigned'
  | 'complaint_escalated'
  | 'complaint_reopened'
  | 'status_changed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  student_id: string | null;
  is_anonymous: boolean;
  is_draft: boolean;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  opened_at: string | null;
  opened_by: string | null;
  resolved_at: string | null;
  escalated_at: string | null;
  escalation_level: number;
}

export interface ComplaintTag {
  id: string;
  complaint_id: string;
  tag_name: string;
  created_at: string;
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface ComplaintHistory {
  id: string;
  complaint_id: string;
  action: HistoryAction;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  details: Record<string, any> | null;
  created_at: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintRating {
  id: string;
  complaint_id: string;
  student_id: string;
  rating: number;
  feedback_text: string | null;
  created_at: string;
}

export interface ComplaintTemplate {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  suggested_priority: ComplaintPriority;
  fields: Record<string, any>;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EscalationRule {
  id: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  hours_threshold: number;
  escalate_to: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  complaint_id: string;
  lecturer_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  created_by: string;
  title: string;
  description: string;
  options: Record<string, any>;
  is_active: boolean;
  related_complaint_id: string | null;
  created_at: string;
  closes_at: string | null;
}

export interface VoteResponse {
  id: string;
  vote_id: string;
  student_id: string;
  selected_option: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  created_by: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
