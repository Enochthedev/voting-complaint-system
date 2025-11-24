/**
 * File Preview Visual Test Component
 * 
 * This component demonstrates the file preview functionality
 * for both image and non-image files in the FileUpload component.
 */

'use client';

import * as React from 'react';
import { FileUpload } from '../file-upload';

// Helper to create mock File objects
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

export function FilePreviewVisualTest() {
  const [files, setFiles] = React.useState<File[]>([
    // Image files - should show thumbnails
    createMockFile('vacation-photo.jpg', 2 * 1024 * 1024, 'image/jpeg'),
    createMockFile('screenshot.png', 1.5 * 1024 * 1024, 'image/png'),
    createMockFile('animation.gif', 500 * 1024, 'image/gif'),
    
    // Document files - should show file icons
    createMockFile('report.pdf', 3 * 1024 * 1024, 'application/pdf'),
    createMockFile('essay.docx', 1 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
  ]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([...files, ...newFiles]);
  };

  const handleFileRemove = (fileToRemove: File) => {
    setFiles(files.filter(f => f !== fileToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">File Preview Visual Test</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          This page demonstrates the file preview functionality in the FileUpload component.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Preview Features</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            <strong>Image Files (JPEG, PNG, GIF):</strong> Display thumbnail previews
          </li>
          <li>
            <strong>Document Files (PDF, DOC, DOCX):</strong> Display file type icons
          </li>
          <li>
            <strong>File Information:</strong> Shows file name, size, and type
          </li>
          <li>
            <strong>Remove Button:</strong> Allows removing files before submission
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold mb-4">File Upload with Previews</h2>
        <FileUpload
          files={files}
          onFilesSelected={handleFilesSelected}
          onFileRemove={handleFileRemove}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Files ({files.length})</h2>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(
              files.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                isImage: f.type.startsWith('image/'),
              })),
              null,
              2
            )}
          </pre>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Implementation Details</h2>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <strong>Image Preview:</strong> Uses <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">URL.createObjectURL(file)</code> to generate temporary URLs for image thumbnails
            </p>
            <p>
              <strong>Memory Management:</strong> Automatically revokes object URLs after image loads to prevent memory leaks
            </p>
            <p>
              <strong>File Icons:</strong> Uses Lucide React icons for non-image files
            </p>
            <p>
              <strong>Responsive Design:</strong> Previews adapt to different screen sizes
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Observe the pre-loaded files showing different preview types</li>
          <li>Try adding new image files - they should show thumbnails</li>
          <li>Try adding PDF or Word documents - they should show file icons</li>
          <li>Verify file information (name, size, type) is displayed correctly</li>
          <li>Test the remove button on each file</li>
          <li>Check that the component works in both light and dark modes</li>
        </ol>
      </div>
    </div>
  );
}
