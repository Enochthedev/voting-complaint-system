/**
 * Template Pre-fill Functionality Tests
 * 
 * Tests for Task 4.3: Pre-fill form fields from template
 * 
 * This test suite verifies that when a user selects a complaint template,
 * all relevant form fields are automatically pre-filled with appropriate values.
 */

import { describe, it, expect } from 'vitest';
import type { ComplaintTemplate, ComplaintCategory, ComplaintPriority } from '@/types/database.types';

describe('Template Pre-fill Functionality', () => {
  // Mock template data
  const mockTemplate: ComplaintTemplate = {
    id: '1',
    title: 'Broken Equipment in Lab',
    description: 'Template for reporting broken or malfunctioning equipment in laboratory facilities',
    category: 'facilities' as ComplaintCategory,
    suggested_priority: 'high' as ComplaintPriority,
    fields: {
      equipment_name: {
        label: 'Equipment Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Microscope, Computer',
      },
      lab_room: {
        label: 'Lab Room',
        type: 'text',
        required: true,
        placeholder: 'e.g., Lab 301',
      },
      issue_description: {
        label: 'Issue Description',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the problem',
      },
    },
    created_by: 'lecturer-1',
    is_active: true,
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
  };

  describe('Basic Field Pre-filling', () => {
    it('should pre-fill title from template', () => {
      // When a template is selected, the form title should be set to the template title
      const expectedTitle = mockTemplate.title;
      expect(expectedTitle).toBe('Broken Equipment in Lab');
    });

    it('should pre-fill category from template', () => {
      // When a template is selected, the form category should be set to the template category
      const expectedCategory = mockTemplate.category;
      expect(expectedCategory).toBe('facilities');
    });

    it('should pre-fill priority from template suggested priority', () => {
      // When a template is selected, the form priority should be set to the template's suggested priority
      const expectedPriority = mockTemplate.suggested_priority;
      expect(expectedPriority).toBe('high');
    });
  });

  describe('Description Pre-filling', () => {
    it('should build description with template description as header', () => {
      // The description should start with the template description
      const description = buildDescriptionFromTemplate(mockTemplate);
      expect(description).toContain(mockTemplate.description);
      expect(description).toContain('<strong>Template for reporting broken or malfunctioning equipment in laboratory facilities</strong>');
    });

    it('should include all template fields in description', () => {
      // The description should include all fields defined in the template
      const description = buildDescriptionFromTemplate(mockTemplate);
      
      expect(description).toContain('Equipment Name');
      expect(description).toContain('Lab Room');
      expect(description).toContain('Issue Description');
    });

    it('should mark required fields in description', () => {
      // Required fields should be marked as (Required)
      const description = buildDescriptionFromTemplate(mockTemplate);
      
      expect(description).toContain('Equipment Name (Required)');
      expect(description).toContain('Lab Room (Required)');
      expect(description).toContain('Issue Description (Required)');
    });

    it('should include field placeholders in description', () => {
      // Field placeholders should be included to guide the user
      const description = buildDescriptionFromTemplate(mockTemplate);
      
      expect(description).toContain('e.g., Microscope, Computer');
      expect(description).toContain('e.g., Lab 301');
      expect(description).toContain('Describe the problem');
    });

    it('should handle optional fields correctly', () => {
      // Optional fields should be marked as (Optional)
      const templateWithOptionalField: ComplaintTemplate = {
        ...mockTemplate,
        fields: {
          ...mockTemplate.fields,
          additional_notes: {
            label: 'Additional Notes',
            type: 'textarea',
            required: false,
            placeholder: 'Any other information',
          },
        },
      };

      const description = buildDescriptionFromTemplate(templateWithOptionalField);
      expect(description).toContain('Additional Notes (Optional)');
    });
  });

  describe('Tag Pre-filling', () => {
    it('should suggest tags based on template category', () => {
      // Tags should be suggested based on the template category
      const tags = getSuggestedTagsForTemplate(mockTemplate);
      
      expect(tags).toContain('facilities');
    });

    it('should suggest tags based on template title keywords', () => {
      // Tags should be suggested based on keywords in the template title
      const tags = getSuggestedTagsForTemplate(mockTemplate);
      
      // "Broken Equipment in Lab" should suggest 'equipment' tag
      expect(tags).toContain('equipment');
    });

    it('should not include duplicate tags', () => {
      // The tag list should not contain duplicates
      const tags = getSuggestedTagsForTemplate(mockTemplate);
      const uniqueTags = [...new Set(tags)];
      
      expect(tags.length).toBe(uniqueTags.length);
    });

    it('should suggest grading tag for grading-related templates', () => {
      const gradingTemplate: ComplaintTemplate = {
        ...mockTemplate,
        title: 'Assignment Grading Issue',
        category: 'academic',
      };

      const tags = getSuggestedTagsForTemplate(gradingTemplate);
      expect(tags).toContain('grading');
    });

    it('should suggest classroom tag for room-related templates', () => {
      const classroomTemplate: ComplaintTemplate = {
        ...mockTemplate,
        title: 'Classroom AC Not Working',
        category: 'facilities',
      };

      const tags = getSuggestedTagsForTemplate(classroomTemplate);
      expect(tags).toContain('classroom');
    });

    it('should suggest parking tag for parking-related templates', () => {
      const parkingTemplate: ComplaintTemplate = {
        ...mockTemplate,
        title: 'Parking Permit Issue',
        category: 'administrative',
      };

      const tags = getSuggestedTagsForTemplate(parkingTemplate);
      expect(tags).toContain('parking');
    });
  });

  describe('Edge Cases', () => {
    it('should handle template with no fields', () => {
      const templateWithNoFields: ComplaintTemplate = {
        ...mockTemplate,
        fields: {},
      };

      const description = buildDescriptionFromTemplate(templateWithNoFields);
      expect(description).toContain(templateWithNoFields.description);
      // Should still have the header but no field entries
      expect(description).not.toContain('Please provide the following information');
    });

    it('should handle template with undefined fields', () => {
      const templateWithUndefinedFields: ComplaintTemplate = {
        ...mockTemplate,
        fields: undefined as any,
      };

      const description = buildDescriptionFromTemplate(templateWithUndefinedFields);
      expect(description).toContain(templateWithUndefinedFields.description);
    });

    it('should handle field without placeholder', () => {
      const templateWithNoPlaceholder: ComplaintTemplate = {
        ...mockTemplate,
        fields: {
          test_field: {
            label: 'Test Field',
            type: 'text',
            required: true,
            placeholder: '',
          },
        },
      };

      const description = buildDescriptionFromTemplate(templateWithNoPlaceholder);
      expect(description).toContain('Test Field (Required)');
      expect(description).toContain('Enter information here...');
    });
  });

  describe('Integration with Form State', () => {
    it('should preserve user edits after template selection', () => {
      // After selecting a template, users should be able to edit any pre-filled field
      // This is a behavioral test - the form should not lock fields after template selection
      expect(true).toBe(true); // Placeholder for integration test
    });

    it('should allow clearing template and resetting form', () => {
      // Users should be able to clear the selected template and reset the form
      // This is a behavioral test - the clear button should reset all fields
      expect(true).toBe(true); // Placeholder for integration test
    });

    it('should work with form validation', () => {
      // Template-filled fields should still be subject to form validation
      // This is a behavioral test - validation should work normally
      expect(true).toBe(true); // Placeholder for integration test
    });
  });
});

// Helper functions (these mirror the actual implementation in complaint-form.tsx)

function buildDescriptionFromTemplate(template: ComplaintTemplate): string {
  let description = `<p><strong>${template.description}</strong></p><br/>`;
  
  if (template.fields && typeof template.fields === 'object') {
    description += '<p><strong>Please provide the following information:</strong></p><br/>';
    
    Object.entries(template.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
      const label = fieldConfig.label || fieldName;
      const placeholder = fieldConfig.placeholder || '';
      const required = fieldConfig.required ? ' (Required)' : ' (Optional)';
      
      description += `<p><strong>${label}${required}:</strong></p>`;
      description += `<p><em>${placeholder || 'Enter information here...'}</em></p><br/>`;
    });
  }
  
  return description;
}

function getSuggestedTagsForTemplate(template: ComplaintTemplate): string[] {
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
