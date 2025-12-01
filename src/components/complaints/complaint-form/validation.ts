import type { ComplaintFormData, FormErrors } from './types';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from './constants';
import { sanitizeText, sanitizeHtml } from '@/lib/sanitize';

/**
 * Helper function to strip HTML tags and get text content
 */
export function getTextContent(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: simple HTML stripping
    return html.replace(/<[^>]*>/g, '');
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Sanitize form data before submission
 * Removes potentially dangerous content while preserving formatting
 */
export function sanitizeFormData(formData: ComplaintFormData): ComplaintFormData {
  return {
    ...formData,
    title: sanitizeText(formData.title),
    description: sanitizeHtml(formData.description),
    tags: formData.tags.map((tag) => sanitizeText(tag)),
  };
}

/**
 * Validate form data
 * @param formData - The form data to validate
 * @param isDraft - Whether this is a draft submission (less strict validation)
 * @returns Object with validation errors (empty if valid)
 */
export function validateForm(formData: ComplaintFormData, isDraft: boolean = false): FormErrors {
  const errors: FormErrors = {};

  // For drafts, only validate if fields have content
  if (!isDraft) {
    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
    }

    // Description validation - check text content, not HTML
    const descriptionText = getTextContent(formData.description).trim();
    if (!descriptionText) {
      errors.description = 'Description is required';
    } else if (descriptionText.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
    }

    // Category validation
    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    // Priority validation
    if (!formData.priority) {
      errors.priority = 'Please select a priority level';
    }
  } else {
    // For drafts, validate length if content exists
    if (formData.title && formData.title.length > MAX_TITLE_LENGTH) {
      errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
    }
    const descriptionText = getTextContent(formData.description);
    if (descriptionText && descriptionText.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
    }
  }

  return errors;
}
