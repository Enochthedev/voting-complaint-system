/**
 * FileUpload Component Tests
 *
 * Tests for the FileUpload UI component including drag-and-drop,
 * file selection, validation display, and file removal.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from '../file-upload';
import { MAX_FILES_PER_COMPLAINT } from '@/lib/constants';

// Helper to create mock File objects
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('FileUpload Component', () => {
  it('should render upload area with instructions', () => {
    render(<FileUpload />);

    expect(screen.getByText(/Drag and drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/browse/i)).toBeInTheDocument();
  });

  it('should display file size and count limits', () => {
    render(<FileUpload />);

    expect(screen.getByText(/Max 10MB per file/i)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${MAX_FILES_PER_COMPLAINT} files total`, 'i'))
    ).toBeInTheDocument();
  });

  it('should display allowed file types', () => {
    render(<FileUpload />);

    expect(screen.getByText(/\.jpg, \.jpeg, \.png, \.gif/i)).toBeInTheDocument();
    expect(screen.getByText(/\.pdf/i)).toBeInTheDocument();
  });

  it('should call onFilesSelected when valid files are added', () => {
    const onFilesSelected = vi.fn();
    render(<FileUpload onFilesSelected={onFilesSelected} />);

    const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
    const input = screen.getByLabelText('File upload input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('should display validation errors for invalid files', () => {
    render(<FileUpload />);

    // Create a file that's too large
    const largeFile = createMockFile('large.jpg', 11 * 1024 * 1024, 'image/jpeg');
    const input = screen.getByLabelText('File upload input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText(/exceeds maximum size/i)).toBeInTheDocument();
  });

  it('should display selected files', () => {
    const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
    render(<FileUpload files={[file]} />);

    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    expect(screen.getByText(/1 MB/i)).toBeInTheDocument();
  });

  it('should call onFileRemove when remove button is clicked', () => {
    const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
    const onFileRemove = vi.fn();

    render(<FileUpload files={[file]} onFileRemove={onFileRemove} />);

    const removeButton = screen.getByLabelText('Remove test.jpg');
    fireEvent.click(removeButton);

    expect(onFileRemove).toHaveBeenCalledWith(file);
  });

  it('should show file count indicator', () => {
    const files = [
      createMockFile('file1.jpg', 1024, 'image/jpeg'),
      createMockFile('file2.jpg', 1024, 'image/jpeg'),
    ];

    render(<FileUpload files={files} />);

    expect(screen.getByText(`Selected Files (2/${MAX_FILES_PER_COMPLAINT})`)).toBeInTheDocument();
  });

  it('should disable upload when disabled prop is true', () => {
    render(<FileUpload disabled={true} />);

    const input = screen.getByLabelText('File upload input') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('should show max file limit message when limit reached', () => {
    const files = Array.from({ length: MAX_FILES_PER_COMPLAINT }, (_, i) =>
      createMockFile(`file${i}.jpg`, 1024, 'image/jpeg')
    );

    render(<FileUpload files={files} />);

    expect(screen.getByText(/Maximum file limit reached/i)).toBeInTheDocument();
  });

  it('should display help text when no files are selected', () => {
    render(<FileUpload />);

    expect(screen.getByText(/File Upload Guidelines/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum.*files per complaint/i)).toBeInTheDocument();
  });

  it('should allow dismissing validation errors', () => {
    render(<FileUpload />);

    // Add invalid file
    const invalidFile = createMockFile('test.mp4', 1024, 'video/mp4');
    const input = screen.getByLabelText('File upload input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [invalidFile] } });

    // Error should be visible
    expect(screen.getByText(/unsupported type/i)).toBeInTheDocument();

    // Dismiss error
    const dismissButton = screen.getByLabelText('Dismiss error');
    fireEvent.click(dismissButton);

    // Error should be gone
    expect(screen.queryByText(/unsupported type/i)).not.toBeInTheDocument();
  });

  it('should show image preview for image files', () => {
    const imageFile = createMockFile('image.jpg', 1024, 'image/jpeg');
    render(<FileUpload files={[imageFile]} />);

    const img = screen.getByAltText('image.jpg');
    expect(img).toBeInTheDocument();
  });

  it('should show file icon for non-image files', () => {
    const pdfFile = createMockFile('document.pdf', 1024, 'application/pdf');
    render(<FileUpload files={[pdfFile]} />);

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    // File icon should be present (we can't easily test for the icon itself)
  });

  describe('Upload Progress', () => {
    it('should display upload progress for uploading files', () => {
      const file = createMockFile('uploading.jpg', 1024 * 1024, 'image/jpeg');
      const uploadProgress = [
        {
          file,
          progress: 45,
          status: 'uploading' as const,
        },
      ];

      render(<FileUpload uploadProgress={uploadProgress} />);

      expect(screen.getByText('uploading.jpg')).toBeInTheDocument();
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should show progress bar with correct width', () => {
      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const uploadProgress = [
        {
          file,
          progress: 60,
          status: 'uploading' as const,
        },
      ];

      render(<FileUpload uploadProgress={uploadProgress} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveStyle({ width: '60%' });
    });

    it('should display completed status for finished uploads', () => {
      const file = createMockFile('completed.jpg', 1024, 'image/jpeg');
      const uploadProgress = [
        {
          file,
          progress: 100,
          status: 'completed' as const,
        },
      ];

      render(<FileUpload uploadProgress={uploadProgress} />);

      expect(screen.getByText('completed.jpg')).toBeInTheDocument();
      // Check for completed status (green checkmark icon should be present)
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });

    it('should display error status and message for failed uploads', () => {
      const file = createMockFile('failed.jpg', 1024, 'image/jpeg');
      const uploadProgress = [
        {
          file,
          progress: 50,
          status: 'error' as const,
          error: 'Upload failed. Please try again.',
        },
      ];

      render(<FileUpload uploadProgress={uploadProgress} />);

      expect(screen.getByText('failed.jpg')).toBeInTheDocument();
      expect(screen.getByText('Upload failed. Please try again.')).toBeInTheDocument();
    });

    it('should show upload count indicator', () => {
      const files = [
        createMockFile('file1.jpg', 1024, 'image/jpeg'),
        createMockFile('file2.jpg', 1024, 'image/jpeg'),
        createMockFile('file3.jpg', 1024, 'image/jpeg'),
      ];

      const uploadProgress = files.map((file, index) => ({
        file,
        progress: index < 2 ? 100 : 50,
        status: (index < 2 ? 'completed' : 'uploading') as const,
      }));

      render(<FileUpload uploadProgress={uploadProgress} />);

      expect(screen.getByText('Uploading Files (2/3)')).toBeInTheDocument();
    });

    it('should display multiple files with different progress states', () => {
      const uploadProgress = [
        {
          file: createMockFile('uploading.jpg', 1024, 'image/jpeg'),
          progress: 30,
          status: 'uploading' as const,
        },
        {
          file: createMockFile('completed.jpg', 1024, 'image/jpeg'),
          progress: 100,
          status: 'completed' as const,
        },
        {
          file: createMockFile('failed.jpg', 1024, 'image/jpeg'),
          progress: 60,
          status: 'error' as const,
          error: 'Network error',
        },
      ];

      render(<FileUpload uploadProgress={uploadProgress} />);

      expect(screen.getByText('uploading.jpg')).toBeInTheDocument();
      expect(screen.getByText('completed.jpg')).toBeInTheDocument();
      expect(screen.getByText('failed.jpg')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should show both upload progress and completed files sections', () => {
      const completedFile = createMockFile('completed.jpg', 1024, 'image/jpeg');
      const uploadingFile = createMockFile('uploading.jpg', 1024, 'image/jpeg');

      const uploadProgress = [
        {
          file: uploadingFile,
          progress: 50,
          status: 'uploading' as const,
        },
      ];

      render(<FileUpload files={[completedFile]} uploadProgress={uploadProgress} />);

      expect(screen.getByText('Uploading Files (0/1)')).toBeInTheDocument();
      expect(screen.getByText('Selected Files (1/5)')).toBeInTheDocument();
      expect(screen.getByText('completed.jpg')).toBeInTheDocument();
      expect(screen.getByText('uploading.jpg')).toBeInTheDocument();
    });
  });
});
