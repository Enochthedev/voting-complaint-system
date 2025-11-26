'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import type { Vote } from '@/types/database.types';

interface VoteOption {
  id: string;
  text: string;
}

interface VoteFormProps {
  vote?: Vote | null;
  onSave: (vote: Partial<Vote>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VoteForm({ vote, onSave, onCancel, isLoading = false }: VoteFormProps) {
  const [title, setTitle] = React.useState(vote?.title || '');
  const [description, setDescription] = React.useState(vote?.description || '');
  const [relatedComplaintId, setRelatedComplaintId] = React.useState(
    vote?.related_complaint_id || ''
  );
  const [closesAt, setClosesAt] = React.useState(() => {
    if (vote?.closes_at) {
      // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
      return new Date(vote.closes_at).toISOString().slice(0, 16);
    }
    return '';
  });
  const [isActive, setIsActive] = React.useState(vote?.is_active ?? true);
  const [options, setOptions] = React.useState<VoteOption[]>(() => {
    if (vote?.options && Array.isArray(vote.options)) {
      return vote.options.map((opt: any, index: number) => ({
        id: `option-${index}`,
        text: typeof opt === 'string' ? opt : opt.text || '',
      }));
    }
    // Start with 2 empty options
    return [
      { id: 'option-1', text: '' },
      { id: 'option-2', text: '' },
    ];
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const addOption = () => {
    const newOption: VoteOption = {
      id: `option-${Date.now()}`,
      text: '',
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      setErrors({
        ...errors,
        options: 'A vote must have at least 2 options',
      });
      return;
    }
    setOptions(options.filter((option) => option.id !== id));
    // Clear the options error if it exists
    const newErrors = { ...errors };
    delete newErrors.options;
    setErrors(newErrors);
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, text } : option)));
  };

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

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Validate options
    if (options.length < 2) {
      newErrors.options = 'A vote must have at least 2 options';
    }

    const filledOptions = options.filter((opt) => opt.text.trim());
    if (filledOptions.length < 2) {
      newErrors.options = 'At least 2 options must have text';
    }

    // Check for duplicate options
    const optionTexts = options.map((opt) => opt.text.trim().toLowerCase());
    const uniqueTexts = new Set(optionTexts.filter((text) => text));
    if (uniqueTexts.size !== filledOptions.length) {
      newErrors.options = 'Options must be unique';
    }

    // Validate individual options
    options.forEach((option, index) => {
      if (option.text.trim() && option.text.length > 200) {
        newErrors[`option-${option.id}`] = 'Option text must be less than 200 characters';
      }
    });

    // Validate closes_at (optional, but if provided must be in future)
    if (closesAt) {
      const closingDate = new Date(closesAt);
      const now = new Date();
      if (closingDate <= now) {
        newErrors.closesAt = 'Closing date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty options and convert to array of strings
    const optionsArray = options.filter((opt) => opt.text.trim()).map((opt) => opt.text.trim());

    const voteData: Partial<Vote> = {
      title: title.trim(),
      description: description.trim(),
      options: optionsArray as any, // Store as array
      is_active: isActive,
      related_complaint_id: relatedComplaintId.trim() || null,
      closes_at: closesAt ? new Date(closesAt).toISOString() : null,
    };

    if (vote?.id) {
      voteData.id = vote.id;
    }

    onSave(voteData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">
          Vote Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Should we extend library hours?"
          className="mt-2"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{title.length}/200 characters</p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide context and details about this vote..."
          rows={4}
          className="mt-2 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{description.length}/1000 characters</p>
      </div>

      {/* Vote Options */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label>
            Vote Options <span className="text-destructive">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add Option
          </Button>
        </div>

        {errors.options && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.options}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <Input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={isLoading}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                      disabled={isLoading}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {errors[`option-${option.id}`] && (
                  <p className="mt-1 text-xs text-destructive">{errors[`option-${option.id}`]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Add at least 2 options for students to choose from
        </p>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4 rounded-lg border border-border bg-muted p-4">
        <h3 className="text-sm font-medium text-foreground">Optional Settings</h3>

        {/* Related Complaint ID */}
        <div>
          <Label htmlFor="related-complaint">Related Complaint ID (Optional)</Label>
          <Input
            id="related-complaint"
            type="text"
            value={relatedComplaintId}
            onChange={(e) => setRelatedComplaintId(e.target.value)}
            placeholder="Enter complaint ID if this vote is related to a specific complaint"
            className="mt-2"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Link this vote to a specific complaint for context
          </p>
        </div>

        {/* Closing Date */}
        <div>
          <Label htmlFor="closes-at">Closing Date & Time (Optional)</Label>
          <Input
            id="closes-at"
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            className="mt-2"
            disabled={isLoading}
          />
          {errors.closesAt && <p className="mt-1 text-sm text-destructive">{errors.closesAt}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Leave empty to keep the vote open indefinitely
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <Label htmlFor="is-active" className="cursor-pointer">
            Active (visible to students)
          </Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {vote ? 'Update Vote' : 'Create Vote'}
        </Button>
      </div>
    </form>
  );
}
