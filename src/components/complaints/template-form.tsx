'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import type {
  ComplaintTemplate,
  ComplaintCategory,
  ComplaintPriority,
} from '@/types/database.types';

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'course_content', label: 'Course Content' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES: { value: ComplaintPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date';
  required: boolean;
  placeholder: string;
}

interface TemplateFormProps {
  template?: ComplaintTemplate | null;
  onSave: (template: Partial<ComplaintTemplate>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TemplateForm({
  template,
  onSave,
  onCancel,
  isLoading = false,
}: TemplateFormProps) {
  const [title, setTitle] = React.useState(template?.title || '');
  const [description, setDescription] = React.useState(template?.description || '');
  const [category, setCategory] = React.useState<ComplaintCategory>(
    template?.category || 'academic'
  );
  const [suggestedPriority, setSuggestedPriority] = React.useState<ComplaintPriority>(
    template?.suggested_priority || 'medium'
  );
  const [isActive, setIsActive] = React.useState(template?.is_active ?? true);
  const [fields, setFields] = React.useState<TemplateField[]>(() => {
    if (template?.fields && typeof template.fields === 'object') {
      return Object.entries(template.fields).map(([key, value], index) => ({
        id: `field-${index}`,
        name: key,
        label: key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        type: 'text' as const,
        required: false,
        placeholder: typeof value === 'string' ? value : '',
      }));
    }
    return [];
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const addField = () => {
    const newField: TemplateField = {
      id: `field-${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(
      fields.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Validate fields
    fields.forEach((field, index) => {
      if (!field.name.trim()) {
        newErrors[`field-${field.id}-name`] = 'Field name is required';
      } else if (!/^[a-z_]+$/.test(field.name)) {
        newErrors[`field-${field.id}-name`] =
          'Field name must be lowercase letters and underscores only';
      }

      if (!field.label.trim()) {
        newErrors[`field-${field.id}-label`] = 'Field label is required';
      }

      // Check for duplicate field names
      const duplicates = fields.filter((f) => f.name === field.name);
      if (duplicates.length > 1) {
        newErrors[`field-${field.id}-name`] = 'Field name must be unique';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert fields array to fields object
    const fieldsObject: Record<string, any> = {};
    fields.forEach((field) => {
      fieldsObject[field.name] = {
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
      };
    });

    const templateData: Partial<ComplaintTemplate> = {
      title: title.trim(),
      description: description.trim(),
      category,
      suggested_priority: suggestedPriority,
      is_active: isActive,
      fields: fieldsObject,
    };

    if (template?.id) {
      templateData.id = template.id;
    }

    onSave(templateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">
          Template Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Broken Equipment in Lab"
          className="mt-2"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {title.length}/200 characters
        </p>
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
          placeholder="Describe what this template is for and when students should use it..."
          rows={4}
          className="mt-2 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Category and Priority */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="priority">
            Suggested Priority <span className="text-destructive">*</span>
          </Label>
          <select
            id="priority"
            value={suggestedPriority}
            onChange={(e) => setSuggestedPriority(e.target.value as ComplaintPriority)}
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
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

      {/* Template Fields */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label>Template Fields</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add Field
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No fields added yet. Click &quot;Add Field&quot; to create custom fields for
              this template.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-border bg-muted p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Field {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                    disabled={isLoading}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`field-${field.id}-name`} className="text-xs">
                      Field Name (lowercase_with_underscores)
                    </Label>
                    <Input
                      id={`field-${field.id}-name`}
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        updateField(field.id, { name: e.target.value.toLowerCase() })
                      }
                      placeholder="e.g., room_number"
                      className="mt-1"
                      disabled={isLoading}
                    />
                    {errors[`field-${field.id}-name`] && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors[`field-${field.id}-name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`field-${field.id}-label`} className="text-xs">
                      Field Label (Display Name)
                    </Label>
                    <Input
                      id={`field-${field.id}-label`}
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="e.g., Room Number"
                      className="mt-1"
                      disabled={isLoading}
                    />
                    {errors[`field-${field.id}-label`] && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors[`field-${field.id}-label`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`field-${field.id}-type`} className="text-xs">
                      Field Type
                    </Label>
                    <select
                      id={`field-${field.id}-type`}
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as TemplateField['type'],
                        })
                      }
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Text Area</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor={`field-${field.id}-placeholder`} className="text-xs">
                      Placeholder Text
                    </Label>
                    <Input
                      id={`field-${field.id}-placeholder`}
                      type="text"
                      value={field.placeholder}
                      onChange={(e) =>
                        updateField(field.id, { placeholder: e.target.value })
                      }
                      placeholder="e.g., Enter room number"
                      className="mt-1"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`field-${field.id}-required`}
                    checked={field.required}
                    onChange={(e) =>
                      updateField(field.id, { required: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={`field-${field.id}-required`}
                    className="cursor-pointer text-xs"
                  >
                    Required field
                  </Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
