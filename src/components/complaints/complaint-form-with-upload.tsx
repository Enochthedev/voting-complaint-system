/**
 * Complaint Form with Integrated Attachment Upload
 *
 * This is an enhanced version of the complaint form that integrates
 * attachment upload with database metadata storage.
 *
 * For UI development phase, this uses mock upload functions.
 * In Phase 12, switch imports to use real attachment-upload.ts
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FileUpload } from '@/components/ui/file-upload';
import { AlertCircle, Loader2, Info } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority } from '@/types/database.types';
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';

// For UI development, we'll use mock data
// In Phase 12, replace with actual user data from auth context
const MOCK_USER_ID = 'mock-user-id';
const MOCK_COMPLAINT_ID = 'mock-complaint-id';

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  general?: string;
}

interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority | '';
  isAnonymous: boolean;
  tags: string[];
  files: File[];
}

interface ComplaintFormWithUploadProps {
  onSubmit?: (data: ComplaintFormData, isDraft: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ComplaintFormData>;
  isEditing?: boolean;
}

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'course_content', label: 'Course Content' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES: { value: ComplaintPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
];

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

export function ComplaintFormWithUpload({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: ComplaintFormWithUploadProps) {
  const [formData, setFormData] = React.useState<ComplaintFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    priority: initialData?.priority || '',
    isAnonymous: initialData?.isAnonymous || false,
    tags: initialData?.tags || [],
    files: initialData?.files || [],
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  // Use the attachment upload hook
  const {
    uploadProgress,
    uploadedAttachments,
    isUploading,
    uploadFiles,
    removeAttachment,
    clearProgress,
  } = useAttachmentUpload();

  // Helper function to strip HTML tags and get text content
  const getTextContent = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const validateForm = (isDraft: boolean = false): boolean => {
    const newErrors: FormErrors = {};

    if (!isDraft) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (formData.title.length > MAX_TITLE_LENGTH) {
        newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
      }

      const descriptionText = getTextContent(formData.description).trim();
      if (!descriptionText) {
        newErrors.description = 'Description is required';
      } else if (descriptionText.length > MAX_DESCRIPTION_LENGTH) {
        newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
      }

      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }

      if (!formData.priority) {
        newErrors.priority = 'Please select a priority level';
      }
    } else {
      if (formData.title && formData.title.length > MAX_TITLE_LENGTH) {
        newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
      }
      const descriptionText = getTextContent(formData.description);
      if (descriptionText && descriptionText.length > MAX_DESCRIPTION_LENGTH) {
        newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setErrors({});

    if (!validateForm(isDraft)) {
      const firstError = document.querySelector('[class*="border-red"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Upload any pending files
      if (formData.files.length > 0) {
        await uploadFiles(formData.files, MOCK_COMPLAINT_ID, MOCK_USER_ID);
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(formData, isDraft);
      } else {
        // Mock submission for UI development
        console.log('Form submitted:', {
          ...formData,
          isDraft,
          attachments: uploadedAttachments,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Clear progress after successful submission
      clearProgress();
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({
        general: isDraft
          ? 'Failed to save draft. Please try again.'
          : 'An error occurred while submitting. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsSavingDraft(false);
    }
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const handleFileRemove = (fileToRemove: File) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f !== fileToRemove),
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(false);
      }}
      className="space-y-6"
    >
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Anonymous Submission Toggle */}
      <div className="flex items-start space-x-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={formData.isAnonymous}
          onChange={(e) => setFormData((prev) => ({ ...prev, isAnonymous: e.target.checked }))}
          className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-zinc-300"
        />
        <div className="flex-1">
          <label htmlFor="isAnonymous" className="text-sm font-medium leading-none cursor-pointer">
            Submit anonymously
          </label>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <Info className="inline h-3 w-3 mr-1" />
            Your identity will be hidden from lecturers and other students.
          </p>
        </div>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Brief summary of your complaint"
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          disabled={isLoading || isSavingDraft}
          className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
          maxLength={MAX_TITLE_LENGTH}
        />
        <div className="flex justify-between text-xs text-zinc-500">
          {errors.title && <span className="text-red-500">{errors.title}</span>}
          <span className="ml-auto">
            {formData.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-red-500">*</span>
        </Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as ComplaintCategory,
            }));
            if (errors.category) {
              setErrors((prev) => ({ ...prev, category: undefined }));
            }
          }}
          disabled={isLoading || isSavingDraft}
          className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 ${
            errors.category ? 'border-red-500 focus-visible:ring-red-500' : 'border-zinc-200'
          }`}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
      </div>

      {/* Priority Field */}
      <div className="space-y-2">
        <Label>
          Priority Level <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRIORITIES.map((priority) => (
            <button
              key={priority.value}
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, priority: priority.value }));
                if (errors.priority) {
                  setErrors((prev) => ({ ...prev, priority: undefined }));
                }
              }}
              disabled={isLoading || isSavingDraft}
              className={`flex items-center justify-center rounded-md border-2 px-4 py-3 text-sm font-medium transition-all ${
                formData.priority === priority.value
                  ? `${priority.color} border-current ring-2 ring-offset-2 ring-zinc-950 dark:ring-zinc-300`
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {priority.label}
            </button>
          ))}
        </div>
        {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, description: value }));
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: undefined }));
            }
          }}
          placeholder="Provide detailed information about your complaint..."
          disabled={isLoading || isSavingDraft}
          maxLength={MAX_DESCRIPTION_LENGTH}
          error={!!errors.description}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      {/* File Attachments with Upload Progress */}
      <div className="space-y-2">
        <Label>File Attachments (Optional)</Label>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Attach supporting documents, images, or other files to your complaint.
        </p>
        <FileUpload
          files={formData.files}
          uploadProgress={uploadProgress}
          onFilesSelected={handleFilesSelected}
          onFileRemove={handleFileRemove}
          disabled={isLoading || isSavingDraft || isUploading}
        />
        {uploadedAttachments.length > 0 && (
          <div className="mt-2 text-sm text-green-600 dark:text-green-500">
            ✓ {uploadedAttachments.length} file(s) uploaded successfully
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isSavingDraft || isUploading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit(true)}
          disabled={isLoading || isSavingDraft || isUploading}
        >
          {isSavingDraft ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Draft...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        <Button type="submit" disabled={isLoading || isSavingDraft || isUploading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Complaint'
          )}
        </Button>
      </div>
    </form>
  );
}
