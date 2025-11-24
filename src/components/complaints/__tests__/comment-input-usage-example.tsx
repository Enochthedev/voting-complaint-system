/**
 * Comment Input Component - Usage Examples
 * 
 * This file demonstrates various ways to use the CommentInput component.
 * These examples can be used as reference when implementing comment functionality.
 */

import * as React from 'react';
import { CommentInput } from '../comment-input';

/**
 * Example 1: Basic Comment Input (Student View)
 * 
 * Simple comment input without internal notes toggle.
 * Suitable for student users who can only post public comments.
 */
export function BasicCommentInputExample() {
  const handleSubmit = async (comment: string, isInternal: boolean) => {
    console.log('Comment submitted:', comment);
    console.log('Is internal:', isInternal); // Will always be false for students
    
    // In Phase 12, this will be:
    // await supabase.from('complaint_comments').insert({
    //   complaint_id: complaintId,
    //   user_id: currentUser.id,
    //   comment,
    //   is_internal: false,
    // });
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-bold">Basic Comment Input</h2>
      <CommentInput
        onSubmit={handleSubmit}
        placeholder="Add your comment..."
      />
    </div>
  );
}

/**
 * Example 2: Comment Input with Internal Notes (Lecturer View)
 * 
 * Comment input with internal notes toggle for lecturers.
 * Allows lecturers to post both public comments and internal notes.
 */
export function LecturerCommentInputExample() {
  const handleSubmit = async (comment: string, isInternal: boolean) => {
    console.log('Comment submitted:', comment);
    console.log('Is internal:', isInternal);
    
    // In Phase 12, this will be:
    // await supabase.from('complaint_comments').insert({
    //   complaint_id: complaintId,
    //   user_id: currentUser.id,
    //   comment,
    //   is_internal: isInternal,
    // });
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-bold">Lecturer Comment Input</h2>
      <CommentInput
        onSubmit={handleSubmit}
        showInternalToggle={true}
        placeholder="Add a comment or internal note..."
      />
    </div>
  );
}

/**
 * Example 3: Edit Comment Mode
 * 
 * Comment input in edit mode for updating existing comments.
 * Shows cancel button and pre-fills with existing content.
 */
export function EditCommentExample() {
  const [isEditing, setIsEditing] = React.useState(false);
  const existingComment = {
    id: 'comment-123',
    comment: 'This is an existing comment that can be edited.',
    is_internal: false,
  };

  const handleUpdate = async (comment: string, isInternal: boolean) => {
    console.log('Comment updated:', comment);
    console.log('Is internal:', isInternal);
    
    // In Phase 12, this will be:
    // await supabase
    //   .from('complaint_comments')
    //   .update({ 
    //     comment,
    //     is_internal: isInternal,
    //     updated_at: new Date().toISOString() 
    //   })
    //   .eq('id', existingComment.id);
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-bold">Edit Comment</h2>
      
      {!isEditing ? (
        <div>
          <div className="mb-4 rounded-lg border p-4">
            <p className="text-sm">{existingComment.comment}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Edit Comment
          </button>
        </div>
      ) : (
        <CommentInput
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          initialValue={existingComment.comment}
          initialIsInternal={existingComment.is_internal}
          isEditing={true}
          showInternalToggle={true}
        />
      )}
    </div>
  );
}

/**
 * Example 4: Comment Input with Custom Validation
 * 
 * Comment input with custom min/max length requirements.
 * Useful for enforcing specific comment length policies.
 */
export function CustomValidationExample() {
  const handleSubmit = async (comment: string, isInternal: boolean) => {
    console.log('Comment submitted:', comment);
    console.log('Length:', comment.length);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-bold">Custom Validation</h2>
      <p className="mb-4 text-sm text-gray-600">
        This example requires comments to be between 20 and 500 characters.
      </p>
      <CommentInput
        onSubmit={handleSubmit}
        minLength={20}
        maxLength={500}
        placeholder="Write a detailed comment (minimum 20 characters)..."
      />
    </div>
  );
}

