# Attachment Upload - Quick Start Guide

## Overview

This guide shows you how to quickly integrate attachment upload functionality into your components.

## Basic Usage

### 1. Import the Hook

```typescript
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';
```

### 2. Use in Your Component

```typescript
function ComplaintForm() {
  const {
    uploadProgress,
    uploadedAttachments,
    isUploading,
    uploadFiles,
  } = useAttachmentUpload();

  const handleFilesSelected = async (files: File[]) => {
    await uploadFiles(files, complaintId, userId);
  };

  return (
    <FileUpload
      onFilesSelected={handleFilesSelected}
      uploadProgress={uploadProgress}
      disabled={isUploading}
    />
  );
}
```

## Complete Example

```typescript
'use client';

import { useState } from 'react';
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';

export function MyComplaintForm() {
  const [files, setFiles] = useState<File[]>([]);
  
  const {
    uploadProgress,
    uploadedAttachments,
    isUploading,
    uploadFiles,
    removeAttachment,
  } = useAttachmentUpload();

  const handleSubmit = async () => {
    // Upload files before submitting form
    if (files.length > 0) {
      await uploadFiles(files, 'complaint-id', 'user-id');
    }

    // Submit form with attachment IDs
    const attachmentIds = uploadedAttachments.map(att => att.id);
    console.log('Submitting with attachments:', attachmentIds);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields... */}

      <FileUpload
        files={files}
        uploadProgress={uploadProgress}
        onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
        onFileRemove={(file) => setFiles(files.filter(f => f !== file))}
        disabled={isUploading}
      />

      {uploadedAttachments.length > 0 && (
        <div className="text-sm text-green-600">
          ✓ {uploadedAttachments.length} file(s) uploaded
        </div>
      )}

      <Button type="submit" disabled={isUploading}>
        Submit
      </Button>
    </form>
  );
}
```

## Direct API Usage

If you prefer not to use the hook:

```typescript
import { uploadAttachment } from '@/lib/attachment-upload';

async function handleUpload(file: File) {
  const result = await uploadAttachment(
    file,
    'complaint-id',
    'user-id',
    (progress) => {
      console.log(`Upload: ${progress}%`);
    }
  );

  if (result.success) {
    console.log('Uploaded:', result.attachment);
  } else {
    console.error('Error:', result.error);
  }
}
```

## Retrieving Attachments

```typescript
import { getComplaintAttachments, getAttachmentUrl } from '@/lib/attachment-upload';

async function loadAttachments(complaintId: string) {
  const attachments = await getComplaintAttachments(complaintId);
  
  if (attachments) {
    for (const attachment of attachments) {
      const url = await getAttachmentUrl(attachment.file_path);
      console.log(`${attachment.file_name}: ${url}`);
    }
  }
}
```

## Deleting Attachments

```typescript
import { deleteAttachment } from '@/lib/attachment-upload';

async function handleDelete(attachmentId: string, filePath: string) {
  const result = await deleteAttachment(attachmentId, filePath);
  
  if (result.success) {
    console.log('Deleted successfully');
  } else {
    console.error('Delete failed:', result.error);
  }
}
```

## Development vs Production

### During UI Development (Phase 3-11)

Use the mock implementation:

```typescript
// This is already configured in the hook
// No changes needed - mock is used automatically
```

### In Production (Phase 12)

The real implementation will be used automatically. Just ensure:

1. Environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Storage bucket exists: `complaint-attachments`

3. RLS policies are applied

4. User is authenticated

## Common Patterns

### Upload on Form Submit

```typescript
const handleSubmit = async (formData) => {
  // Upload files first
  if (files.length > 0) {
    await uploadFiles(files, complaintId, userId);
  }
  
  // Then submit form
  await submitComplaint({
    ...formData,
    attachmentIds: uploadedAttachments.map(a => a.id),
  });
};
```

### Upload Immediately on Selection

```typescript
const handleFilesSelected = async (newFiles: File[]) => {
  // Upload immediately when files are selected
  await uploadFiles(newFiles, complaintId, userId);
};
```

### Show Upload Progress

```typescript
{uploadProgress.map((progress, index) => (
  <div key={index}>
    {progress.file.name}: {progress.progress}%
    {progress.status === 'error' && (
      <span className="text-red-500">{progress.error}</span>
    )}
  </div>
))}
```

## Error Handling

```typescript
const handleUpload = async (files: File[]) => {
  try {
    await uploadFiles(files, complaintId, userId);
    
    // Check for any errors
    const hasErrors = uploadProgress.some(p => p.status === 'error');
    if (hasErrors) {
      alert('Some files failed to upload');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed. Please try again.');
  }
};
```

## Tips

1. **Sequential Uploads**: Files are uploaded one at a time to avoid overwhelming the server
2. **Progress Tracking**: Use `uploadProgress` to show real-time progress
3. **Cleanup**: Failed uploads are automatically cleaned up
4. **Validation**: Files are validated before upload (see `file-validation.ts`)
5. **Security**: RLS policies ensure users can only access authorized attachments

## Next Steps

- See `ATTACHMENT_UPLOAD_IMPLEMENTATION.md` for detailed documentation
- Check `complaint-form-with-upload.tsx` for a complete example
- Review `file-validation.ts` for validation rules
- Test with different file types and sizes

## Troubleshooting

**Files not uploading?**
- Check console for errors
- Verify Supabase connection
- Ensure storage bucket exists
- Check RLS policies

**Progress not updating?**
- Ensure `onProgress` callback is provided
- Check component re-renders

**Database errors?**
- Verify table schema matches types
- Check RLS policies allow insert
- Ensure user is authenticated

**Storage errors?**
- Check bucket configuration
- Verify file size limits
- Ensure storage policies allow upload
