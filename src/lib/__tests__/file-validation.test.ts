/**
 * File Validation Tests
 * 
 * Tests for file upload validation logic including size, type, and count validation.
 */

import { describe, it, expect } from 'vitest';
import {
  validateFile,
  validateFiles,
  isFileTypeAllowed,
  isFileSizeValid,
  formatFileSize,
  getFileExtension,
  getFileTypeDescription,
  validateFileCount,
  getAllowedFileTypesString,
  getAllowedExtensionsString,
} from '../file-validation';
import { MAX_FILE_SIZE, MAX_FILES_PER_COMPLAINT } from '../constants';

// Helper to create mock File objects
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('validateFile', () => {
  it('should accept valid JPEG image within size limit', () => {
    const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg'); // 1MB
    const result = validateFile(file);
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept valid PNG image within size limit', () => {
    const file = createMockFile('test.png', 2 * 1024 * 1024, 'image/png'); // 2MB
    const result = validateFile(file);
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept valid PDF within size limit', () => {
    const file = createMockFile('document.pdf', 5 * 1024 * 1024, 'application/pdf'); // 5MB
    const result = validateFile(file);
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject file exceeding size limit', () => {
    const file = createMockFile('large.jpg', MAX_FILE_SIZE + 1, 'image/jpeg');
    const result = validateFile(file);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum size');
    expect(result.error).toContain('10MB');
  });

  it('should reject unsupported file type', () => {
    const file = createMockFile('video.mp4', 1024 * 1024, 'video/mp4');
    const result = validateFile(file);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('unsupported type');
  });

  it('should reject executable file', () => {
    const file = createMockFile('malware.exe', 1024, 'application/x-msdownload');
    const result = validateFile(file);
    
    expect(result.valid).toBe(false);
    expect(result.error).toContain('unsupported type');
  });
});

describe('validateFiles', () => {
  it('should validate multiple valid files', () => {
    const files = [
      createMockFile('image1.jpg', 1024 * 1024, 'image/jpeg'),
      createMockFile('image2.png', 2 * 1024 * 1024, 'image/png'),
      createMockFile('doc.pdf', 3 * 1024 * 1024, 'application/pdf'),
    ];
    
    const result = validateFiles(files);
    
    expect(result.valid).toHaveLength(3);
    expect(result.invalid).toHaveLength(0);
  });

  it('should separate valid and invalid files', () => {
    const files = [
      createMockFile('valid.jpg', 1024 * 1024, 'image/jpeg'),
      createMockFile('too-large.jpg', MAX_FILE_SIZE + 1, 'image/jpeg'),
      createMockFile('invalid.mp4', 1024 * 1024, 'video/mp4'),
      createMockFile('valid.pdf', 2 * 1024 * 1024, 'application/pdf'),
    ];
    
    const result = validateFiles(files);
    
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(2);
    expect(result.valid[0].name).toBe('valid.jpg');
    expect(result.valid[1].name).toBe('valid.pdf');
  });

  it('should enforce maximum file count', () => {
    const files = Array.from({ length: MAX_FILES_PER_COMPLAINT + 2 }, (_, i) =>
      createMockFile(`file${i}.jpg`, 1024 * 1024, 'image/jpeg')
    );
    
    const result = validateFiles(files);
    
    expect(result.valid).toHaveLength(MAX_FILES_PER_COMPLAINT);
    expect(result.invalid).toHaveLength(2);
    expect(result.invalid[0].error).toContain('Maximum');
  });

  it('should consider existing file count', () => {
    const existingCount = 3;
    const files = Array.from({ length: 3 }, (_, i) =>
      createMockFile(`file${i}.jpg`, 1024 * 1024, 'image/jpeg')
    );
    
    const result = validateFiles(files, existingCount);
    
    // With 3 existing and max 5, only 2 new files should be valid
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
  });

  it('should handle empty file array', () => {
    const result = validateFiles([]);
    
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
  });
});

describe('isFileTypeAllowed', () => {
  it('should allow JPEG images', () => {
    expect(isFileTypeAllowed('image/jpeg')).toBe(true);
  });

  it('should allow PNG images', () => {
    expect(isFileTypeAllowed('image/png')).toBe(true);
  });

  it('should allow GIF images', () => {
    expect(isFileTypeAllowed('image/gif')).toBe(true);
  });

  it('should allow PDF documents', () => {
    expect(isFileTypeAllowed('application/pdf')).toBe(true);
  });

  it('should allow Word documents', () => {
    expect(isFileTypeAllowed('application/msword')).toBe(true);
    expect(isFileTypeAllowed('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
  });

  it('should reject video files', () => {
    expect(isFileTypeAllowed('video/mp4')).toBe(false);
  });

  it('should reject audio files', () => {
    expect(isFileTypeAllowed('audio/mp3')).toBe(false);
  });

  it('should reject executable files', () => {
    expect(isFileTypeAllowed('application/x-msdownload')).toBe(false);
  });
});

describe('isFileSizeValid', () => {
  it('should accept file within size limit', () => {
    expect(isFileSizeValid(1024 * 1024)).toBe(true); // 1MB
    expect(isFileSizeValid(MAX_FILE_SIZE)).toBe(true); // Exactly at limit
  });

  it('should reject file exceeding size limit', () => {
    expect(isFileSizeValid(MAX_FILE_SIZE + 1)).toBe(false);
  });

  it('should reject zero-size file', () => {
    expect(isFileSizeValid(0)).toBe(false);
  });

  it('should reject negative size', () => {
    expect(isFileSizeValid(-1)).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });
});

describe('getFileExtension', () => {
  it('should extract file extension', () => {
    expect(getFileExtension('document.pdf')).toBe('pdf');
    expect(getFileExtension('image.jpg')).toBe('jpg');
    expect(getFileExtension('file.tar.gz')).toBe('gz');
  });

  it('should handle files without extension', () => {
    expect(getFileExtension('README')).toBe('');
  });

  it('should handle hidden files', () => {
    expect(getFileExtension('.gitignore')).toBe('gitignore');
  });

  it('should return lowercase extension', () => {
    expect(getFileExtension('IMAGE.JPG')).toBe('jpg');
  });
});

describe('getFileTypeDescription', () => {
  it('should return friendly names for known types', () => {
    expect(getFileTypeDescription('image/jpeg')).toBe('JPEG Image');
    expect(getFileTypeDescription('image/png')).toBe('PNG Image');
    expect(getFileTypeDescription('application/pdf')).toBe('PDF Document');
  });

  it('should return mime type for unknown types', () => {
    expect(getFileTypeDescription('application/unknown')).toBe('application/unknown');
  });
});

describe('validateFileCount', () => {
  it('should accept valid file count', () => {
    const result = validateFileCount(2, 2);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject exceeding file count', () => {
    const result = validateFileCount(3, 3);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Maximum');
  });

  it('should accept exactly at limit', () => {
    const result = validateFileCount(0, MAX_FILES_PER_COMPLAINT);
    expect(result.valid).toBe(true);
  });
});

describe('getAllowedFileTypesString', () => {
  it('should return comma-separated mime types', () => {
    const result = getAllowedFileTypesString();
    expect(result).toContain('image/jpeg');
    expect(result).toContain('application/pdf');
    expect(result).toContain(',');
  });
});

describe('getAllowedExtensionsString', () => {
  it('should return user-friendly extension list', () => {
    const result = getAllowedExtensionsString();
    expect(result).toContain('.jpg');
    expect(result).toContain('.pdf');
    expect(result).toContain('.doc');
  });
});
