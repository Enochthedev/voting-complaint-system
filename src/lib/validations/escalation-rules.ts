/**
 * Validation utilities for escalation rules
 *
 * This module provides validation functions to ensure escalation rule configurations
 * meet all business requirements and database constraints.
 */

import type {
  EscalationRule,
  ComplaintCategory,
  ComplaintPriority,
  User,
} from '@/types/database.types';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a complete escalation rule configuration
 *
 * @param ruleData - The escalation rule data to validate
 * @param existingRules - Array of existing rules to check for conflicts
 * @param users - Array of users to validate escalate_to field
 * @param currentRuleId - ID of the rule being edited (to exclude from duplicate checks)
 * @returns ValidationResult with isValid flag and array of errors
 */
export function validateEscalationRule(
  ruleData: Partial<EscalationRule>,
  existingRules: EscalationRule[] = [],
  users: User[] = [],
  currentRuleId?: string
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate category
  if (!ruleData.category) {
    errors.push({
      field: 'category',
      message: 'Category is required',
      severity: 'error',
    });
  }

  // Validate priority
  if (!ruleData.priority) {
    errors.push({
      field: 'priority',
      message: 'Priority is required',
      severity: 'error',
    });
  }

  // Validate hours_threshold
  const hoursValidation = validateHoursThreshold(ruleData.hours_threshold, ruleData.priority);
  errors.push(...hoursValidation);

  // Validate escalate_to
  const escalateToValidation = validateEscalateTo(ruleData.escalate_to, users);
  errors.push(...escalateToValidation);

  // Validate uniqueness (only one active rule per category/priority combination)
  if (ruleData.is_active && ruleData.category && ruleData.priority) {
    const duplicateValidation = validateUniqueness(
      ruleData.category,
      ruleData.priority,
      existingRules,
      currentRuleId
    );
    errors.push(...duplicateValidation);
  }

  // Check for logical consistency
  const consistencyValidation = validateLogicalConsistency(ruleData);
  errors.push(...consistencyValidation);

  // Only consider errors (not warnings) for isValid flag
  const hasErrors = errors.some((error) => error.severity === 'error');

  return {
    isValid: !hasErrors,
    errors,
  };
}

/**
 * Validates the hours_threshold field
 *
 * Requirements:
 * - Must be a positive integer
 * - Must be at least 1 hour
 * - Must not exceed 8760 hours (1 year)
 * - Should be reasonable for the priority level (warnings)
 */
export function validateHoursThreshold(
  hours: number | undefined,
  priority?: ComplaintPriority
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (hours === undefined || hours === null) {
    errors.push({
      field: 'hours_threshold',
      message: 'Time threshold is required',
      severity: 'error',
    });
    return errors;
  }

  if (typeof hours !== 'number' || isNaN(hours)) {
    errors.push({
      field: 'hours_threshold',
      message: 'Time threshold must be a valid number',
      severity: 'error',
    });
    return errors;
  }

  if (hours <= 0) {
    errors.push({
      field: 'hours_threshold',
      message: 'Time threshold must be greater than 0',
      severity: 'error',
    });
    return errors;
  }

  if (!Number.isInteger(hours)) {
    errors.push({
      field: 'hours_threshold',
      message: 'Time threshold must be a whole number',
      severity: 'error',
    });
    return errors;
  }

  if (hours > 8760) {
    errors.push({
      field: 'hours_threshold',
      message: 'Time threshold cannot exceed 1 year (8760 hours)',
      severity: 'error',
    });
    return errors;
  }

  // Priority-based warnings for best practices
  if (priority === 'critical' && hours > 24) {
    errors.push({
      field: 'hours_threshold',
      message:
        'Critical priority complaints typically require faster escalation (recommended: ≤24 hours)',
      severity: 'warning',
    });
  } else if (priority === 'high' && hours > 72) {
    errors.push({
      field: 'hours_threshold',
      message:
        'High priority complaints typically require faster escalation (recommended: ≤72 hours)',
      severity: 'warning',
    });
  } else if (priority === 'medium' && hours > 168) {
    errors.push({
      field: 'hours_threshold',
      message:
        'Medium priority complaints typically require escalation within 1 week (recommended: ≤168 hours)',
      severity: 'warning',
    });
  }

  return errors;
}

/**
 * Validates the escalate_to field
 *
 * Requirements:
 * - Must be provided
 * - Must reference an existing user
 * - User must have lecturer or admin role
 */
export function validateEscalateTo(
  escalateToId: string | undefined,
  users: User[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!escalateToId) {
    errors.push({
      field: 'escalate_to',
      message: 'Please select a user to escalate to',
      severity: 'error',
    });
    return errors;
  }

  const selectedUser = users.find((u) => u.id === escalateToId);

  if (!selectedUser) {
    errors.push({
      field: 'escalate_to',
      message: 'Selected user does not exist',
      severity: 'error',
    });
    return errors;
  }

  if (selectedUser.role !== 'lecturer' && selectedUser.role !== 'admin') {
    errors.push({
      field: 'escalate_to',
      message: 'Complaints can only be escalated to lecturers or admins',
      severity: 'error',
    });
    return errors;
  }

  return errors;
}

/**
 * Validates uniqueness constraint
 *
 * Database constraint: Only one active rule can exist per category/priority combination
 * This prevents conflicts in the auto-escalation logic
 */
export function validateUniqueness(
  category: ComplaintCategory,
  priority: ComplaintPriority,
  existingRules: EscalationRule[],
  currentRuleId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  const duplicateRule = existingRules.find(
    (rule) =>
      rule.is_active &&
      rule.category === category &&
      rule.priority === priority &&
      rule.id !== currentRuleId // Exclude current rule when editing
  );

  if (duplicateRule) {
    errors.push({
      field: 'duplicate',
      message: `An active escalation rule already exists for this category and priority combination. Please deactivate the existing rule first or choose a different category/priority combination.`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validates logical consistency of the rule configuration
 *
 * Checks for potential issues that might not violate constraints
 * but could indicate configuration problems
 */
export function validateLogicalConsistency(ruleData: Partial<EscalationRule>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if rule is inactive - this is valid but might be unintentional
  if (ruleData.is_active === false) {
    errors.push({
      field: 'is_active',
      message: 'This rule is inactive and will not be applied to complaints until activated',
      severity: 'warning',
    });
  }

  // Check for very short thresholds that might cause too many escalations
  if (ruleData.hours_threshold && ruleData.hours_threshold < 2) {
    errors.push({
      field: 'hours_threshold',
      message: 'Very short escalation thresholds (< 2 hours) may result in premature escalations',
      severity: 'warning',
    });
  }

  // Check for very long thresholds that might defeat the purpose
  if (ruleData.hours_threshold && ruleData.hours_threshold > 720 && ruleData.priority !== 'low') {
    errors.push({
      field: 'hours_threshold',
      message:
        'Very long escalation thresholds (> 30 days) may not be effective for non-low priority complaints',
      severity: 'warning',
    });
  }

  return errors;
}

/**
 * Helper function to format hours into a human-readable string
 */
export function formatThreshold(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
}

/**
 * Helper function to get category label
 */
export function getCategoryLabel(category: ComplaintCategory): string {
  const labels: Record<ComplaintCategory, string> = {
    academic: 'Academic',
    facilities: 'Facilities',
    harassment: 'Harassment',
    course_content: 'Course Content',
    administrative: 'Administrative',
    other: 'Other',
  };
  return labels[category] || category;
}

/**
 * Helper function to get priority label
 */
export function getPriorityLabel(priority: ComplaintPriority): string {
  const labels: Record<ComplaintPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return labels[priority] || priority;
}
