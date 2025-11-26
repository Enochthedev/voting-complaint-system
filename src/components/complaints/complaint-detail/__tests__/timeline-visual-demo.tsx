/**
 * Visual Demo for Timeline Chronological Sorting
 *
 * This file demonstrates that the TimelineSection component correctly
 * sorts history items chronologically (oldest first).
 *
 * To test:
 * 1. Navigate to a complaint detail page
 * 2. Check the Timeline section on the right sidebar
 * 3. Verify that actions are displayed from oldest to newest
 *
 * Expected behavior:
 * - "Created complaint" should appear first
 * - Status changes should appear in the order they occurred
 * - Most recent action should appear last
 *
 * Implementation details:
 * - The TimelineSection component uses React.useMemo to sort history
 * - Sorting is done by comparing created_at timestamps
 * - Sort order: ascending (oldest first)
 * - Formula: dateA - dateB (where dateA and dateB are timestamps)
 */

import type { ComplaintHistory, User as UserType } from '@/types/database.types';

// Example: History items provided in random order
const unsortedHistory: (ComplaintHistory & { user?: UserType })[] = [
  {
    id: 'hist-3',
    complaint_id: 'complaint-1',
    action: 'status_changed',
    old_value: 'opened',
    new_value: 'resolved',
    performed_by: 'user-1',
    details: null,
    created_at: '2024-11-15T14:00:00Z', // 2:00 PM - Latest
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: 'lecturer',
      full_name: 'Dr. Smith',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'hist-1',
    complaint_id: 'complaint-1',
    action: 'created',
    old_value: null,
    new_value: 'new',
    performed_by: 'user-2',
    details: null,
    created_at: '2024-11-15T10:00:00Z', // 10:00 AM - Earliest
    user: {
      id: 'user-2',
      email: 'student@example.com',
      role: 'student',
      full_name: 'John Doe',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'hist-2',
    complaint_id: 'complaint-1',
    action: 'status_changed',
    old_value: 'new',
    new_value: 'opened',
    performed_by: 'user-1',
    details: null,
    created_at: '2024-11-15T12:00:00Z', // 12:00 PM - Middle
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: 'lecturer',
      full_name: 'Dr. Smith',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
];

// After sorting (what TimelineSection will display):
const expectedSortedOrder = [
  'hist-1', // 10:00 AM - Created complaint
  'hist-2', // 12:00 PM - Changed status from "new" to "opened"
  'hist-3', // 2:00 PM - Changed status from "opened" to "resolved"
];

/**
 * Verification function (mimics the sorting logic in TimelineSection)
 */
function verifySorting() {
  const sorted = [...unsortedHistory].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateA - dateB;
  });

  console.log(
    'Original order:',
    unsortedHistory.map((h) => h.id)
  );
  console.log(
    'Sorted order:',
    sorted.map((h) => h.id)
  );
  console.log('Expected order:', expectedSortedOrder);
  console.log(
    'Sorting correct:',
    JSON.stringify(sorted.map((h) => h.id)) === JSON.stringify(expectedSortedOrder)
  );

  return sorted;
}

// Run verification
if (typeof window !== 'undefined') {
  console.log('=== Timeline Chronological Sorting Demo ===');
  verifySorting();
}

export { unsortedHistory, expectedSortedOrder, verifySorting };
