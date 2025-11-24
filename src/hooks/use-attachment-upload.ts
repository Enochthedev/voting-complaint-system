/**
 * React Hook for Attachment Upload
 * 
 * Provides a convenient interface for uploading attachments with progress tracking
 */

import { useState, useCallback } from 'react';
import {
  uploadAttachment,
  uploadMultipleAttachments,
  deleteAttachment,
  type UploadResult,
} from '@/lib/attachment-upload';
import type { ComplaintAttachment } from '@/types/database.types';

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  attachment?: ComplaintAttachment;
}

export interface UseAttachmentUploadReturn {
  uploadProgress: FileUploadProgress[];
  uploadedAttachments: ComplaintAttachment[];
  isUploading: boolean;
  uploadFiles: (files: File[], complaintId: string, userId: string) => Promise<void>;
  removeAttachment: (attachmentId: string, filePath: string) => Promise<boolean>;
  clearProgress: () => void;
  reset: () => void;
}

/**
 * Hook for managing attachment uploads with progress tracking
 * 
 * @returns Upload state and control functions
 */
export function useAttachmentUpload(): UseAttachmentUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<ComplaintAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Upload multiple files with progress tracking
   */
  const uploadFiles = useCallback(
    async (files: File[], complaintId: string, userId: string) => {
      if (files.length === 0) return;

      setIsUploading(true);

      // Initialize progress for all files
      const initialProgress: FileUploadProgress[] = files.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));
      setUploadProgress(initialProgress);

      try {
        // Upload files sequentially to avoid overwhelming the server
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Update progress for current file
          setUploadProgress((prev) =>
            prev.map((item, index) =>
              index === i
                ? { ...item, status: 'uploading' as const, progress: 0 }
                : item
            )
          );

          // Upload the file
          const result = await uploadAttachment(
            file,
            complaintId,
            userId,
            (progress) => {
              setUploadProgress((prev) =>
                prev.map((item, index) =>
                  index === i ? { ...item, progress } : item
                )
              );
            }
          );

          // Update progress based on result
          if (result.success && result.attachment) {
            setUploadProgress((prev) =>
              prev.map((item, index) =>
                index === i
                  ? {
                      ...item,
                      status: 'completed' as const,
                      progress: 100,
                      attachment: result.attachment,
                    }
                  : item
              )
            );
            setUploadedAttachments((prev) => [...prev, result.attachment!]);
          } else {
            setUploadProgress((prev) =>
              prev.map((item, index) =>
                index === i
                  ? {
                      ...item,
                      status: 'error' as const,
                      error: result.error || 'Upload failed',
                    }
                  : item
              )
            );
          }
        }
      } catch (error) {
        console.error('Error during file upload:', error);
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  /**
   * Remove an uploaded attachment
   */
  const removeAttachment = useCallback(
    async (attachmentId: string, filePath: string): Promise<boolean> => {
      const result = await deleteAttachment(attachmentId, filePath);

      if (result.success) {
        // Remove from uploaded attachments
        setUploadedAttachments((prev) =>
          prev.filter((att) => att.id !== attachmentId)
        );
        // Remove from progress
        setUploadProgress((prev) =>
          prev.filter((item) => item.attachment?.id !== attachmentId)
        );
        return true;
      }

      return false;
    },
    []
  );

  /**
   * Clear upload progress (keeps uploaded attachments)
   */
  const clearProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setUploadProgress([]);
    setUploadedAttachments([]);
    setIsUploading(false);
  }, []);

  return {
    uploadProgress,
    uploadedAttachments,
    isUploading,
    uploadFiles,
    removeAttachment,
    clearProgress,
    reset,
  };
}
