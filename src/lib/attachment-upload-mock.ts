/**
 * Mock Attachment Upload Utilities
 * 
 * Mock implementation for UI development phase.
 * This simulates file uploads and database operations without actual API calls.
 * Will be replaced with real implementation in Phase 12.
 */

import type { ComplaintAttachment } from '@/types/database.types';

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  attachmentId?: string;
}

export interface UploadResult {
  success: boolean;
  attachment?: ComplaintAttachment;
  error?: string;
}

/**
 * Mock upload with simulated progress
 */
export async function uploadAttachment(
  file: File,
  complaintId: string,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  // Simulate upload progress
  if (onProgress) {
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress(i);
    }
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Create mock attachment metadata
  const mockAttachment: ComplaintAttachment = {
    id: `mock-attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    complaint_id: complaintId,
    file_name: file.name,
    file_path: `${complaintId}/${Date.now()}-${file.name}`,
    file_size: file.size,
    file_type: file.type,
    uploaded_by: userId,
    created_at: new Date().toISOString(),
  };

  return {
    success: true,
    attachment: mockAttachment,
  };
}

/**
 * Mock multiple file upload
 */
export async function uploadMultipleAttachments(
  files: File[],
  complaintId: string,
  userId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadAttachment(
      file,
      complaintId,
      userId,
      onProgress ? (progress) => onProgress(i, progress) : undefined
    );
    results.push(result);
  }

  return results;
}

/**
 * Mock get signed URL
 */
export async function getAttachmentUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  // Return a mock URL (blob URL for local files)
  return `https://mock-storage.example.com/${filePath}?expires=${expiresIn}`;
}

/**
 * Mock delete attachment
 */
export async function deleteAttachment(
  attachmentId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return { success: true };
}

/**
 * Mock get complaint attachments
 */
export async function getComplaintAttachments(
  complaintId: string
): Promise<ComplaintAttachment[] | null> {
  // Return empty array for mock
  return [];
}

/**
 * Mock download attachment
 */
export async function downloadAttachment(
  filePath: string
): Promise<Blob | null> {
  // Return null for mock
  return null;
}
