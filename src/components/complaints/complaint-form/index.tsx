'use client';

import * as React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/ui/file-upload';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import type { ComplaintFormData, ComplaintFormProps, ComplaintTemplate } from './types';
import { validateForm, sanitizeFormData } from './validation';
import { applyTemplateToFormData } from './template-utils';
import { TemplateSelector } from './TemplateSelector';
import { FormFields } from './FormFields';
import { TagInput } from './TagInput';
import { FormActions } from './FormActions';

export function ComplaintForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  showTemplateSelector = true,
}: ComplaintFormProps) {
  const [formData, setFormData] = React.useState<ComplaintFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    priority: initialData?.priority || '',
    isAnonymous: initialData?.isAnonymous || false,
    tags: initialData?.tags || [],
    files: initialData?.files || [],
  });

  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<ComplaintTemplate | null>(null);

  const handleSubmit = async (isDraft: boolean = false) => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateForm(formData, isDraft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
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
      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData(formData);

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(sanitizedData, isDraft);
      } else {
        // Mock submission for UI development
        console.log('Form submitted:', { ...sanitizedData, isDraft });
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
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

  const handleTemplateSelect = (template: ComplaintTemplate) => {
    setSelectedTemplate(template);
    setFormData(applyTemplateToFormData(template, formData));
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: '',
      isAnonymous: false,
      tags: [],
      files: [],
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(false);
      }}
      className="space-y-6"
    >
      {/* Template Selector */}
      {showTemplateSelector && !isEditing && (
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onSelect={handleTemplateSelect}
          onClear={handleClearTemplate}
          disabled={isLoading || isSavingDraft}
        />
      )}

      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <FormFields
        formData={formData}
        errors={errors}
        onChange={setFormData}
        onErrorChange={setErrors}
        disabled={isLoading || isSavingDraft}
      />

      {/* Tags */}
      <TagInput
        tags={formData.tags}
        onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
        disabled={isLoading || isSavingDraft}
      />

      {/* File Attachments */}
      <div className="space-y-2">
        <Label>File Attachments (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Attach supporting documents, images, or other files to your complaint.
        </p>
        <FileUpload
          files={formData.files}
          onFilesSelected={(newFiles) => {
            setFormData((prev) => ({
              ...prev,
              files: [...prev.files, ...newFiles],
            }));
          }}
          onFileRemove={(fileToRemove) => {
            setFormData((prev) => ({
              ...prev,
              files: prev.files.filter((f) => f !== fileToRemove),
            }));
          }}
          disabled={isLoading || isSavingDraft}
        />
      </div>

      {/* Action Buttons */}
      <FormActions
        onCancel={onCancel}
        onSaveDraft={() => handleSubmit(true)}
        isLoading={isLoading}
        isSavingDraft={isSavingDraft}
      />
    </form>
  );
}

// Re-export types for convenience
export type { ComplaintFormData, ComplaintFormProps, ComplaintTemplate } from './types';
