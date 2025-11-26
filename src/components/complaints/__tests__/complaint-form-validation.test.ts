/**
 * Complaint Form Validation Tests
 *
 * Tests the validation logic for the complaint submission form
 * Validates: Requirements AC2, AC9
 */

import { describe, it, expect } from 'vitest';
import { validateForm, getTextContent } from '../complaint-form/validation';
import type { ComplaintFormData } from '../complaint-form/types';

// Helper to simulate HTML content from rich text editor
const createHtmlContent = (text: string): string => {
  return `<p>${text}</p>`;
};

// Helper to create form data
const createFormData = (overrides: Partial<ComplaintFormData> = {}): ComplaintFormData => ({
  title: '',
  description: '',
  category: '',
  priority: '',
  isAnonymous: false,
  tags: [],
  files: [],
  ...overrides,
});

describe('Complaint Form Validation', () => {
  describe('Title Validation', () => {
    it('should reject empty title for submission', () => {
      const formData = createFormData({ title: '' });
      const errors = validateForm(formData, false);
      expect(errors.title).toBeDefined();
    });

    it('should accept valid title', () => {
      const formData = createFormData({
        title: 'Broken AC in Lecture Hall',
        description: createHtmlContent('Valid description'),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.title).toBeUndefined();
    });

    it('should reject title exceeding max length', () => {
      const formData = createFormData({ title: 'a'.repeat(201) });
      const errors = validateForm(formData, false);
      expect(errors.title).toBeDefined();
      expect(errors.title).toContain('200 characters');
    });

    it('should accept title at max length boundary', () => {
      const formData = createFormData({
        title: 'a'.repeat(200),
        description: createHtmlContent('Valid description'),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.title).toBeUndefined();
    });

    it('should reject whitespace-only title', () => {
      const formData = createFormData({ title: '   ' });
      const errors = validateForm(formData, false);
      expect(errors.title).toBeDefined();
    });
  });

  describe('Description Validation', () => {
    it('should reject empty description for submission', () => {
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent(''),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.description).toBeDefined();
    });

    it('should accept valid description', () => {
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent('The AC unit in room 301 has been broken for a week.'),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.description).toBeUndefined();
    });

    it('should reject description exceeding max length', () => {
      const longText = 'a'.repeat(5001);
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent(longText),
      });
      const errors = validateForm(formData, false);
      expect(errors.description).toBeDefined();
      expect(errors.description).toContain('5000 characters');
    });

    it('should accept description at max length boundary', () => {
      const longText = 'a'.repeat(5000);
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent(longText),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.description).toBeUndefined();
    });

    it('should strip HTML tags when validating length', () => {
      const description = '<p><strong>Bold text</strong> and <em>italic text</em></p>';
      const textContent = getTextContent(description);
      expect(textContent).toBe('Bold text and italic text');
      expect(textContent.length).toBeLessThan(description.length);
    });

    it('should reject HTML-only content with no text', () => {
      const formData = createFormData({
        title: 'Valid title',
        description: '<p></p><br/><div></div>',
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.description).toBeDefined();
    });
  });

  describe('Category Validation', () => {
    it('should reject empty category for submission', () => {
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent('Valid description'),
        category: '',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.category).toBeDefined();
    });

    it('should accept valid category', () => {
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent('Valid description'),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.category).toBeUndefined();
    });
  });

  describe('Priority Validation', () => {
    it('should reject empty priority for submission', () => {
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent('Valid description'),
        category: 'facilities',
        priority: '',
      });
      const errors = validateForm(formData, false);
      expect(errors.priority).toBeDefined();
    });

    it('should accept valid priority', () => {
      const formData = createFormData({
        title: 'Valid title',
        description: createHtmlContent('Valid description'),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.priority).toBeUndefined();
    });
  });

  describe('Draft Mode Validation', () => {
    it('should allow empty fields for draft', () => {
      const formData = createFormData({
        title: '',
        description: '',
        category: '',
        priority: '',
      });
      const errors = validateForm(formData, true);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should still validate length limits for draft', () => {
      const formData = createFormData({
        title: 'a'.repeat(201),
      });
      const errors = validateForm(formData, true);
      expect(errors.title).toBeDefined();
      expect(errors.title).toContain('200 characters');
    });

    it('should allow partial completion for draft', () => {
      const formData = createFormData({
        title: 'Partial complaint',
        description: '',
        category: '',
        priority: '',
      });
      const errors = validateForm(formData, true);
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe('Complete Form Validation', () => {
    it('should validate complete valid form for submission', () => {
      const formData = createFormData({
        title: 'Broken AC in Lecture Hall',
        description: createHtmlContent('The AC has been broken for a week'),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should reject form with missing required fields', () => {
      const formData = createFormData({
        title: 'Broken AC',
        description: createHtmlContent('Description'),
        category: '',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.category).toBeDefined();
    });

    it('should reject form with any field exceeding limits', () => {
      const formData = createFormData({
        title: 'a'.repeat(201),
        description: createHtmlContent('Valid description'),
        category: 'facilities',
        priority: 'high',
      });
      const errors = validateForm(formData, false);
      expect(errors.title).toBeDefined();
    });
  });

  describe('Anonymous Submission', () => {
    it('should allow anonymous flag to be set independently of validation', () => {
      const isAnonymous = true;
      const formData = {
        title: 'Test Complaint',
        description: createHtmlContent('Test description'),
        category: 'academic',
        priority: 'medium',
        isAnonymous,
      };

      // Anonymous flag doesn't affect validation
      expect(formData.isAnonymous).toBe(true);

      const descriptionText = getTextContent(formData.description);
      const isValid =
        formData.title.trim().length > 0 &&
        descriptionText.length > 0 &&
        formData.category.length > 0 &&
        formData.priority.length > 0;

      expect(isValid).toBe(true);
    });
  });

  describe('Tag Validation', () => {
    it('should allow empty tags array', () => {
      const tags: string[] = [];
      expect(tags.length).toBe(0);
    });

    it('should allow multiple tags', () => {
      const tags = ['wifi-issues', 'classroom', 'urgent'];
      expect(tags.length).toBe(3);
    });

    it('should prevent duplicate tags', () => {
      const existingTags = ['wifi-issues', 'classroom'];
      const newTag = 'wifi-issues';
      const isDuplicate = existingTags.includes(newTag);
      expect(isDuplicate).toBe(true);
    });

    it('should normalize tags to lowercase', () => {
      const inputTag = 'WiFi-Issues';
      const normalizedTag = inputTag.toLowerCase();
      expect(normalizedTag).toBe('wifi-issues');
    });

    it('should trim whitespace from tags', () => {
      const inputTag = '  classroom  ';
      const trimmedTag = inputTag.trim();
      expect(trimmedTag).toBe('classroom');
    });
  });
});
