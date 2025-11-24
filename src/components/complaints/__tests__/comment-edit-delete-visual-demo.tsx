/**
 * Visual Demo: Comment Edit and Delete Functionality
 * 
 * This file demonstrates the comment editing and deletion features
 * implemented in the ComplaintDetailView component.
 * 
 * To test this functionality:
 * 1. Navigate to any complaint detail page
 * 2. Look for comments in the discussion section
 * 3. On your own comments, you'll see "Edit" and "Delete" buttons
 * 4. Click "Edit" to modify the comment
 * 5. Click "Delete" to remove the comment (with confirmation)
 * 
 * Features Demonstrated:
 * - Edit button appears only on user's own comments
 * - Delete button appears only on user's own comments
 * - Edit mode uses CommentInput component
 * - Delete requires confirmation
 * - "(edited)" indicator shows on modified comments
 * - Permission checks prevent unauthorized modifications
 */

import * as React from 'react';

/**
 * Example: Comment with Edit/Delete Buttons
 * 
 * When viewing your own comment, you'll see:
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │ 👤 Dr. Sarah Smith                    [Internal] [Edit] [Delete] │
 * │    2 hours ago (edited)                                 │
 * │                                                         │
 * │ Thank you for reporting this issue. I have contacted   │
 * │ the facilities management team...                      │
 * └─────────────────────────────────────────────────────────┘
 */

/**
 * Example: Comment in Edit Mode
 * 
 * After clicking "Edit", the comment transforms to:
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │ 👤 Dr. Sarah Smith                                      │
 * │    Editing comment                                      │
 * │                                                         │
 * │ ┌─────────────────────────────────────────────────────┐ │
 * │ │ Thank you for reporting this issue. I have          │ │
 * │ │ contacted the facilities management team...         │ │
 * │ │                                                     │ │
 * │ └─────────────────────────────────────────────────────┘ │
 * │ Minimum 1 characters • Press Ctrl+Enter to submit  87/2000 │
 * │                                                         │
 * │ ☐ Internal note (visible only to lecturers and admins) │
 * │                                                         │
 * │                              [Cancel] [Update]          │
 * └─────────────────────────────────────────────────────────┘
 */

/**
 * Example: Delete Confirmation Modal
 * 
 * After clicking "Delete", a modal appears:
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │                    Delete Comment                       │
 * │                                                         │
 * │ Are you sure you want to delete this comment?          │
 * │ This action cannot be undone.                          │
 * │                                                         │
 * │                              [Cancel] [Delete Comment]  │
 * └─────────────────────────────────────────────────────────┘
 */

/**
 * Test Scenarios
 */

