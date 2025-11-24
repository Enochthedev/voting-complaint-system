# Attachment Upload Implementation

## Overview

This document describes the implementation of attachment upload functionality with database metadata storage for the Student Complaint Resolution System.

## Task Completion

**Task 3.2**: Store attachment metadata in database ✅

This task implements the final piece of the file upload system by storing attachment metadata in the `complaint_attachments` table after files are uploaded to Supabase Storage.

## Architecture

### Components

1. **Storage Layer** (`src/lib/attachment-upload.ts`)
   - Handles file uploads to Supabase Storage
   - Stores metadata in `complaint_attachments` table
   - Provides utilities for download, delete, and URL generation

2. **React Hook** (`src/hooks/use-attachment-upload.ts`)
   - Manages upload state and progress tracking
   - Provides convenient interface for React components
   - Handles multiple file uploads sequentially

3. **Mock Implementation** (`src/lib/attachment-upload-mock.ts`)
   - Simulates upload behavior for UI development
   - Used during Phase 3-11 (UI-first development)
   - Will be replaced with real implementation in Phase 12

4. **Enhanced Form** (`src/components/complaints/complaint-form-with-upload.tsx`)
   - Demonstrates integration with complaint form
   - Shows upload progress and status
   - Handles file selection and removal

## Database Schema

### complaint_attachments Table

