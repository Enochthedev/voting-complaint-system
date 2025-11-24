/**
 * Example component demonstrating file upload with progress tracking
 * This is for reference and testing purposes during UI development
 */

'use client';

import * as React from 'react';
import { FileUpload, FileUploadProgress } from '../file-upload';

export function FileUploadProgressExample() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState<FileUploadProgress[]>([]);

  /**
   * Simulates file upload with progress updates
   * In production, this would be replaced with actual Supabase upload
   */
  const simulateUpload = (
    file: File,
    index: number
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;

      const interval = setInterval(() => {
        // Simulate random progress increments
        progress += Math.random() * 20;

        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Update to completed status
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === index
                ? { ...p, progress: 100, status: 'completed' as const }
                : p
            )
          );

          // Simulate 10% failure rate for testing error states
          if (Math.random() < 0.1) {
            setTimeout(() => {
              setUploadProgress((prev) =>
                prev.map((p, idx) =>
                  idx === index
                    ? {
                        ...p,
                        status: 'error' as const,
                        error: 'Upload failed. Please try again.',
                      }
                    : p
                )
              );
              reject(new Error('Upload failed'));
            }, 200);
          } else {
            // Move to completed files after a short delay
            setTimeout(() => {
              setFiles((prev) => [...prev, file]);
              setUploadProgress((prev) => prev.filter((_, idx) => idx !== index));
              resolve();
            }, 500);
          }
        } else {
          // Update progress
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === index ? { ...p, progress: Math.min(progress, 100) } : p
            )
          );
        }
      }, 300); // Update every 300ms
    });
  };

  const handleFilesSelected = async (newFiles: File[]) => {
    // Initialize progress tracking for each file
    const initialProgress: FileUploadProgress[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadProgress((prev) => [...prev, ...initialProgress]);

    // Start upload simulation for each file
    const startIndex = uploadProgress.length;
    newFiles.forEach((file, index) => {
      simulateUpload(file, startIndex + index).catch((error) => {
        console.error('Upload failed:', error);
      });
    });
  };

  const handleFileRemove = (fileToRemove: File) => {
    setFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const handleRetryUpload = (index: number) => {
    const progressItem = uploadProgress[index];
    if (progressItem && progressItem.status === 'error') {
      // Reset to uploading state
      setUploadProgress((prev) =>
        prev.map((p, idx) =>
          idx === index
            ? { ...p, progress: 0, status: 'uploading' as const, error: undefined }
            : p
        )
      );

      // Retry upload
      simulateUpload(progressItem.file, index).catch((error) => {
        console.error('Retry failed:', error);
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">File Upload with Progress</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This example demonstrates the file upload component with progress tracking.
          Upload progress is simulated for UI development purposes.
        </p>
      </div>

      <FileUpload
        files={files}
        uploadProgress={uploadProgress}
        onFilesSelected={handleFilesSelected}
        onFileRemove={handleFileRemove}
      />

      {/* Debug Info */}
      <div className="mt-8 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
        <div className="space-y-1 text-xs font-mono">
          <p>Completed Files: {files.length}</p>
          <p>Uploading Files: {uploadProgress.filter(p => p.status === 'uploading').length}</p>
          <p>Failed Uploads: {uploadProgress.filter(p => p.status === 'error').length}</p>
        </div>
      </div>

      {/* Retry Failed Uploads */}
      {uploadProgress.some(p => p.status === 'error') && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              uploadProgress.forEach((p, idx) => {
                if (p.status === 'error') {
                  handleRetryUpload(idx);
                }
              });
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Retry All Failed Uploads
          </button>
        </div>
      )}
    </div>
  );
}
