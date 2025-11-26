import type { ComplaintCategory, ComplaintPriority } from '@/types/database.types';

export const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'course_content', label: 'Course Content' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

export const PRIORITIES: { value: ComplaintPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-secondary text-secondary-foreground border-border' },
  {
    value: 'medium',
    label: 'Medium',
    color: 'bg-accent/20 text-accent-foreground border-accent/30',
  },
  { value: 'high', label: 'High', color: 'bg-primary/20 text-primary border-primary/30' },
  {
    value: 'critical',
    label: 'Critical',
    color: 'bg-destructive/20 text-destructive border-destructive/30',
  },
];

export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_TAG_LENGTH = 50;
export const MAX_TAGS = 10;
