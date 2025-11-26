import type { ComplaintTemplate } from './types';

/**
 * Mock templates for UI development
 * In production, these will be fetched from the database
 */
export const MOCK_TEMPLATES: ComplaintTemplate[] = [
  {
    id: '1',
    title: 'Broken Equipment in Lab',
    description:
      'Template for reporting broken or malfunctioning equipment in laboratory facilities',
    category: 'facilities',
    suggested_priority: 'high',
    fields: {
      equipment_name: {
        label: 'Equipment Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Microscope, Computer',
      },
      lab_room: { label: 'Lab Room', type: 'text', required: true, placeholder: 'e.g., Lab 301' },
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
  },
  {
    id: '2',
    title: 'Assignment Grading Issue',
    description: 'Template for students to report concerns about assignment grading',
    category: 'academic',
    suggested_priority: 'medium',
    fields: {
      assignment_name: {
        label: 'Assignment Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Assignment 3',
      },
      course_code: {
        label: 'Course Code',
        type: 'text',
        required: true,
        placeholder: 'e.g., CS101',
      },
      expected_grade: {
        label: 'Expected Grade',
        type: 'text',
        required: false,
        placeholder: 'e.g., A',
      },
      received_grade: {
        label: 'Received Grade',
        type: 'text',
        required: true,
        placeholder: 'e.g., B',
      },
      concern_details: {
        label: 'Concern Details',
        type: 'textarea',
        required: true,
        placeholder: 'Explain your concern',
      },
    },
    created_by: 'lecturer-1',
    is_active: true,
    created_at: '2024-11-10T14:30:00Z',
    updated_at: '2024-11-10T14:30:00Z',
  },
  {
    id: '3',
    title: 'Classroom AC Not Working',
    description: 'Template for reporting air conditioning issues in classrooms',
    category: 'facilities',
    suggested_priority: 'medium',
    fields: {
      room_number: {
        label: 'Room Number',
        type: 'text',
        required: true,
        placeholder: 'e.g., Room 205',
      },
      building: {
        label: 'Building',
        type: 'text',
        required: true,
        placeholder: 'e.g., Engineering Building',
      },
      temperature_issue: {
        label: 'Temperature Issue',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the temperature problem',
      },
    },
    created_by: 'lecturer-2',
    is_active: true,
    created_at: '2024-11-08T09:15:00Z',
    updated_at: '2024-11-08T09:15:00Z',
  },
  {
    id: '4',
    title: 'Course Material Access Problem',
    description: 'Template for reporting issues accessing course materials or online resources',
    category: 'course_content',
    suggested_priority: 'high',
    fields: {
      course_name: {
        label: 'Course Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Introduction to Programming',
      },
      material_type: {
        label: 'Material Type',
        type: 'text',
        required: true,
        placeholder: 'e.g., Lecture slides, Video',
      },
      access_error: {
        label: 'Access Error',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the error message or issue',
      },
      platform: {
        label: 'Platform',
        type: 'text',
        required: false,
        placeholder: 'e.g., Moodle, Canvas',
      },
    },
    created_by: 'lecturer-1',
    is_active: true,
    created_at: '2024-11-05T11:20:00Z',
    updated_at: '2024-11-18T16:45:00Z',
  },
  {
    id: '5',
    title: 'Parking Permit Issue',
    description: 'Template for reporting problems with parking permits or parking facilities',
    category: 'administrative',
    suggested_priority: 'low',
    fields: {
      permit_number: {
        label: 'Permit Number',
        type: 'text',
        required: false,
        placeholder: 'e.g., P12345',
      },
      parking_lot: {
        label: 'Parking Lot',
        type: 'text',
        required: true,
        placeholder: 'e.g., Lot A',
      },
      issue_type: {
        label: 'Issue Type',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the parking issue',
      },
    },
    created_by: 'lecturer-3',
    is_active: true,
    created_at: '2024-11-01T08:00:00Z',
    updated_at: '2024-11-01T08:00:00Z',
  },
];

/**
 * Mock popular tags for autocomplete
 * In production, these will be fetched from the database
 */
export const MOCK_POPULAR_TAGS: string[] = [
  'wifi-issues',
  'classroom',
  'assignment',
  'grading',
  'schedule',
  'equipment',
  'parking',
  'library',
  'cafeteria',
  'registration',
  'exam',
  'professor',
  'course-material',
  'lab',
  'software',
  'hardware',
  'accessibility',
  'safety',
  'cleanliness',
  'noise',
];
