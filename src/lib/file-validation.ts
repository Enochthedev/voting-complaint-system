/**
 * File Validation Utilities
 *
 * Provides validation functions for file uploads in the complaint system.
 * Validates file size, type, and count according to system constraints.
 */

import { MAX_FILE_SIZE, MAX_FILES_PER_COMPLAINT, ALLOWED_FILE_TYPES } from './constants';

export interface FileValidationError {
  file: File;
  error: string;
}

export interface FileValidationResult {
  valid: File[];
  invalid: FileValidationError[];
}

/**
 * Validates a single file against size and type constraints
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum size of ${maxSizeMB}MB (${formatFileSize(file.size)} provided)`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File "${file.name}" has unsupported type "${file.type}". Allowed types: images (JPEG, PNG, GIF), PDF, and Word documents.`,
    };
  }

  return { valid: true };
}

/**
 * Validates multiple files against size, type, and count constraints
 */
export function validateFiles(files: File[], existingFileCount: number = 0): FileValidationResult {
  const result: FileValidationResult = {
    valid: [],
    invalid: [],
  };

  // Check total file count
  const totalFiles = existingFileCount + files.length;
  if (totalFiles > MAX_FILES_PER_COMPLAINT) {
    const excess = totalFiles - MAX_FILES_PER_COMPLAINT;
    const filesToValidate = files.slice(0, files.length - excess);
    const rejectedFiles = files.slice(files.length - excess);

    // Mark excess files as invalid
    rejectedFiles.forEach((file) => {
      result.invalid.push({
        file,
        error: `Maximum ${MAX_FILES_PER_COMPLAINT} files allowed per complaint. This file exceeds the limit.`,
      });
    });

    // Continue validating the files that fit within the limit
    files = filesToValidate;
  }

  // Validate each file
  files.forEach((file) => {
    const validation = validateFile(file);
    if (validation.valid) {
      result.valid.push(file);
    } else {
      result.invalid.push({
        file,
        error: validation.error!,
      });
    }
  });

  return result;
}

/**
 * Checks if a file type is allowed
 */
export function isFileTypeAllowed(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType);
}

/**
 * Checks if a file size is within limits
 */
export function isFileSizeValid(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= MAX_FILE_SIZE;
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Gets a user-friendly file type description
 */
export function getFileTypeDescription(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'application/pdf': 'PDF Document',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  };

  return typeMap[mimeType] || mimeType;
}

/**
 * Validates file count against maximum allowed
 */
export function validateFileCount(
  currentCount: number,
  additionalCount: number
): { valid: boolean; error?: string } {
  const totalCount = currentCount + additionalCount;

  if (totalCount > MAX_FILES_PER_COMPLAINT) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES_PER_COMPLAINT} files allowed per complaint. You currently have ${currentCount} file(s) and are trying to add ${additionalCount} more.`,
    };
  }

  return { valid: true };
}

/**
 * Gets allowed file types as a string for input accept attribute
 */
export function getAllowedFileTypesString(): string {
  return ALLOWED_FILE_TYPES.join(',');
}

/**
 * Gets allowed file extensions as a user-friendly string
 */
export function getAllowedExtensionsString(): string {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
  return extensions.join(', ');
}
