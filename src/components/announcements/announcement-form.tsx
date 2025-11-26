'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Announcement } from '@/types/database.types';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onSave: (announcement: Partial<Announcement>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AnnouncementForm({
  announcement,
  onSave,
  onCancel,
  isLoading = false,
}: AnnouncementFormProps) {
  const [title, setTitle] = React.useState(announcement?.title || '');
  const [content, setContent] = React.useState(announcement?.content || '');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Validate content
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const announcementData: Partial<Announcement> = {
      title: title.trim(),
      content: content.trim(),
    };

    if (announcement?.id) {
      announcementData.id = announcement.id;
    }

    onSave(announcementData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">
          Announcement Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., System Maintenance Scheduled"
          className="mt-2"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{title.length}/200 characters</p>
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">
          Content <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement here..."
          rows={8}
          className="mt-2 flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        />
        {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{content.length}/5000 characters</p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This announcement will be visible to all students immediately after creation.
        </AlertDescription>
      </Alert>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {announcement ? 'Update Announcement' : 'Create Announcement'}
        </Button>
      </div>
    </form>
  );
}
