'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CommentInput } from '@/components/complaints/comment-input';
import type { ComplaintComment, User as UserType } from '@/types/database.types';
import { formatRelativeTime } from './utils';

interface CommentsSectionProps {
  comments: (ComplaintComment & { user?: UserType })[];
  userRole: 'student' | 'lecturer' | 'admin';
  onAddComment?: (comment: string, isInternal: boolean) => Promise<void>;
}

/**
 * Comments/Discussion Component
 * Handles discussion thread with comments and internal notes
 */
export function CommentsSection({ comments, userRole, onAddComment }: CommentsSectionProps) {
  const [localComments, setLocalComments] = React.useState(comments);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = React.useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [commentToDelete, setCommentToDelete] = React.useState<string | null>(null);

  // Mock current user ID based on role (in Phase 12, get from auth context)
  const currentUserId =
    userRole === 'lecturer' ? 'lecturer-456' : userRole === 'admin' ? 'admin-202' : 'student-123';

  // Update local comments when prop changes
  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleSubmit = async (comment: string, isInternal: boolean) => {
    setIsSubmitting(true);

    try {
      if (onAddComment) {
        await onAddComment(comment, isInternal);
      } else {
        // Mock submission for UI development (Phase 12 will implement real API)
        console.log('Adding comment:', comment, 'Internal:', isInternal);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create mock comment for immediate UI feedback
        const mockUser: UserType = {
          id: currentUserId,
          email:
            userRole === 'lecturer'
              ? 'dr.smith@university.edu'
              : userRole === 'admin'
                ? 'admin.brown@university.edu'
                : 'john.doe@university.edu',
          role: userRole,
          full_name:
            userRole === 'lecturer'
              ? 'Dr. Sarah Smith'
              : userRole === 'admin'
                ? 'Admin Robert Brown'
                : 'John Doe',
          created_at: '2024-08-01T00:00:00Z',
          updated_at: '2024-08-01T00:00:00Z',
        };

        const newComment: ComplaintComment & { user?: UserType } = {
          id: `comment-${Date.now()}`,
          complaint_id: 'mock-complaint-id',
          user_id: mockUser.id,
          comment: comment,
          is_internal: isInternal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: mockUser,
        };

        // Add to local state for immediate UI update
        setLocalComments((prev) => [...prev, newComment]);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle comment edit
   */
  const handleEditComment = async (commentId: string, newText: string, isInternal: boolean) => {
    try {
      // Mock edit for UI development (Phase 12 will implement real API)
      console.log('Editing comment:', commentId, 'New text:', newText, 'Internal:', isInternal);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state for immediate UI feedback
      setLocalComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                comment: newText,
                is_internal: isInternal,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );

      // Exit edit mode
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Failed to edit comment. Please try again.');
      throw error;
    }
  };

  /**
   * Handle comment delete
   */
  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  /**
   * Confirm comment deletion
   */
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    setDeletingCommentId(commentToDelete);

    try {
      // Mock delete for UI development (Phase 12 will implement real API)
      console.log('Deleting comment:', commentToDelete);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove from local state for immediate UI feedback
      setLocalComments((prev) => prev.filter((c) => c.id !== commentToDelete));

      // Close modal
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  /**
   * Cancel comment deletion
   */
  const cancelDeleteComment = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  /**
   * Check if current user can edit/delete a comment
   */
  const canModifyComment = (comment: ComplaintComment & { user?: UserType }): boolean => {
    // User can only edit/delete their own comments
    return comment.user_id === currentUserId;
  };

  // Filter and sort comments based on user role
  // Internal notes are only visible to lecturers and admins
  // Regular comments are visible to everyone
  // Sort in chronological order (oldest first)
  // Validates: Requirements AC15, Design Property P19
  const visibleComments = React.useMemo(() => {
    if (!localComments) return [];

    // Filter out internal notes for students
    const filtered = localComments.filter((comment) => {
      // Lecturers and admins can see all comments
      if (userRole === 'lecturer' || userRole === 'admin') {
        return true;
      }
      // Students can only see non-internal comments
      return !comment.is_internal;
    });

    // Sort in chronological order (oldest first)
    return filtered.sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [localComments, userRole]);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">
        Discussion ({visibleComments?.length || 0})
      </h2>

      {/* Comments List */}
      {visibleComments && visibleComments.length > 0 ? (
        <div className="mb-6 space-y-4">
          {visibleComments.map((comment) => {
            const isEditing = editingCommentId === comment.id;
            const canModify = canModifyComment(comment);
            const isDeleting = deletingCommentId === comment.id;
            const wasEdited = comment.updated_at !== comment.created_at;

            return (
              <div key={comment.id} className="rounded-lg border border-border bg-muted p-4">
                {isEditing ? (
                  // Edit Mode
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                        {comment.user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {comment.user?.full_name || 'Unknown user'}
                        </p>
                        <p className="text-xs text-muted-foreground">Editing comment</p>
                      </div>
                    </div>
                    <CommentInput
                      initialValue={comment.comment}
                      initialIsInternal={comment.is_internal}
                      isEditing={true}
                      showInternalToggle={userRole === 'lecturer' || userRole === 'admin'}
                      onSubmit={async (newText, isInternal) => {
                        await handleEditComment(comment.id, newText, isInternal);
                      }}
                      onCancel={() => setEditingCommentId(null)}
                      autoFocus={true}
                      placeholder="Edit your comment..."
                    />
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                          {comment.user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {comment.user?.full_name || 'Unknown user'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.created_at)}
                            {wasEdited && ' (edited)'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {comment.is_internal && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                            Internal
                          </span>
                        )}
                        {canModify && !isDeleting && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingCommentId(comment.id)}
                              className="h-7 px-2 text-xs"
                              title="Edit comment"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                              title="Delete comment"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-card-foreground">{comment.comment}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      )}

      {/* Add Comment Form - Using new CommentInput component */}
      {!editingCommentId && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Add Comment</h3>
          <CommentInput
            onSubmit={handleSubmit}
            showInternalToggle={userRole === 'lecturer' || userRole === 'admin'}
            placeholder="Share your thoughts or provide an update..."
            minLength={1}
            maxLength={2000}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Delete Comment</h3>

            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDeleteComment}
                disabled={!!deletingCommentId}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteComment}
                disabled={!!deletingCommentId}
              >
                {deletingCommentId ? 'Deleting...' : 'Delete Comment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
