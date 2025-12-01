import type { Complaint, ComplaintTag, User } from '@/types/database.types';

/**
 * Generate mock complaints for testing virtual scrolling
 */
export function generateMockComplaints(count: number): (Complaint & {
  complaint_tags?: ComplaintTag[];
  assigned_lecturer?: User | null;
})[] {
  const categories = [
    'academic',
    'facilities',
    'harassment',
    'course_content',
    'administrative',
    'other',
  ] as const;
  const priorities = ['low', 'medium', 'high', 'critical'] as const;
  const statuses = ['new', 'opened', 'in_progress', 'resolved', 'closed', 'reopened'] as const;

  const titles = [
    'Broken Air Conditioning in Lecture Hall',
    'Unfair Grading in Course',
    'Library WiFi Connection Issues',
    'Missing Course Materials',
    'Parking Lot Lighting Safety Concern',
    'Registration System Error',
    'Inappropriate Behavior in Class',
    'Cafeteria Food Quality',
    'Lab Equipment Not Working',
    'Classroom Projector Malfunction',
    'Textbook Not Available',
    'Assignment Deadline Confusion',
    'Professor Office Hours Conflict',
    'Exam Schedule Overlap',
    'Student Portal Login Issues',
  ];

  const descriptions = [
    '<p>This issue has been affecting my ability to focus during lectures.</p>',
    '<p>I would like to request a review of the grading criteria for this assignment.</p>',
    '<p>The problem occurs frequently and disrupts my work.</p>',
    '<p>This needs immediate attention as it affects multiple students.</p>',
    '<p>I have tried to resolve this on my own but need assistance.</p>',
  ];

  const tagNames = [
    'urgent',
    'wifi',
    'grading',
    'facilities',
    'safety',
    'academic',
    'technical',
    'library',
    'parking',
    'cafeteria',
    'lab',
    'classroom',
  ];

  const lecturers: User[] = [
    {
      id: 'lecturer-1',
      email: 'smith@university.edu',
      role: 'lecturer',
      full_name: 'Dr. Smith',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'lecturer-2',
      email: 'johnson@university.edu',
      role: 'lecturer',
      full_name: 'Prof. Johnson',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'admin-1',
      email: 'davis@university.edu',
      role: 'admin',
      full_name: 'Admin Davis',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const complaints: (Complaint & {
    complaint_tags?: ComplaintTag[];
    assigned_lecturer?: User | null;
  })[] = [];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const title = titles[Math.floor(Math.random() * titles.length)] + ` #${i + 1}`;
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const isAnonymous = Math.random() > 0.7;
    const hasAssignment = Math.random() > 0.5;
    const assignedLecturer = hasAssignment
      ? lecturers[Math.floor(Math.random() * lecturers.length)]
      : null;

    // Generate random tags (1-3 tags per complaint)
    const numTags = Math.floor(Math.random() * 3) + 1;
    const complaintTags: ComplaintTag[] = [];
    const usedTags = new Set<string>();

    for (let j = 0; j < numTags; j++) {
      let tagName = tagNames[Math.floor(Math.random() * tagNames.length)];
      // Ensure unique tags
      while (usedTags.has(tagName)) {
        tagName = tagNames[Math.floor(Math.random() * tagNames.length)];
      }
      usedTags.add(tagName);

      complaintTags.push({
        id: `tag-${i}-${j}`,
        complaint_id: `complaint-${i}`,
        tag_name: tagName,
        created_at: new Date().toISOString(),
      });
    }

    // Random date within the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    complaints.push({
      id: `complaint-${i}`,
      student_id: isAnonymous ? null : `student-${Math.floor(Math.random() * 100)}`,
      is_anonymous: isAnonymous,
      is_draft: false,
      title,
      description,
      category,
      priority,
      status,
      assigned_to: assignedLecturer?.id || null,
      assigned_lecturer: assignedLecturer,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      opened_at: status !== 'new' ? createdAt.toISOString() : null,
      opened_by: status !== 'new' ? assignedLecturer?.id || null : null,
      resolved_at: status === 'resolved' || status === 'closed' ? createdAt.toISOString() : null,
      escalated_at: null,
      escalation_level: 0,
      complaint_tags: complaintTags,
    });
  }

  // Sort by created_at descending (newest first)
  return complaints.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
