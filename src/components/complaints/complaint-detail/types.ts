import type {
  Complaint,
  ComplaintTag,
  ComplaintAttachment,
  ComplaintHistory,
  ComplaintComment,
  ComplaintRating,
  User as UserType,
  Feedback,
} from '@/types/database.types';

/**
 * Extended complaint type with all relations loaded
 */
export interface ComplaintWithRelations extends Complaint {
  complaint_tags?: ComplaintTag[];
  complaint_attachments?: ComplaintAttachment[];
  complaint_history?: (ComplaintHistory & { user?: UserType })[];
  complaint_comments?: (ComplaintComment & { user?: UserType })[];
  feedback?: (Feedback & { lecturer?: UserType })[];
  complaint_rating?: ComplaintRating;
  assigned_lecturer?: UserType;
}

/**
 * Props for the main ComplaintDetailView component
 */
export interface ComplaintDetailViewProps {
  complaintId: string;
  onBack?: () => void;
}