/**
 * Example 5: Complete Comment Section
 * 
 * Full implementation showing comment list with add comment functionality.
 * This is how the component would be used in a real complaint detail page.
 */
export function CompleteCommentSectionExample() {
  const [comments, setComments] = React.useState([
    {
      id: '1',
      user_id: 'user-1',
      comment: 'This is the first comment on this complaint.',
      is_internal: false,
      created_at: '2024-11-18T10:00:00Z',
      user: {
        id: 'user-1',
        full_name: 'John Doe',
        role: 'student' as const,
      },
    },
    {
      id: '2',
      user_id: 'user-2',
      comment: 'Internal note: Following up with facilities team.',
      is_internal: true,
      created_at: '2024-11-18T11:30:00Z',
      user: {
        id: 'user-2',
        full_name: 'Dr. Sarah Smith',
        role: 'lecturer' as const,
      },
    },
  ]);

  const currentUserRole: 'student' | 'lecturer' | 'admin' = 'lecturer';

  const handleAddComment = async (comment: string, isInternal: boolean) => {
    // Mock adding comment
    const newComment = {
      id: Date.now().toString(),
      user_id: 'current-user',
      comment,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
      user: {
        id: 'current-user',
        full_name: 'Current User',
        role: currentUserRole,
      },
    };

    setComments([...comments, newComment]);
    
    // In Phase 12, this will be:
    // const { data, error } = await supabase
    //   .from('complaint_comments')
    //   .insert({
    //     complaint_id: complaintId,
    //     user_id: currentUser.id,
    //     comment,
    //     is_internal: isInternal,
    //   })
    //   .select()
    //   .single();
    //
    // if (!error) {
    //   setComments([...comments, data]);
    // }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold">Complete Comment Section</h2>
      
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Discussion ({comments.length})
        </h3>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="mb-6 space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700">
                      {comment.user.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {comment.user.full_name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatRelativeTime(comment.created_at)}
                      </p>
                    </div>
                  </div>
                  {comment.is_internal && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Internal
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-700">{comment.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-6 text-sm text-zinc-500">
            No comments yet. Be the first to comment!
          </p>
        )}

        {/* Add Comment */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-zinc-700">
            Add Comment
          </h4>
          <CommentInput
            onSubmit={handleAddComment}
            showInternalToggle={currentUserRole === 'lecturer' || currentUserRole === 'admin'}
            placeholder="Share your thoughts or provide an update..."
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: With Auto-focus
 * 
 * Comment input that automatically focuses when rendered.
 * Useful when scrolling to the comment section or opening a reply form.
 */
export function AutoFocusExample() {
  const [showReplyForm, setShowReplyForm] = React.useState(false);

  const handleSubmit = async (comment: string, isInternal: boolean) => {
    console.log('Reply submitted:', comment);
    setShowReplyForm(false);
  };

  const handleCancel = () => {
    setShowReplyForm(false);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-bold">Auto-focus Example</h2>
      
      <div className="mb-4 rounded-lg border p-4">
        <p className="mb-2 text-sm">Original comment goes here...</p>
        {!showReplyForm && (
          <button
            onClick={() => setShowReplyForm(true)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Reply
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="ml-8">
          <CommentInput
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            autoFocus={true}
            placeholder="Write your reply..."
          />
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: All Examples Combined
 * 
 * Component that renders all examples for testing and demonstration.
 */
export function AllCommentInputExamples() {
  return (
    <div className="space-y-12 p-8">
      <BasicCommentInputExample />
      <hr className="my-8" />
      <LecturerCommentInputExample />
      <hr className="my-8" />
      <EditCommentExample />
      <hr className="my-8" />
      <CustomValidationExample />
      <hr className="my-8" />
      <CompleteCommentSectionExample />
      <hr className="my-8" />
      <AutoFocusExample />
    </div>
  );
}
