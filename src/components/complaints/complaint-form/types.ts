import type { ComplaintCategory, ComplaintPriority } from '@/types/database.types';

// Form validation constants
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;

// Category options
export const CATEGORIES: ComplaintCategory[] = [
  'academic',
  'facilities',
  'harassment',
  'course_content',
  'administrative',
  'other',
];

// Priority options
export const PRIORITIES: ComplaintPriority[] = ['low', 'medium', 'high', 'critical'];

export interface FormErrors extends Record<string, string | undefined> {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  general?: string;
}

export interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority | '';
  isAnonymous: boolean;
  tags: string[];
  files: File[];
}

export interface ComplaintFormProps {
  onSubmit?: (data: ComplaintFormData, isDraft: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<Omit<ComplaintFormData, 'files'>> & { files?: File[] };
  isEditing?: boolean;
  showTemplateSelector?: boolean;
}

export interface TemplateField {
  label: string;
  type: 'text' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface ComplaintTemplate {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  suggested_priority: ComplaintPriority;
  fields: Record<string, TemplateField>;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
