/**
 * Attachment Upload Utilities
 *
 * Handles uploading files to Supabase Storage and storing metadata
 * in the complaint_attachments table.
 */

import { supabase } from './supabase';
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
 * Upload a file to Supabase Storage and store metadata in database
 *
 * @param file - The file to upload
 * @param complaintId - The ID of the complaint this attachment belongs to
 * @param userId - The ID of the user uploading the file
 * @param onProgress - Optional callback for upload progress updates
 * @returns Upload result with attachment metadata or error
 */
export async function uploadAttachment(
  file: File,
  complaintId: string,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    // Generate unique file path: complaint-attachments/{complaintId}/{timestamp}-{filename}
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${complaintId}/${timestamp}-${sanitizedFileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('complaint-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return {
        success: false,
        error: `Failed to upload file: ${uploadError.message}`,
      };
    }

    if (onProgress) {
      onProgress(100);
    }

    // Store attachment metadata in database
    const { data: attachmentData, error: dbError } = await supabase
      .from('complaint_attachments')
      .insert({
        complaint_id: complaintId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);

      // Clean up uploaded file if database insert fails
      await supabase.storage.from('complaint-attachments').remove([filePath]);

      return {
        success: false,
        error: `Failed to save attachment metadata: ${dbError.message}`,
      };
    }

    return {
      success: true,
      attachment: attachmentData as ComplaintAttachment,
    };
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Upload multiple files and store their metadata
 *
 * @param files - Array of files to upload
 * @param complaintId - The ID of the complaint
 * @param userId - The ID of the user uploading
 * @param onProgress - Optional callback for individual file progress
 * @returns Array of upload results
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
 * Get a signed URL for downloading an attachment
 *
 * @param filePath - The storage path of the file
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL or null if error
 */
export async function getAttachmentUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('complaint-attachments')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Unexpected error creating signed URL:', error);
    return null;
  }
}

/**
 * Delete an attachment from storage and database
 *
 * @param attachmentId - The ID of the attachment to delete
 * @param filePath - The storage path of the file
 * @returns Success status
 */
export async function deleteAttachment(
  attachmentId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from database first
    const { error: dbError } = await supabase
      .from('complaint_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return {
        success: false,
        error: `Failed to delete attachment metadata: ${dbError.message}`,
      };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('complaint-attachments')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Note: Metadata is already deleted, but file remains in storage
      return {
        success: false,
        error: `Failed to delete file from storage: ${storageError.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error during deletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Get all attachments for a complaint
 *
 * @param complaintId - The ID of the complaint
 * @returns Array of attachments or null if error
 */
export async function getComplaintAttachments(
  complaintId: string
): Promise<ComplaintAttachment[] | null> {
  try {
    const { data, error } = await supabase
      .from('complaint_attachments')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching attachments:', error);
      return null;
    }

    return data as ComplaintAttachment[];
  } catch (error) {
    console.error('Unexpected error fetching attachments:', error);
    return null;
  }
}

/**
 * Download an attachment file
 *
 * @param filePath - The storage path of the file
 * @returns Blob data or null if error
 */
export async function downloadAttachment(filePath: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage.from('complaint-attachments').download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error downloading file:', error);
    return null;
  }
}