export const testScenarios = {
  /**
   * Scenario 1: Edit Own Comment
   * 
   * Steps:
   * 1. Navigate to a complaint detail page
   * 2. Find a comment you authored
   * 3. Click the "Edit" button
   * 4. Modify the comment text
   * 5. Click "Update" or press Ctrl+Enter
   * 
   * Expected Result:
   * - Comment switches to edit mode
   * - Textarea is pre-filled with existing text
   * - Internal flag is preserved (if applicable)
   * - After update, comment shows "(edited)" indicator
   * - Comment returns to view mode
   */
  editOwnComment: {
    description: 'User can edit their own comment',
    steps: [
      'Click Edit button on own comment',
      'Modify text in textarea',
      'Click Update button',
      'Verify comment is updated',
      'Verify "(edited)" indicator appears',
    ],
    expectedBehavior: 'Comment is updated and shows edited indicator',
  },

  /**
   * Scenario 2: Cancel Edit
   * 
   * Steps:
   * 1. Click "Edit" on your comment
   * 2. Make some changes to the text
   * 3. Click "Cancel" button
   * 
   * Expected Result:
   * - Changes are discarded
   * - Comment returns to original state
   * - No "(edited)" indicator appears
   */
  cancelEdit: {
    description: 'User can cancel editing without saving changes',
    steps: [
      'Click Edit button',
      'Modify text',
      'Click Cancel button',
      'Verify original text is preserved',
    ],
    expectedBehavior: 'Changes are discarded, original comment remains',
  },

  /**
   * Scenario 3: Delete Own Comment
   * 
   * Steps:
   * 1. Find a comment you authored
   * 2. Click the "Delete" button
   * 3. Confirm deletion in the modal
   * 
   * Expected Result:
   * - Confirmation modal appears
   * - After confirming, comment is removed from list
   * - Other comments remain unaffected
   */
  deleteOwnComment: {
    description: 'User can delete their own comment',
    steps: [
      'Click Delete button on own comment',
      'Verify confirmation modal appears',
      'Click Delete Comment button',
      'Verify comment is removed from list',
    ],
    expectedBehavior: 'Comment is permanently removed after confirmation',
  },

  /**
   * Scenario 4: Cancel Delete
   * 
   * Steps:
   * 1. Click "Delete" on your comment
   * 2. Click "Cancel" in the confirmation modal
   * 
   * Expected Result:
   * - Modal closes
   * - Comment remains in the list
   * - No changes occur
   */
  cancelDelete: {
    description: 'User can cancel deletion',
    steps: [
      'Click Delete button',
      'Click Cancel in modal',
      'Verify comment still exists',
    ],
    expectedBehavior: 'Deletion is cancelled, comment remains',
  },

  /**
   * Scenario 5: Cannot Edit Others' Comments
   * 
   * Steps:
   * 1. View a comment authored by another user
   * 2. Look for Edit/Delete buttons
   * 
   * Expected Result:
   * - Edit and Delete buttons do not appear
   * - Only view mode is available
   */
  cannotEditOthersComments: {
    description: 'Users cannot edit comments by other users',
    steps: [
      'View comment by another user',
      'Verify no Edit button appears',
      'Verify no Delete button appears',
    ],
    expectedBehavior: 'Edit/Delete buttons only appear on own comments',
  },

  /**
   * Scenario 6: Edit Internal Note
   * 
   * Steps (Lecturer/Admin only):
   * 1. Find an internal note you authored
   * 2. Click "Edit"
   * 3. Modify the text
   * 4. Verify internal checkbox is checked
   * 5. Click "Update"
   * 
   * Expected Result:
   * - Internal flag is preserved
   * - Comment remains internal after edit
   * - "(edited)" indicator appears
   */
  editInternalNote: {
    description: 'Lecturers can edit internal notes',
    steps: [
      'Click Edit on internal note',
      'Verify internal checkbox is checked',
      'Modify text',
      'Click Update',
      'Verify note remains internal',
    ],
    expectedBehavior: 'Internal flag is preserved during edit',
  },

  /**
   * Scenario 7: Keyboard Shortcuts
   * 
   * Steps:
   * 1. Click "Edit" on your comment
   * 2. Make changes
   * 3. Press Ctrl+Enter (or Cmd+Enter on Mac)
   * 
   * Expected Result:
   * - Comment is updated (same as clicking Update button)
   * 
   * Alternative:
   * 1. Click "Edit"
   * 2. Press Escape
   * 
   * Expected Result:
   * - Edit mode is cancelled (same as clicking Cancel button)
   */
  keyboardShortcuts: {
    description: 'Keyboard shortcuts work in edit mode',
    steps: [
      'Enter edit mode',
      'Press Ctrl+Enter to submit',
      'OR press Escape to cancel',
    ],
    expectedBehavior: 'Keyboard shortcuts trigger same actions as buttons',
  },

  /**
   * Scenario 8: Validation in Edit Mode
   * 
   * Steps:
   * 1. Click "Edit" on your comment
   * 2. Delete all text (make it empty)
   * 3. Try to click "Update"
   * 
   * Expected Result:
   * - Update button is disabled
   * - Error message appears: "Comment cannot be empty"
   * - Cannot submit empty comment
   */
  validationInEditMode: {
    description: 'Validation prevents empty comments',
    steps: [
      'Enter edit mode',
      'Delete all text',
      'Verify Update button is disabled',
      'Verify error message appears',
    ],
    expectedBehavior: 'Cannot save empty comment',
  },

  /**
   * Scenario 9: Single Edit at a Time
   * 
   * Steps:
   * 1. Click "Edit" on one of your comments
   * 2. Try to view other comments
   * 
   * Expected Result:
   * - Only one comment can be in edit mode at a time
   * - Add Comment form is hidden while editing
   * - Must finish or cancel current edit before editing another
   */
  singleEditAtTime: {
    description: 'Only one comment can be edited at a time',
    steps: [
      'Enter edit mode on one comment',
      'Verify Add Comment form is hidden',
      'Verify other comments remain in view mode',
    ],
    expectedBehavior: 'Single edit mode enforced',
  },

  /**
   * Scenario 10: Loading States
   * 
   * Steps:
   * 1. Click "Edit" and make changes
   * 2. Click "Update"
   * 3. Observe the button during submission
   * 
   * Expected Result:
   * - Button shows "Updating..." with spinner
   * - Button is disabled during update
   * - After completion, returns to view mode
   * 
   * Same for Delete:
   * 1. Click "Delete"
   * 2. Click "Delete Comment" in modal
   * 3. Observe the button
   * 
   * Expected Result:
   * - Button shows "Deleting..." during deletion
   * - Button is disabled during deletion
   */
  loadingStates: {
    description: 'Loading states shown during async operations',
    steps: [
      'Trigger edit or delete',
      'Observe button text changes',
      'Verify button is disabled',
      'Wait for operation to complete',
    ],
    expectedBehavior: 'Clear loading indicators during operations',
  },
};

