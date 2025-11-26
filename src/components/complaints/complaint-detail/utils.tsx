import * as React from 'react';
import { FileText, File, FileImage } from 'lucide-react';

/**
 * Format date to readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString);
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): React.ReactNode {
  if (fileType.startsWith('image/')) {
    return <FileImage className="h-8 w-8 flex-shrink-0 text-primary" />;
  } else if (fileType === 'application/pdf') {
    return <FileText className="h-8 w-8 flex-shrink-0 text-destructive" />;
  } else if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <File className="h-8 w-8 flex-shrink-0 text-accent" />;
  } else {
    return <File className="h-8 w-8 flex-shrink-0 text-muted-foreground" />;
  }
}

/**
 * Get file type label
 */
export function getFileTypeLabel(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return 'Image';
  } else if (fileType === 'application/pdf') {
    return 'PDF';
  } else if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'Document';
  } else {
    return 'File';
  }
}

/**
 * Get action label for timeline
 */
export function getActionLabel(
  action: string,
  oldValue: string | null,
  newValue: string | null
): string {
  switch (action) {
    case 'created':
      return 'Created complaint';
    case 'status_changed':
      return `Changed status from "${oldValue}" to "${newValue}"`;
    case 'assigned':
      return 'Assigned complaint';
    case 'reassigned':
      return 'Reassigned complaint';
    case 'feedback_added':
      return 'Added feedback';
    case 'comment_added':
      return 'Added comment';
    case 'reopened':
      return 'Reopened complaint';
    case 'escalated':
      return 'Escalated complaint';
    case 'rated':
      return 'Rated complaint';
    case 'tags_added':
      return 'Added tags';
    default:
      return action;
  }
}
