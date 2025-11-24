# File Upload Progress Feature

## Overview

The FileUpload component now supports displaying upload progress for files being uploaded. This provides visual feedback to users during the upload process.

## Features

- **Progress Bar**: Visual progress indicator showing upload percentage (0-100%)
- **Status Icons**: Different icons for uploading, completed, and error states
- **Error Handling**: Display error messages when uploads fail
- **Smooth Animations**: Progress bar animates smoothly as upload progresses

## Usage

### Basic Example

```typescript
import { FileUpload, FileUploadProgress } from '@/components/ui/file-upload';
import { useState } from 'react';

function MyComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);

  const handleFilesSelected = async (newFiles: File[]) => {
    // Initialize progress for each file
    const initialProgress: FileUploadProgress[] = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(initialProgress);

    // Simulate upload for each file
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      
      try {
        // Simulate upload with progress updates
        await simulateUpload(file, (progress) => {
          setUploadProgress(prev => 
            prev.map((p, idx) => 
              idx === i ? { ...p, progress } : p
            )
          );
        });

        // Mark as completed
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === i ? { ...p, progress: 100, status: 'completed' } : p
          )
        );

        // Add to completed files after a short delay
        setTimeout(() => {
          setFiles(prev => [...prev, file]);
          setUploadProgress(prev => prev.filter((_, idx) => idx !== i));
        }, 500);

      } catch (error) {
        // Mark as error
        setUploadProgress(prev => 
          prev.map((p, idx) => 
            idx === i ? { 
              ...p, 
              status: 'error', 
              error: 'Upload failed. Please try again.' 
            } : p
          )
        );
      }
    }
  };

  return (
    <FileUpload
      files={files}
      uploadProgress={uploadProgress}
      onFilesSelected={handleFilesSelected}
      onFileRemove={(file) => setFiles(prev => prev.filter(f => f !== file))}
    />
  );
}

// Helper function to simulate upload with progress
function simulateUpload(
  file: File, 
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });
}
```

### With Real Supabase Upload

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

async function uploadFileWithProgress(
  file: File,
  complaintId: string,
  onProgress: (progress: number) => void
): Promise<string> {
  const supabase = createClientComponentClient();
  
  // Upload to Supabase Storage
  const filePath = `${complaintId}/${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('complaint-attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      // Note: Supabase doesn't provide native progress callbacks
      // For real progress, you'd need to implement chunked uploads
      // or use XMLHttpRequest with progress events
    });

  if (error) throw error;
  
  // Simulate progress for now (in production, implement real progress tracking)
  onProgress(100);
  
  return data.path;
}
```

## API Reference

### FileUploadProgress Interface

```typescript
interface FileUploadProgress {
  file: File;              // The file being uploaded
  progress: number;        // Upload progress (0-100)
  status: 'uploading' | 'completed' | 'error';  // Current status
  error?: string;          // Error message if status is 'error'
}
```

### FileUpload Props

```typescript
interface FileUploadProps {
  files?: File[];                      // Completed/selected files
  uploadProgress?: FileUploadProgress[]; // Files currently uploading
  onFilesSelected?: (files: File[]) => void;
  onFileRemove?: (file: File) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}
```

## Visual States

### Uploading State
- Shows animated spinner icon
- Displays progress bar with percentage
- Shows "Uploading..." text

### Completed State
- Shows green checkmark icon
- File moves to "Selected Files" section
- Progress indicator removed

### Error State
- Shows red alert icon
- Displays error message below file info
- File remains in upload progress section

## Best Practices

1. **Initialize Progress Early**: Create progress objects as soon as files are selected
2. **Update Progress Frequently**: Update at least every 5-10% for smooth animation
3. **Handle Errors Gracefully**: Always provide clear error messages
4. **Clean Up After Completion**: Move completed files to the main file list
5. **Prevent Duplicate Uploads**: Disable upload area while files are uploading

## Mock Implementation (UI Development)

For UI-first development without backend integration:

```typescript
function mockUploadWithProgress(
  file: File,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15; // Random progress increments
      
      if (progress >= 100) {
        progress = 100;
        onProgress(progress);
        clearInterval(interval);
        
        // Simulate occasional failures (10% chance)
        if (Math.random() < 0.1) {
          reject(new Error('Upload failed'));
        } else {
          resolve();
        }
      } else {
        onProgress(Math.min(progress, 100));
      }
    }, 300);
  });
}
```

## Accessibility

The progress bar includes proper ARIA attributes:
- `role="progressbar"`
- `aria-valuenow`: Current progress value
- `aria-valuemin="0"`
- `aria-valuemax="100"`

## Future Enhancements

- Pause/resume upload functionality
- Retry failed uploads
- Cancel ongoing uploads
- Batch upload progress (overall progress for multiple files)
- Upload speed indicator
- Estimated time remaining