/**
 * Permission Matrix
 * 
 * | User Role | Own Comment | Others' Comment |
 * |-----------|-------------|-----------------|
 * | Student   | Edit/Delete | View Only       |
 * | Lecturer  | Edit/Delete | View Only       |
 * | Admin     | Edit/Delete | View Only       |
 * 
 * Note: Users can only modify their own comments, regardless of role.
 */

/**
 * UI States
 */

export const uiStates = {
  viewMode: {
    description: 'Default state showing comment content',
    elements: [
      'User avatar',
      'User name',
      'Timestamp',
      'Edit button (if own comment)',
      'Delete button (if own comment)',
      'Internal badge (if internal)',
      '(edited) indicator (if edited)',
      'Comment text',
    ],
  },

  editMode: {
    description: 'State when editing a comment',
    elements: [
      'User avatar',
      'User name',
      '"Editing comment" label',
      'CommentInput component',
      'Pre-filled textarea',
      'Character count',
      'Internal checkbox (if lecturer/admin)',
      'Cancel button',
      'Update button',
    ],
  },

  deleteModal: {
    description: 'Confirmation modal for deletion',
    elements: [
      'Modal overlay',
      'Modal title: "Delete Comment"',
      'Warning message',
      'Cancel button',
      'Delete Comment button (destructive style)',
    ],
  },
};

/**
 * Mock Data Example
 * 
 * The implementation uses mock data during UI-first development.
 * Here's an example of how comments are structured:
 */

export const mockCommentExample = {
  id: 'comment-1',
  complaint_id: 'complaint-123',
  user_id: 'lecturer-456',
  comment: 'Thank you for reporting this issue. I have contacted the facilities management team.',
  is_internal: false,
  created_at: '2024-11-15T11:05:00Z',
  updated_at: '2024-11-15T11:05:00Z', // Same as created_at = not edited
  user: {
    id: 'lecturer-456',
    email: 'dr.smith@university.edu',
    role: 'lecturer',
    full_name: 'Dr. Sarah Smith',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  },
};

/**
 * After editing, the comment would look like:
 */

export const mockEditedCommentExample = {
  ...mockCommentExample,
  comment: 'Thank you for reporting this issue. I have contacted the facilities management team and they will inspect tomorrow.',
  updated_at: '2024-11-15T14:30:00Z', // Different from created_at = edited
};

/**
 * Implementation Notes
 * 
 * 1. Permission Check:
 *    - canModifyComment() compares comment.user_id with currentUserId
 *    - Returns true only if they match
 * 
 * 2. Edit Flow:
 *    - Click Edit → setEditingCommentId(comment.id)
 *    - CommentInput renders with initialValue and initialIsInternal
 *    - On submit → handleEditComment() updates local state
 *    - On cancel → setEditingCommentId(null)
 * 
 * 3. Delete Flow:
 *    - Click Delete → setCommentToDelete(comment.id) + setShowDeleteModal(true)
 *    - Modal appears with confirmation
 *    - On confirm → confirmDeleteComment() removes from local state
 *    - On cancel → cancelDeleteComment() closes modal
 * 
 * 4. State Management:
 *    - editingCommentId: string | null
 *    - deletingCommentId: string | null
 *    - showDeleteModal: boolean
 *    - commentToDelete: string | null
 * 
 * 5. UI Behavior:
 *    - Only one comment can be edited at a time
 *    - Add Comment form hidden during edit
 *    - Edit/Delete buttons only on own comments
 *    - Loading states during async operations
 *    - Immediate UI updates (optimistic)
 */

export default {
  testScenarios,
  uiStates,
  mockCommentExample,
  mockEditedCommentExample,
};
