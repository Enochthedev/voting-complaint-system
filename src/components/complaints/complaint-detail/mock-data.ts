import type { User as UserType } from '@/types/database.types';
import type { ComplaintWithRelations } from './types';

/**
 * Mock data for UI development (following UI-first approach)
 * This will be replaced with real API calls in Phase 12
 */
export function getMockComplaintData(id: string): ComplaintWithRelations {
  // For testing rating prompt, use a resolved complaint
  // Change status to 'in_progress' to test other states
  const isResolved = true; // Set to false to test non-resolved state

  return {
    id,
    student_id: 'student-123',
    is_anonymous: false,
    is_draft: false,
    title: 'Broken Air Conditioning in Lecture Hall B',
    description: `<p>The air conditioning system in Lecture Hall B has been malfunctioning for the past week. 
    The temperature in the room becomes unbearably hot during afternoon classes, making it very difficult 
    for students to concentrate.</p>
    <p>This issue affects approximately 150 students who have classes in this hall. 
    We request urgent attention to this matter as it's impacting our learning experience.</p>`,
    category: 'facilities',
    priority: 'high',
    status: isResolved ? 'resolved' : 'in_progress',
    assigned_to: 'lecturer-456',
    created_at: '2024-11-15T10:30:00Z',
    updated_at: isResolved ? '2024-11-20T16:30:00Z' : '2024-11-18T14:20:00Z',
    opened_at: '2024-11-15T11:00:00Z',
    opened_by: 'lecturer-456',
    resolved_at: isResolved ? '2024-11-20T16:30:00Z' : null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 'tag-1', complaint_id: id, tag_name: 'urgent', created_at: '2024-11-15T10:30:00Z' },
      { id: 'tag-2', complaint_id: id, tag_name: 'facilities', created_at: '2024-11-15T10:30:00Z' },
      {
        id: 'tag-3',
        complaint_id: id,
        tag_name: 'lecture-hall',
        created_at: '2024-11-15T10:30:00Z',
      },
    ],
    complaint_attachments: [
      {
        id: 'att-1',
        complaint_id: id,
        file_name: 'temperature-reading.jpg',
        file_path: '/attachments/temperature-reading.jpg',
        file_size: 245678,
        file_type: 'image/jpeg',
        uploaded_by: 'student-123',
        created_at: '2024-11-15T10:30:00Z',
      },
      {
        id: 'att-2',
        complaint_id: id,
        file_name: 'hall-photo.jpg',
        file_path: '/attachments/hall-photo.jpg',
        file_size: 512340,
        file_type: 'image/jpeg',
        uploaded_by: 'student-123',
        created_at: '2024-11-15T10:30:00Z',
      },
      {
        id: 'att-3',
        complaint_id: id,
        file_name: 'maintenance-report.pdf',
        file_path: '/attachments/maintenance-report.pdf',
        file_size: 1024567,
        file_type: 'application/pdf',
        uploaded_by: 'student-123',
        created_at: '2024-11-15T10:31:00Z',
      },
    ],
    complaint_history: [
      {
        id: 'hist-1',
        complaint_id: id,
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'student-123',
        details: null,
        created_at: '2024-11-15T10:30:00Z',
        user: {
          id: 'student-123',
          email: 'john.doe@university.edu',
          role: 'student',
          full_name: 'John Doe',
          created_at: '2024-09-01T00:00:00Z',
          updated_at: '2024-09-01T00:00:00Z',
        },
      },
      {
        id: 'hist-2',
        complaint_id: id,
        action: 'status_changed',
        old_value: 'new',
        new_value: 'opened',
        performed_by: 'lecturer-456',
        details: null,
        created_at: '2024-11-15T11:00:00Z',
        user: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      {
        id: 'hist-3',
        complaint_id: id,
        action: 'assigned',
        old_value: null,
        new_value: 'lecturer-456',
        performed_by: 'lecturer-456',
        details: {
          assigned_to_name: 'Dr. Sarah Smith',
          reason: 'Facilities management expert',
          department: 'Operations',
        },
        created_at: '2024-11-15T11:00:00Z',
        user: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      {
        id: 'hist-3a',
        complaint_id: id,
        action: 'feedback_added',
        old_value: null,
        new_value: null,
        performed_by: 'lecturer-456',
        details: {
          feedback_length: '450 characters',
          action_items: '4 next steps outlined',
        },
        created_at: '2024-11-15T15:30:00Z',
        user: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      {
        id: 'hist-4',
        complaint_id: id,
        action: 'status_changed',
        old_value: 'opened',
        new_value: 'in_progress',
        performed_by: 'lecturer-456',
        details: {
          note: 'Facilities team contacted and parts ordered',
        },
        created_at: '2024-11-18T14:20:00Z',
        user: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      ...(isResolved
        ? [
            {
              id: 'hist-5',
              complaint_id: id,
              action: 'status_changed' as const,
              old_value: 'in_progress',
              new_value: 'resolved',
              performed_by: 'lecturer-456',
              details: null,
              created_at: '2024-11-20T16:30:00Z',
              user: {
                id: 'lecturer-456',
                email: 'dr.smith@university.edu',
                role: 'lecturer' as const,
                full_name: 'Dr. Sarah Smith',
                created_at: '2024-08-01T00:00:00Z',
                updated_at: '2024-08-01T00:00:00Z',
              },
            },
          ]
        : []),
    ],
    complaint_comments: [
      {
        id: 'comment-1',
        complaint_id: id,
        user_id: 'lecturer-456',
        comment:
          'Thank you for reporting this issue. I have contacted the facilities management team and they will inspect the AC unit tomorrow.',
        is_internal: false,
        created_at: '2024-11-15T11:05:00Z',
        updated_at: '2024-11-15T11:05:00Z',
        user: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      {
        id: 'comment-1a',
        complaint_id: id,
        user_id: 'lecturer-456',
        comment:
          'Internal note: This is a recurring issue. We need to schedule a full HVAC system inspection for all lecture halls. Will discuss with facilities director.',
        is_internal: true,
        created_at: '2024-11-15T11:10:00Z',
        updated_at: '2024-11-15T11:10:00Z',
        user: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      {
        id: 'comment-2',
        complaint_id: id,
        user_id: 'student-123',
        comment: 'Thank you for the quick response! Looking forward to the resolution.',
        is_internal: false,
        created_at: '2024-11-15T14:30:00Z',
        updated_at: '2024-11-15T14:30:00Z',
        user: {
          id: 'student-123',
          email: 'john.doe@university.edu',
          role: 'student',
          full_name: 'John Doe',
          created_at: '2024-09-01T00:00:00Z',
          updated_at: '2024-09-01T00:00:00Z',
        },
      },
      {
        id: 'comment-2a',
        complaint_id: id,
        user_id: 'admin-202',
        comment:
          'Internal note: Budget approved for emergency HVAC repairs. Prioritize this complaint and similar ones.',
        is_internal: true,
        created_at: '2024-11-16T09:00:00Z',
        updated_at: '2024-11-16T09:00:00Z',
        user: {
          id: 'admin-202',
          email: 'admin.brown@university.edu',
          role: 'admin',
          full_name: 'Admin Robert Brown',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      {
        id: 'comment-3',
        complaint_id: id,
        user_id: 'lecturer-456',
        comment:
          'Update: The facilities team has ordered replacement parts. They expect to complete the repair by Friday.',
        is_internal: false,
        created_at: '2024-11-18T14:20:00Z',
        updated_at: '2024-11-18T14:20:00Z',
        user: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
    ],
    assigned_lecturer: {
      id: 'lecturer-456',
      email: 'dr.smith@university.edu',
      role: 'lecturer',
      full_name: 'Dr. Sarah Smith',
      created_at: '2024-08-01T00:00:00Z',
      updated_at: '2024-08-01T00:00:00Z',
    },
    feedback: [
      {
        id: 'feedback-1',
        complaint_id: id,
        lecturer_id: 'lecturer-456',
        content: `<p>Thank you for bringing this issue to our attention. I have personally inspected Lecture Hall B and confirmed that the air conditioning system is indeed malfunctioning.</p>
        <p>I have escalated this to the facilities management team with high priority. They have scheduled an emergency inspection for tomorrow morning at 8:00 AM.</p>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Facilities team will diagnose the issue tomorrow</li>
          <li>Replacement parts have been ordered and should arrive by Wednesday</li>
          <li>Installation is scheduled for Thursday morning</li>
          <li>We expect the system to be fully operational by Friday</li>
        </ul>
        <p>In the meantime, we have arranged for portable cooling units to be placed in the hall for your afternoon classes.</p>`,
        created_at: '2024-11-15T15:30:00Z',
        updated_at: '2024-11-15T15:30:00Z',
        lecturer: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
      {
        id: 'feedback-2',
        complaint_id: id,
        lecturer_id: 'lecturer-456',
        content: `<p><strong>Update:</strong> The facilities team has completed their inspection and identified the issue. The compressor unit needs to be replaced.</p>
        <p>The replacement parts arrived earlier than expected, and the installation is now scheduled for tomorrow (Wednesday) instead of Thursday. This means the AC should be working by Wednesday afternoon.</p>
        <p>Thank you for your patience as we work to resolve this issue.</p>`,
        created_at: '2024-11-18T09:15:00Z',
        updated_at: '2024-11-18T09:15:00Z',
        lecturer: {
          id: 'lecturer-456',
          email: 'dr.smith@university.edu',
          role: 'lecturer',
          full_name: 'Dr. Sarah Smith',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        },
      },
    ],
  };
}

/**
 * Mock lecturers data for assignment dropdown (UI-first approach)
 * This will be replaced with real API calls in Phase 12
 */
export function getMockLecturers(): UserType[] {
  return [
    {
      id: 'lecturer-456',
      email: 'dr.smith@university.edu',
      role: 'lecturer',
      full_name: 'Dr. Sarah Smith',
      created_at: '2024-08-01T00:00:00Z',
      updated_at: '2024-08-01T00:00:00Z',
    },
    {
      id: 'lecturer-789',
      email: 'prof.johnson@university.edu',
      role: 'lecturer',
      full_name: 'Prof. Michael Johnson',
      created_at: '2024-08-01T00:00:00Z',
      updated_at: '2024-08-01T00:00:00Z',
    },
    {
      id: 'lecturer-101',
      email: 'dr.williams@university.edu',
      role: 'lecturer',
      full_name: 'Dr. Emily Williams',
      created_at: '2024-08-01T00:00:00Z',
      updated_at: '2024-08-01T00:00:00Z',
    },
    {
      id: 'admin-202',
      email: 'admin.brown@university.edu',
      role: 'admin',
      full_name: 'Admin Robert Brown',
      created_at: '2024-08-01T00:00:00Z',
      updated_at: '2024-08-01T00:00:00Z',
    },
    {
      id: 'lecturer-303',
      email: 'dr.davis@university.edu',
      role: 'lecturer',
      full_name: 'Dr. Jennifer Davis',
      created_at: '2024-08-01T00:00:00Z',
      updated_at: '2024-08-01T00:00:00Z',
    },
  ];
}
