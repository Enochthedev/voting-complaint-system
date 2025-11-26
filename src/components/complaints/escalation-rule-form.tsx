'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import {
  validateEscalationRule,
  formatThreshold,
  getCategoryLabel,
  type ValidationError,
} from '@/lib/validations/escalation-rules';
import type {
  EscalationRule,
  ComplaintCategory,
  ComplaintPriority,
  User,
} from '@/types/database.types';

interface EscalationRuleFormProps {
  rule?: EscalationRule | null;
  users: User[];
  existingRules?: EscalationRule[];
  onSave: (ruleData: Partial<EscalationRule>) => void;
  onCancel: () => void;
}

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

// Common time threshold presets in hours
const TIME_PRESETS = [
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '12 hours', value: 12 },
  { label: '24 hours (1 day)', value: 24 },
  { label: '48 hours (2 days)', value: 48 },
  { label: '72 hours (3 days)', value: 72 },
  { label: '168 hours (1 week)', value: 168 },
];

export function EscalationRuleForm({
  rule,
  users,
  existingRules = [],
  onSave,
  onCancel,
}: EscalationRuleFormProps) {
  const [category, setCategory] = React.useState<ComplaintCategory>(rule?.category || 'academic');
  const [priority, setPriority] = React.useState<ComplaintPriority>(rule?.priority || 'medium');
  const [hoursThreshold, setHoursThreshold] = React.useState<string>(
    rule?.hours_threshold?.toString() || '24'
  );
  const [escalateTo, setEscalateTo] = React.useState<string>(rule?.escalate_to || '');
  const [isActive, setIsActive] = React.useState<boolean>(rule?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  // Filter users to only show lecturers and admins
  const eligibleUsers = React.useMemo(() => {
    return users.filter((user) => user.role === 'lecturer' || user.role === 'admin');
  }, [users]);

  // Real-time validation when fields change
  React.useEffect(() => {
    // Only validate if at least one field has been touched
    if (Object.keys(touched).length > 0) {
      const hours = parseInt(hoursThreshold, 10);

      const ruleData: Partial<EscalationRule> = {
        category,
        priority,
        hours_threshold: isNaN(hours) ? undefined : hours,
        escalate_to: escalateTo || undefined,
        is_active: isActive,
      };

      const validationResult = validateEscalationRule(ruleData, existingRules, users, rule?.id);

      setValidationErrors(validationResult.errors);
    }
  }, [
    category,
    priority,
    hoursThreshold,
    escalateTo,
    isActive,
    existingRules,
    users,
    rule?.id,
    touched,
  ]);

  // Get errors and warnings by field
  const getFieldErrors = (field: string) => {
    return validationErrors.filter((e) => e.field === field && e.severity === 'error');
  };

  const getFieldWarnings = (field: string) => {
    return validationErrors.filter((e) => e.field === field && e.severity === 'warning');
  };

  const validateForm = (): boolean => {
    const hours = parseInt(hoursThreshold, 10);

    const ruleData: Partial<EscalationRule> = {
      category,
      priority,
      hours_threshold: isNaN(hours) ? undefined : hours,
      escalate_to: escalateTo || undefined,
      is_active: isActive,
    };

    const validationResult = validateEscalationRule(ruleData, existingRules, users, rule?.id);

    setValidationErrors(validationResult.errors);
    return validationResult.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    setTouched({
      category: true,
      priority: true,
      hours_threshold: true,
      escalate_to: true,
      is_active: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ruleData: Partial<EscalationRule> = {
        category,
        priority,
        hours_threshold: parseInt(hoursThreshold, 10),
        escalate_to: escalateTo,
        is_active: isActive,
      };

      onSave(ruleData);
    } catch (error) {
      console.error('Error saving escalation rule:', error);
      setValidationErrors([
        {
          field: 'submit',
          message: 'Failed to save escalation rule. Please try again.',
          severity: 'error',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = (hours: number) => {
    setHoursThreshold(hours.toString());
  };

  const formatThreshold = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Errors */}
      {validationErrors
        .filter((e) => e.field === 'submit' || e.field === 'duplicate')
        .map((error, idx) => (
          <Alert key={idx} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ))}

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This rule will automatically escalate complaints of the specified category and priority
          that remain unaddressed for the configured time period. Only one active rule can exist per
          category and priority combination.
        </AlertDescription>
      </Alert>

      {/* Category */}
      <div>
        <Label htmlFor="category">
          Complaint Category <span className="text-red-500">*</span>
        </Label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as ComplaintCategory);
            setTouched((prev) => ({ ...prev, category: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, category: true }))}
          className="mt-2 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
          disabled={isSubmitting}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {getFieldErrors('category').map((error, idx) => (
          <p key={idx} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        ))}
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Select the complaint category this rule applies to
        </p>
      </div>

      {/* Priority */}
      <div>
        <Label htmlFor="priority">
          Complaint Priority <span className="text-red-500">*</span>
        </Label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as ComplaintPriority);
            setTouched((prev) => ({ ...prev, priority: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, priority: true }))}
          className="mt-2 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
          disabled={isSubmitting}
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {getFieldErrors('priority').map((error, idx) => (
          <p key={idx} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        ))}
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Select the complaint priority this rule applies to
        </p>
      </div>

      {/* Time Threshold */}
      <div>
        <Label htmlFor="hoursThreshold">
          Time Threshold (hours) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="hoursThreshold"
          type="number"
          min="1"
          max="8760"
          value={hoursThreshold}
          onChange={(e) => {
            setHoursThreshold(e.target.value);
            setTouched((prev) => ({ ...prev, hours_threshold: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, hours_threshold: true }))}
          placeholder="Enter hours (e.g., 24)"
          disabled={isSubmitting}
          className="mt-2"
        />
        {getFieldErrors('hours_threshold').map((error, idx) => (
          <p key={idx} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        ))}
        {getFieldWarnings('hours_threshold').map((warning, idx) => (
          <p
            key={idx}
            className="mt-1 flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400"
          >
            <AlertTriangle className="h-3 w-3" />
            {warning.message}
          </p>
        ))}
        {hoursThreshold &&
          !isNaN(parseInt(hoursThreshold, 10)) &&
          parseInt(hoursThreshold, 10) > 0 && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Complaints will escalate after:{' '}
              <span className="font-medium">{formatThreshold(parseInt(hoursThreshold, 10))}</span>
            </p>
          )}

        {/* Quick Presets */}
        <div className="mt-3">
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Quick Presets:
          </p>
          <div className="flex flex-wrap gap-2">
            {TIME_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset.value)}
                disabled={isSubmitting}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Escalate To */}
      <div>
        <Label htmlFor="escalateTo">
          Escalate To <span className="text-red-500">*</span>
        </Label>
        <select
          id="escalateTo"
          value={escalateTo}
          onChange={(e) => {
            setEscalateTo(e.target.value);
            setTouched((prev) => ({ ...prev, escalate_to: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, escalate_to: true }))}
          className="mt-2 flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
          disabled={isSubmitting}
        >
          <option value="">Select a user...</option>
          {eligibleUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name} ({user.role}) - {user.email}
            </option>
          ))}
        </select>
        {getFieldErrors('escalate_to').map((error, idx) => (
          <p key={idx} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        ))}
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Select the lecturer or admin who will receive escalated complaints
        </p>
      </div>

      {/* Existing Rule Warning */}
      {(() => {
        const conflictingRule = existingRules.find(
          (existingRule) =>
            existingRule.is_active &&
            existingRule.category === category &&
            existingRule.priority === priority &&
            existingRule.id !== rule?.id
        );

        if (conflictingRule && isActive) {
          const conflictUser = users.find((u) => u.id === conflictingRule.escalate_to);
          return (
            <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> An active rule already exists for this category and
                priority combination. It escalates to{' '}
                <strong>{conflictUser?.full_name || 'Unknown User'}</strong> after{' '}
                <strong>{formatThreshold(conflictingRule.hours_threshold)}</strong>.
                {isActive &&
                  ' You must deactivate this rule or deactivate the existing rule first.'}
              </AlertDescription>
            </Alert>
          );
        }
        return null;
      })()}

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-zinc-300"
        />
        <Label htmlFor="isActive" className="cursor-pointer font-normal">
          Rule is active
        </Label>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {isActive
          ? 'This rule will be applied to matching complaints'
          : 'This rule will not be applied until activated'}
      </p>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
}
