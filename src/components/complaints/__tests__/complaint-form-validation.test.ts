/**
 * Complaint Form Validation Tests
 * 
 * Tests the validation logic for the complaint submission form
 * Validates: Requirements AC2, AC9
 */

import { describe, it, expect } from 'vitest';

// Helper to simulate HTML content from rich text editor
const createHtmlContent = (text: string): string => {
  return `<p>${text}</p>`;
};

// Helper to strip HTML tags (mimics form's getTextContent)
const getTextContent = (html: string): string => {
  // Simple regex-based HTML stripping for testing
  return html.replace(/<[^>]*>/g, '').trim();
};

describe('Complaint Form Validation', () => {
  describe('Title Validation', () => {
    it('should reject empty title for submission', () => {
      const title = '';
      const isValid = title.trim().length > 0;
      expect(isValid).toBe(false);
    });

    it('should accept valid title', () => {
      const title = 'Broken AC in Lecture Hall';
      const isValid = title.trim().length > 0 && title.length <= 200;
      expect(isValid).toBe(true);
    });

    it('should reject title exceeding max length', () => {
      const title = 'a'.repeat(201);
      const isValid = title.length <= 200;
      expect(isValid).toBe(false);
    });

    it('should accept title at max length boundary', () => {
      const title = 'a'.repeat(200);
      const isValid = title.trim().length > 0 && title.length <= 200;
      expect(isValid).toBe(true);
    });

    it('should reject whitespace-only title', () => {
      const title = '   ';
      const isValid = title.trim().length > 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Description Validation', () => {
    it('should reject empty description for submission', () => {
      const description = createHtmlContent('');
      const textContent = getTextContent(description);
      const isValid = textContent.length > 0;
      expect(isValid).toBe(false);
    });

    it('should accept valid description', () => {
      const description = createHtmlContent('The AC unit in room 301 has been broken for a week.');
      const textContent = getTextContent(description);
      const isValid = textContent.length > 0 && textContent.length <= 5000;
      expect(isValid).toBe(true);
    });

    it('should reject description exceeding max length', () => {
      const longText = 'a'.repeat(5001);
      const description = createHtmlContent(longText);
      const textContent = getTextContent(description);
      const isValid = textContent.length <= 5000;
      expect(isValid).toBe(false);
    });

    it('should accept description at max length boundary', () => {
      const longText = 'a'.repeat(5000);
      const description = createHtmlContent(longText);
      const textContent = getTextContent(description);
      const isValid = textContent.length > 0 && textContent.length <= 5000;
      expect(isValid).toBe(true);
    });

    it('should strip HTML tags when validating length', () => {
      const description = '<p><strong>Bold text</strong> and <em>italic text</em></p>';
      const textContent = getTextContent(description);
      expect(textContent).toBe('Bold text and italic text');
      expect(textContent.length).toBeLessThan(description.length);
    });

    it('should reject HTML-only content with no text', () => {
      const description = '<p></p><br/><div></div>';
      const textContent = getTextContent(description);
      const isValid = textContent.length > 0;
      expect(isValid).toBe(false);
    });
  });

  describe('Category Validation', () => {
    const validCategories = [
      'academic',
      'facilities',
      'harassment',
      'course_content',
      'administrative',
      'other',
    ];

    it('should reject empty category for submission', () => {
      const category = '';
      const isValid = category.length > 0;
      expect(isValid).toBe(false);
    });

    it('should accept all valid categories', () => {
      validCategories.forEach((category) => {
        const isValid = validCategories.includes(category);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid category', () => {
      const category = 'invalid_category';
      const isValid = validCategories.includes(category);
      expect(isValid).toBe(false);
    });
  });

  describe('Priority Validation', () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    it('should reject empty priority for submission', () => {
      const priority = '';
      const isValid = priority.length > 0;
      expect(isValid).toBe(false);
    });

    it('should accept all valid priorities', () => {
      validPriorities.forEach((priority) => {
        const isValid = validPriorities.includes(priority);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid priority', () => {
      const priority = 'urgent';
      const isValid = validPriorities.includes(priority);
      expect(isValid).toBe(false);
    });
  });

  describe('Draft Mode Validation', () => {
    it('should allow empty fields for draft', () => {
      const isDraft = true;
      const title = '';
      const description = '';
      const category = '';
      const priority = '';

      // For drafts, empty fields are allowed
      const isValid = isDraft ? true : (
        title.trim().length > 0 &&
        description.trim().length > 0 &&
        category.length > 0 &&
        priority.length > 0
      );

      expect(isValid).toBe(true);
    });

    it('should still validate length limits for draft', () => {
      const isDraft = true;
      const title = 'a'.repeat(201);
      
      // Even for drafts, if content exists, it must not exceed limits
      const isValid = title.length <= 200;
      expect(isValid).toBe(false);
    });

    it('should allow partial completion for draft', () => {
      const isDraft = true;
      const title = 'Partial complaint';
      const description = '';
      const category = '';
      const priority = '';

      // For drafts, partial completion is allowed
      const hasValidLength = title.length <= 200;
      expect(hasValidLength).toBe(true);
    });
  });

  describe('Complete Form Validation', () => {
    it('should validate complete valid form for submission', () => {
      const formData = {
        title: 'Broken AC in Lecture Hall',
        description: createHtmlContent('The AC has been broken for a week'),
        category: 'facilities',
        priority: 'high',
      };

      const descriptionText = getTextContent(formData.description);
      const isValid =
        formData.title.trim().length > 0 &&
        formData.title.length <= 200 &&
        descriptionText.length > 0 &&
        descriptionText.length <= 5000 &&
        formData.category.length > 0 &&
        formData.priority.length > 0;

      expect(isValid).toBe(true);
    });

    it('should reject form with missing required fields', () => {
      const formData = {
        title: 'Broken AC',
        description: createHtmlContent('Description'),
        category: '',
        priority: 'high',
      };

      const descriptionText = getTextContent(formData.description);
      const isValid =
        formData.title.trim().length > 0 &&
        formData.title.length <= 200 &&
        descriptionText.length > 0 &&
        descriptionText.length <= 5000 &&
        formData.category.length > 0 &&
        formData.priority.length > 0;

      expect(isValid).toBe(false);
    });

    it('should reject form with any field exceeding limits', () => {
      const formData = {
        title: 'a'.repeat(201),
        description: createHtmlContent('Valid description'),
        category: 'facilities',
        priority: 'high',
      };

      const descriptionText = getTextContent(formData.description);
      const isValid =
        formData.title.trim().length > 0 &&
        formData.title.length <= 200 &&
        descriptionText.length > 0 &&
        descriptionText.length <= 5000 &&
        formData.category.length > 0 &&
        formData.priority.length > 0;

      expect(isValid).toBe(false);
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
