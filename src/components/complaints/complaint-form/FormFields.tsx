'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Info } from 'lucide-react';
import type { ComplaintFormData, FormErrors } from './types';
import { CATEGORIES, PRIORITIES, MAX_TITLE_LENGTH } from './constants';

interface FormFieldsProps {
  formData: ComplaintFormData;
  errors: FormErrors;
  onChange: (data: ComplaintFormData) => void;
  onErrorChange: (errors: FormErrors) => void;
  disabled?: boolean;
}

export function FormFields({
  formData,
  errors,
  onChange,
  onErrorChange,
  disabled = false,
}: FormFieldsProps) {
  const handleFieldChange = (field: keyof ComplaintFormData, value: any) => {
    onChange({ ...formData, [field]: value });

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      const newErrors = { ...errors };
      delete newErrors[field as keyof FormErrors];
      onErrorChange(newErrors);
    }
  };

  return (
    <>
      {/* Anonymous Submission Toggle */}
      <div className="flex items-start space-x-3 rounded-lg border bg-muted p-4">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={formData.isAnonymous}
          onChange={(e) => handleFieldChange('isAnonymous', e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-input bg-background focus:ring-2 focus:ring-ring"
          disabled={disabled}
        />
        <div className="flex-1">
          <label htmlFor="isAnonymous" className="text-sm font-medium leading-none cursor-pointer">
            Submit anonymously
          </label>
          <p className="mt-1 text-sm text-muted-foreground">
            <Info className="inline h-3 w-3 mr-1" />
            Your identity will be hidden from lecturers and other students. Only system
            administrators can see anonymous complaint authors for security purposes.
          </p>
        </div>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Brief summary of your complaint"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          disabled={disabled}
          className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
          maxLength={MAX_TITLE_LENGTH}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.title && <span className="text-destructive">{errors.title}</span>}
          <span className="ml-auto">
            {formData.title.length}/{MAX_TITLE_LENGTH}
          </span>
        </div>
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          disabled={disabled}
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.category ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
          }`}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
      </div>

      {/* Priority Field */}
      <div className="space-y-2">
        <Label>
          Priority Level <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRIORITIES.map((priority) => (
            <button
              key={priority.value}
              type="button"
              onClick={() => handleFieldChange('priority', priority.value)}
              disabled={disabled}
              className={`flex items-center justify-center rounded-md border-2 px-4 py-3 text-sm font-medium transition-all ${
                formData.priority === priority.value
                  ? `${priority.color} border-current ring-2 ring-offset-2 ring-ring`
                  : 'border-input bg-background hover:bg-accent'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {priority.label}
            </button>
          ))}
        </div>
        {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => handleFieldChange('description', value)}
          placeholder="Provide detailed information about your complaint..."
          disabled={disabled}
          error={!!errors.description}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>
    </>
  );
}
