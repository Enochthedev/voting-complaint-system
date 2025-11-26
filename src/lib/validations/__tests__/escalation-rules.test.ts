/**
 * Tests for escalation rule validation
 */

import {
  validateEscalationRule,
  validateHoursThreshold,
  validateEscalateTo,
  validateUniqueness,
  validateLogicalConsistency,
} from '../escalation-rules';
import type { EscalationRule, User } from '@/types/database.types';

describe('Escalation Rule Validation', () => {
  const mockUsers: User[] = [
    {
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'admin',
      full_name: 'Admin User',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'lecturer-1',
      email: 'lecturer@test.com',
      role: 'lecturer',
      full_name: 'Lecturer User',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'student-1',
      email: 'student@test.com',
      role: 'student',
      full_name: 'Student User',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockExistingRules: EscalationRule[] = [
    {
      id: 'rule-1',
      category: 'academic',
      priority: 'high',
      hours_threshold: 24,
      escalate_to: 'admin-1',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  describe('validateHoursThreshold', () => {
    it('should accept valid hours threshold', () => {
      const errors = validateHoursThreshold(24);
      expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0);
    });

    it('should reject undefined hours', () => {
      const errors = validateHoursThreshold(undefined);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });

    it('should reject zero hours', () => {
      const errors = validateHoursThreshold(0);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });

    it('should reject negative hours', () => {
      const errors = validateHoursThreshold(-5);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });

    it('should reject hours exceeding 1 year', () => {
      const errors = validateHoursThreshold(9000);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });

    it('should warn for critical priority with long threshold', () => {
      const errors = validateHoursThreshold(48, 'critical');
      expect(errors.some((e) => e.severity === 'warning')).toBe(true);
    });

    it('should warn for high priority with long threshold', () => {
      const errors = validateHoursThreshold(100, 'high');
      expect(errors.some((e) => e.severity === 'warning')).toBe(true);
    });
  });

  describe('validateEscalateTo', () => {
    it('should accept valid admin user', () => {
      const errors = validateEscalateTo('admin-1', mockUsers);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid lecturer user', () => {
      const errors = validateEscalateTo('lecturer-1', mockUsers);
      expect(errors).toHaveLength(0);
    });

    it('should reject undefined user', () => {
      const errors = validateEscalateTo(undefined, mockUsers);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });

    it('should reject non-existent user', () => {
      const errors = validateEscalateTo('non-existent', mockUsers);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });

    it('should reject student user', () => {
      const errors = validateEscalateTo('student-1', mockUsers);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });
  });

  describe('validateUniqueness', () => {
    it('should accept unique category/priority combination', () => {
      const errors = validateUniqueness('facilities', 'high', mockExistingRules);
      expect(errors).toHaveLength(0);
    });

    it('should reject duplicate active rule', () => {
      const errors = validateUniqueness('academic', 'high', mockExistingRules);
      expect(errors.some((e) => e.severity === 'error')).toBe(true);
    });

    it('should allow editing existing rule', () => {
      const errors = validateUniqueness('academic', 'high', mockExistingRules, 'rule-1');
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateLogicalConsistency', () => {
    it('should warn for inactive rules', () => {
      const errors = validateLogicalConsistency({ is_active: false });
      expect(errors.some((e) => e.severity === 'warning')).toBe(true);
    });

    it('should warn for very short thresholds', () => {
      const errors = validateLogicalConsistency({ hours_threshold: 1 });
      expect(errors.some((e) => e.severity === 'warning')).toBe(true);
    });

    it('should warn for very long thresholds on high priority', () => {
      const errors = validateLogicalConsistency({
        hours_threshold: 800,
        priority: 'high',
      });
      expect(errors.some((e) => e.severity === 'warning')).toBe(true);
    });
  });

  describe('validateEscalationRule', () => {
    it('should validate complete valid rule', () => {
      const ruleData: Partial<EscalationRule> = {
        category: 'facilities',
        priority: 'medium',
        hours_threshold: 48,
        escalate_to: 'admin-1',
        is_active: true,
      };

      const result = validateEscalationRule(ruleData, mockExistingRules, mockUsers);
      expect(result.isValid).toBe(true);
      expect(result.errors.filter((e) => e.severity === 'error')).toHaveLength(0);
    });

    it('should reject rule with missing required fields', () => {
      const ruleData: Partial<EscalationRule> = {
        category: 'facilities',
        // Missing priority, hours_threshold, escalate_to
      };

      const result = validateEscalationRule(ruleData, mockExistingRules, mockUsers);
      expect(result.isValid).toBe(false);
      expect(result.errors.filter((e) => e.severity === 'error').length).toBeGreaterThan(0);
    });

    it('should reject duplicate active rule', () => {
      const ruleData: Partial<EscalationRule> = {
        category: 'academic',
        priority: 'high',
        hours_threshold: 24,
        escalate_to: 'admin-1',
        is_active: true,
      };

      const result = validateEscalationRule(ruleData, mockExistingRules, mockUsers);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'duplicate')).toBe(true);
    });

    it('should accept rule with warnings but no errors', () => {
      const ruleData: Partial<EscalationRule> = {
        category: 'facilities',
        priority: 'critical',
        hours_threshold: 48, // Will trigger warning for critical priority
        escalate_to: 'admin-1',
        is_active: true,
      };

      const result = validateEscalationRule(ruleData, mockExistingRules, mockUsers);
      expect(result.isValid).toBe(true); // Valid despite warnings
      expect(result.errors.some((e) => e.severity === 'warning')).toBe(true);
    });
  });
});
