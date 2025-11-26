import type { ComplaintTemplate, ComplaintFormData } from './types';

/**
 * Get suggested tags for a template based on category and title
 */
export function getSuggestedTagsForTemplate(template: ComplaintTemplate): string[] {
  const tags: string[] = [];

  // Add category-based tag
  const categoryTag = template.category.replace('_', '-');
  tags.push(categoryTag);

  // Add tags based on template title keywords
  const titleLower = template.title.toLowerCase();
  if (titleLower.includes('equipment') || titleLower.includes('lab')) {
    tags.push('equipment');
  }
  if (titleLower.includes('grading') || titleLower.includes('assignment')) {
    tags.push('grading');
  }
  if (titleLower.includes('classroom') || titleLower.includes('room')) {
    tags.push('classroom');
  }
  if (titleLower.includes('ac') || titleLower.includes('air conditioning')) {
    tags.push('facilities');
  }
  if (titleLower.includes('access') || titleLower.includes('material')) {
    tags.push('course-material');
  }
  if (titleLower.includes('parking')) {
    tags.push('parking');
  }

  // Remove duplicates and return
  return [...new Set(tags)];
}

/**
 * Build description from template fields
 */
export function buildDescriptionFromTemplate(template: ComplaintTemplate): string {
  // Start with template description as header
  let description = `<p><strong>${template.description}</strong></p><br/>`;

  // Add structured fields for user to fill in
  if (template.fields && typeof template.fields === 'object') {
    description += '<p><strong>Please provide the following information:</strong></p><br/>';

    Object.entries(template.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
      const label = fieldConfig.label || fieldName;
      const placeholder = fieldConfig.placeholder || '';
      const required = fieldConfig.required ? ' (Required)' : ' (Optional)';

      // Create a structured field entry
      description += `<p><strong>${label}${required}:</strong></p>`;
      description += `<p><em>${placeholder || 'Enter information here...'}</em></p><br/>`;
    });
  }

  return description;
}

/**
 * Apply template to form data
 */
export function applyTemplateToFormData(
  template: ComplaintTemplate,
  currentFormData: ComplaintFormData
): ComplaintFormData {
  return {
    ...currentFormData,
    title: template.title,
    category: template.category,
    priority: template.suggested_priority,
    description: buildDescriptionFromTemplate(template),
    tags: getSuggestedTagsForTemplate(template),
  };
}