```sql
CREATE TABLE complaint_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Structure

Files are stored in the `complaint-attachments` bucket with the following structure:

```
complaint-attachments/
├── {complaint-id-1}/
│   ├── {timestamp}-{filename1}.pdf
│   ├── {timestamp}-{filename2}.jpg
│   └── ...
├── {complaint-id-2}/
│   └── ...
```

## API Reference

### uploadAttachment()

Uploads a single file to Supabase Storage and stores metadata in the database.

```typescript
async function uploadAttachment(
  file: File,
  complaintId: string,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult>
```

**Parameters:**
- `file`: The file to upload
- `complaintId`: ID of the complaint this attachment belongs to
- `userId`: ID of the user uploading the file
- `onProgress`: Optional callback for progress updates (0-100)

**Returns:**
```typescript
{
  success: boolean;
  attachment?: ComplaintAttachment;
  error?: string;
}
```

**Example:**
```typescript
const result = await uploadAttachment(
  file,
  'complaint-123',
  'user-456',
  (progress) => console.log(`Upload progress: ${progress}%`)
);

if (result.success) {
  console.log('Uploaded:', result.attachment);
} else {
  console.error('Error:', result.error);
}
```

### uploadMultipleAttachments()

Uploads multiple files sequentially.

```typescript
async function uploadMultipleAttachments(
  files: File[],
  complaintId: string,
  userId: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]>
```

### getAttachmentUrl()

Generates a signed URL for downloading an attachment.

```typescript
async function getAttachmentUrl(
  filePath: string,
  expiresIn?: number
): Promise<string | null>
```

**Parameters:**
- `filePath`: Storage path of the file
- `expiresIn`: URL expiration time in seconds (default: 3600 = 1 hour)

### deleteAttachment()

Deletes an attachment from both storage and database.

```typescript
async function deleteAttachment(
  attachmentId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }>
```

### getComplaintAttachments()

Retrieves all attachments for a complaint.

```typescript
async function getComplaintAttachments(
  complaintId: string
): Promise<ComplaintAttachment[] | null>
```

### downloadAttachment()

Downloads an attachment file as a Blob.

```typescript
async function downloadAttachment(
  filePath: string
): Promise<Blob | null>
```

## React Hook Usage

### useAttachmentUpload()

```typescript
const {
  uploadProgress,      // Array of upload progress for each file
  uploadedAttachments, // Array of successfully uploaded attachments
  isUploading,         // Boolean indicating if upload is in progress
  uploadFiles,         // Function to upload files
  removeAttachment,    // Function to remove an uploaded attachment
  clearProgress,       // Function to clear progress (keeps attachments)
  reset,               // Function to reset all state
} = useAttachmentUpload();
```

**Example:**
```typescript
function MyComponent() {
  const { uploadFiles, uploadProgress, uploadedAttachments } = useAttachmentUpload();

  const handleUpload = async (files: File[]) => {
    await uploadFiles(files, complaintId, userId);
  };

  return (
    <div>
      <FileUpload
        onFilesSelected={handleUpload}
        uploadProgress={uploadProgress}
      />
      <div>
        Uploaded: {uploadedAttachments.length} files
      </div>
    </div>
  );
}
```

## Integration with Complaint Form

The enhanced complaint form (`complaint-form-with-upload.tsx`) demonstrates full integration:

1. **File Selection**: Users select files via drag-and-drop or file picker
2. **Validation**: Files are validated for type and size
3. **Upload**: Files are uploaded when form is submitted
4. **Progress**: Upload progress is displayed in real-time
5. **Metadata**: Attachment metadata is stored in database
6. **Submission**: Form submission includes attachment references

## Error Handling

The implementation includes comprehensive error handling:

1. **Upload Failures**: If storage upload fails, no database record is created
2. **Database Failures**: If database insert fails, uploaded file is deleted from storage
3. **Cleanup**: Failed uploads are automatically cleaned up
4. **User Feedback**: Errors are displayed to users with clear messages

## Security

### Row Level Security (RLS)

The `complaint_attachments` table has RLS policies that:
- Allow students to insert attachments for their own complaints
- Allow lecturers/admins to view all attachments
- Prevent unauthorized access to attachment metadata

### Storage Policies

The `complaint-attachments` bucket has policies that:
- Allow students to upload to their own complaint folders
- Allow lecturers/admins to access all attachments
- Prevent public access to files

## Development Phases

### Phase 3-11: UI Development (Current)

- Use `attachment-upload-mock.ts` for simulated uploads
- Focus on UI/UX and user interactions
- No actual API calls or database operations

### Phase 12: API Integration

- Switch to `attachment-upload.ts` for real uploads
- Connect to actual Supabase Storage and database
- Test end-to-end functionality
- Handle real authentication and authorization

## Migration Guide

To switch from mock to real implementation in Phase 12:

1. Update imports in components:
```typescript
// Change from:
import { uploadAttachment } from '@/lib/attachment-upload-mock';

// To:
import { uploadAttachment } from '@/lib/attachment-upload';
```

2. Replace mock user/complaint IDs with real values from auth context:
```typescript
// Change from:
const MOCK_USER_ID = 'mock-user-id';
const MOCK_COMPLAINT_ID = 'mock-complaint-id';

// To:
const { user } = useAuth();
const userId = user.id;
const complaintId = complaint.id;
```

3. Test all upload scenarios:
   - Single file upload
   - Multiple file upload
   - Large file handling
   - Error scenarios
   - Permission checks

## Testing

### Manual Testing Checklist

- [ ] Upload single file
- [ ] Upload multiple files
- [ ] Upload progress displays correctly
- [ ] File validation works (type, size)
- [ ] Attachment metadata stored in database
- [ ] Files accessible via signed URLs
- [ ] Delete attachment removes file and metadata
- [ ] Error handling displays user-friendly messages
- [ ] RLS policies prevent unauthorized access

### Test Scenarios

1. **Happy Path**: Upload valid files, verify metadata in database
2. **Invalid File Type**: Try uploading unsupported file type
3. **File Too Large**: Try uploading file exceeding size limit
4. **Network Error**: Simulate network failure during upload
5. **Permission Denied**: Try uploading to another user's complaint
6. **Concurrent Uploads**: Upload multiple files simultaneously

## Performance Considerations

1. **Sequential Uploads**: Files are uploaded one at a time to avoid overwhelming the server
2. **Progress Tracking**: Real-time progress updates for better UX
3. **Cleanup**: Failed uploads are automatically cleaned up
4. **Signed URLs**: Use signed URLs with expiration for secure access
5. **Caching**: Consider caching attachment metadata for frequently accessed complaints

## Future Enhancements

1. **Chunked Uploads**: Support for very large files (>10MB)
2. **Resume Capability**: Allow resuming interrupted uploads
3. **Image Optimization**: Automatic image compression and thumbnail generation
4. **Virus Scanning**: Integrate virus scanning for uploaded files
5. **Batch Operations**: Support bulk attachment operations
6. **Preview Generation**: Generate previews for documents and images

## Related Files

- `src/lib/attachment-upload.ts` - Real implementation
- `src/lib/attachment-upload-mock.ts` - Mock implementation
- `src/hooks/use-attachment-upload.ts` - React hook
- `src/components/complaints/complaint-form-with-upload.tsx` - Example integration
- `src/components/ui/file-upload.tsx` - File upload UI component
- `src/lib/file-validation.ts` - File validation utilities
- `supabase/storage-rls-policies.sql` - Storage RLS policies
- `supabase/migrations/004_create_complaint_attachments_table.sql` - Table schema

## Support

For questions or issues related to attachment upload:
1. Check this documentation
2. Review the example implementation in `complaint-form-with-upload.tsx`
3. Verify RLS policies are correctly applied
4. Check Supabase Storage bucket configuration
5. Review error logs for specific error messages
