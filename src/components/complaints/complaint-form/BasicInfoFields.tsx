'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  CATEGORIES,
  PRIORITIES,
  MAX_TITLE_LENGTH,
  type ComplaintFormData,
  type FormErrors,
} from './types';

interface BasicInfoFieldsProps {
  formData: ComplaintFormData;
  errors: FormErrors;
  onChange: (field: keyof ComplaintFormData, value: any) => void;
}

/**
 * Basic Info Fields Component
 * Title, category, priority, and anonymous toggle
 */
export function BasicInfoFields({ formData, errors, onChange }: BasicInfoFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Title Field */}
      <div>
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Brief summary of your complaint"
          maxLength={MAX_TITLE_LENGTH}
          className={cn(errors.title && 'border-destructive')}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          <p className="ml-auto text-xs text-muted-foreground">
            {formData.title.length}/{MAX_TITLE_LENGTH}
          </p>
        </div>
      </div>

      {/* Category and Priority Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Category Field */}
        <div>
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => onChange('category', e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              errors.category && 'border-destructive'
            )}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
        </div>

        {/* Priority Field */}
        <div>
          <Label htmlFor="priority">
            Priority <span className="text-destructive">*</span>
          </Label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => onChange('priority', e.target.value)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              errors.priority && 'border-destructive'
            )}
          >
            <option value="">Select priority</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
          {errors.priority && <p className="mt-1 text-sm text-destructive">{errors.priority}</p>}
        </div>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={formData.isAnonymous}
          onChange={(e) => onChange('isAnonymous', e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <Label htmlFor="anonymous" className="cursor-pointer font-normal">
          Submit anonymously
        </Label>
      </div>
    </div>
  );
}
