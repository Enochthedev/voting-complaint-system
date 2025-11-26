/**
 * Attachment Export Utilities
 * Handles downloading and packaging attachments for export
 * Validates: Requirements AC20 (Export Functionality)
 */

import JSZip from 'jszip';
import { downloadAttachment, getAttachmentUrl } from '../attachment-upload';
import type { ComplaintAttachment } from '@/types/database.types';

/**
 * Download a single attachment as a blob
 *
 * @param attachment - The attachment metadata
 * @returns Blob data or null if error
 */
export async function downloadAttachmentForExport(
  attachment: ComplaintAttachment
): Promise<Blob | null> {
  try {
    const blob = await downloadAttachment(attachment.file_path);
    return blob;
  } catch (error) {
    console.error(`Error downloading attachment ${attachment.id}:`, error);
    return null;
  }
}

/**
 * Download multiple attachments
 *
 * @param attachments - Array of attachment metadata
 * @param onProgress - Optional callback for progress updates
 * @returns Map of attachment IDs to blobs
 */
export async function downloadAttachmentsForExport(
  attachments: ComplaintAttachment[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, Blob>> {
  const results = new Map<string, Blob>();

  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    const blob = await downloadAttachmentForExport(attachment);

    if (blob) {
      results.set(attachment.id, blob);
    }

    if (onProgress) {
      onProgress(i + 1, attachments.length);
    }
  }

  return results;
}

/**
 * Create a ZIP file containing attachments
 *
 * @param attachments - Array of attachment metadata
 * @param attachmentBlobs - Map of attachment IDs to blobs
 * @param folderName - Optional folder name within the ZIP
 * @returns ZIP blob or null if error
 */
export async function createAttachmentsZip(
  attachments: ComplaintAttachment[],
  attachmentBlobs: Map<string, Blob>,
  folderName?: string
): Promise<Blob | null> {
  try {
    const zip = new JSZip();
    const folder = folderName ? zip.folder(folderName) : zip;

    if (!folder) {
      console.error('Failed to create ZIP folder');
      return null;
    }

    // Add each attachment to the ZIP
    for (const attachment of attachments) {
      const blob = attachmentBlobs.get(attachment.id);
      if (blob) {
        // Use original filename, add index if duplicate names exist
        folder.file(attachment.file_name, blob);
      }
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    return null;
  }
}

/**
 * Export attachments for a single complaint as a ZIP file
 *
 * @param complaintId - The complaint ID
 * @param attachments - Array of attachment metadata
 * @param onProgress - Optional callback for progress updates
 */
export async function exportComplaintAttachments(
  complaintId: string,
  attachments: ComplaintAttachment[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (attachments.length === 0) {
    console.warn('No attachments to export');
    return;
  }

  try {
    // Download all attachments
    const attachmentBlobs = await downloadAttachmentsForExport(attachments, onProgress);

    if (attachmentBlobs.size === 0) {
      console.error('Failed to download any attachments');
      return;
    }

    // Create ZIP file
    const zipBlob = await createAttachmentsZip(
      attachments,
      attachmentBlobs,
      `complaint_${complaintId}_attachments`
    );

    if (!zipBlob) {
      console.error('Failed to create ZIP file');
      return;
    }

    // Download the ZIP file
    const link = document.createElement('a');
    const url = URL.createObjectURL(zipBlob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `complaint_${complaintId}_attachments_${new Date().getTime()}.zip`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting attachments:', error);
    throw error;
  }
}

/**
 * Export attachments for multiple complaints as a ZIP file
 * Each complaint's attachments are in a separate folder
 *
 * @param complaints - Array of complaint IDs and their attachments
 * @param onProgress - Optional callback for progress updates
 */
export async function exportMultipleComplaintsAttachments(
  complaints: Array<{
    id: string;
    title: string;
    attachments: ComplaintAttachment[];
  }>,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    const zip = new JSZip();
    let processedCount = 0;
    const totalAttachments = complaints.reduce((sum, c) => sum + c.attachments.length, 0);

    // Process each complaint
    for (const complaint of complaints) {
      if (complaint.attachments.length === 0) {
        continue;
      }

      // Create folder for this complaint
      const folderName = `complaint_${complaint.id}_${sanitizeFolderName(complaint.title)}`;
      const folder = zip.folder(folderName);

      if (!folder) {
        console.error(`Failed to create folder for complaint ${complaint.id}`);
        continue;
      }

      // Download and add attachments
      for (const attachment of complaint.attachments) {
        const blob = await downloadAttachmentForExport(attachment);

        if (blob) {
          folder.file(attachment.file_name, blob);
        }

        processedCount++;
        if (onProgress) {
          onProgress(processedCount, totalAttachments);
        }
      }
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(zipBlob);

    link.setAttribute('href', url);
    link.setAttribute('download', `complaints_attachments_${new Date().getTime()}.zip`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting multiple complaints attachments:', error);
    throw error;
  }
}

/**
 * Sanitize folder name by removing invalid characters
 */
function sanitizeFolderName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

/**
 * Get attachment URLs for embedding in exports
 *
 * @param attachments - Array of attachment metadata
 * @returns Map of attachment IDs to signed URLs
 */
export async function getAttachmentUrls(
  attachments: ComplaintAttachment[]
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();

  for (const attachment of attachments) {
    const url = await getAttachmentUrl(attachment.file_path);
    if (url) {
      urls.set(attachment.id, url);
    }
  }

  return urls;
}
