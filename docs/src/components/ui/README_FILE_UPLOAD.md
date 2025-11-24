# File Upload Component

## Overview

The `FileUpload` component provides a comprehensive file upload interface with drag-and-drop support, file validation, and visual feedback. It enforces file size, type, and count constraints according to the system requirements.

## Features

### ✅ File Validation
- **Size Validation**: Enforces 10MB maximum per file
- **Type Validation**: Only allows specific file types (images, PDFs, Word documents)
- **Count Validation**: Limits to 5 files per complaint
- **Real-time Feedback**: Shows validation errors immediately

### ✅ User Interface
- **Drag and Drop**: Intuitive drag-and-drop file upload
- **File Browser**: Click to browse and select files
- **File Previews**: Shows thumbnails for images, icons for documents
- **Progress Indicators**: Visual feedback during file selection
- **Error Messages**: Clear, actionable error messages

### ✅ Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Screen reader friendly
- Focus management

## Usage

### Basic Usage

```tsx
import { FileUpload } from '@/components/ui/file-upload';

function MyForm() {
  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <FileUpload
      files={files}
      onFilesSelected={(newFiles) => {
        setFiles([...files, ...newFiles]);
      }}
      onFileRemove={(fileToRemove) => {
        setFiles(files.filter(f => f !== fileToRemove));
      }}
    />
  );
}
```

### With Complaint Form

```tsx
import { ComplaintForm } from '@/components/complaints/complaint-form';

function ComplaintPage() {
  return (
    <ComplaintForm
      onSubmit={async (data, isDraft) => {
        // data.files contains the validated File objects
        console.log('Files:', data.files);
      }}
    />
  );
}
```

## File Validation Rules

### Allowed File Types

| Type | MIME Type | Extensions |
|------|-----------|------------|
| JPEG Image | `image/jpeg` | `.jpg`, `.jpeg` |
| PNG Image | `image/png` | `.png` |
| GIF Image | `image/gif` | `.gif` |
| PDF Document | `application/pdf` | `.pdf` |
| Word Document (Legacy) | `application/msword` | `.doc` |
| Word Document (Modern) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |

### Size Limits

- **Per File**: 10MB maximum
- **Per Complaint**: 5 files maximum
- **Total**: 50MB maximum per complaint

### Validation Behavior

1. **File Type Check**: Files with unsupported types are rejected with a clear error message
2. **File Size Check**: Files exceeding 10MB are rejected with size information
3. **File Count Check**: Additional files beyond the 5-file limit are rejected
4. **Immediate Feedback**: Validation occurs as soon as files are selected

## Validation Utilities

The component uses validation utilities from `@/lib/file-validation.ts`:

### `validateFile(file: File)`
Validates a single file against size and type constraints.

```typescript
const result = validateFile(file);
if (result.valid) {
  // File is valid
} else {
  console.error(result.error);
}
```

### `validateFiles(files: File[], existingCount: number)`
Validates multiple files considering existing file count.

```typescript
const result = validateFiles(newFiles, currentFiles.length);
console.log('Valid files:', result.valid);
console.log('Invalid files:', result.invalid);
```

### `formatFileSize(bytes: number)`
Formats file size in human-readable format.

```typescript
formatFileSize(1024 * 1024); // "1 MB"
formatFileSize(1536); // "1.5 KB"
```

### `isFileTypeAllowed(mimeType: string)`
Checks if a file type is allowed.

```typescript
isFileTypeAllowed('image/jpeg'); // true
isFileTypeAllowed('video/mp4'); // false
```

## Error Messages

The component provides clear, actionable error messages:

- **Size Error**: "File 'example.jpg' exceeds maximum size of 10MB (15.2 MB provided)"
- **Type Error**: "File 'video.mp4' has unsupported type 'video/mp4'. Allowed types: images (JPEG, PNG, GIF), PDF, and Word documents."
- **Count Error**: "Maximum 5 files allowed per complaint. This file exceeds the limit."

## Component Props

### `FileUploadProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFilesSelected` | `(files: File[]) => void` | - | Callback when valid files are selected |
| `onFileRemove` | `(file: File) => void` | - | Callback when a file is removed |
| `files` | `File[]` | `[]` | Currently selected files |
| `maxFiles` | `number` | `5` | Maximum number of files allowed |
| `disabled` | `boolean` | `false` | Whether the component is disabled |
| `className` | `string` | `''` | Additional CSS classes |

## Styling

The component uses Tailwind CSS and follows the application's design system:

- **Light/Dark Mode**: Fully supports both themes
- **Responsive**: Works on mobile and desktop
- **Consistent**: Matches other form components
- **Accessible**: High contrast, clear focus states

## Testing

Comprehensive tests are available in `__tests__/file-upload.test.tsx`:

- ✅ Rendering and display
- ✅ File selection and validation
- ✅ Error handling and display
- ✅ File removal
- ✅ Drag and drop
- ✅ Accessibility features

Run tests with:
```bash
npm test src/components/ui/__tests__/file-upload.test.tsx
```

## Integration with Supabase Storage

When submitting the form, files should be uploaded to Supabase Storage:

```typescript
async function uploadFiles(complaintId: string, files: File[]) {
  for (const file of files) {
    const filePath = `${complaintId}/${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('complaint-attachments')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Store metadata in database
    await supabase.from('complaint_attachments').insert({
      complaint_id: complaintId,
      file_name: file.name,
      file_path: data.path,
      file_size: file.size,
      file_type: file.type,
    });
  }
}
```

## Security Considerations

1. **Client-side Validation**: Provides immediate feedback but is not a security measure
2. **Server-side Validation**: Must be enforced on the backend (Supabase Storage policies)
3. **File Type Verification**: MIME type checking prevents obvious malicious files
4. **Size Limits**: Prevents abuse and excessive storage usage
5. **Storage Policies**: RLS policies ensure only authorized users can access files

## Future Enhancements

- [ ] Upload progress indicators
- [ ] File compression for images
- [ ] Thumbnail generation
- [ ] Batch upload optimization
- [ ] Resume interrupted uploads
- [ ] Virus scanning integration

## Related Files

- `src/lib/file-validation.ts` - Validation utilities
- `src/lib/constants.ts` - File size and type constants
- `src/components/complaints/complaint-form.tsx` - Form integration
- `supabase/storage-rls-policies.sql` - Storage security policies

## Support

For issues or questions about file upload functionality, refer to:
- [Storage Setup Documentation](../../../docs/STORAGE_SETUP.md)
- [Storage Bucket Completion](../../../docs/STORAGE_BUCKET_COMPLETION.md)
- [Requirements Document](.kiro/specs/student-complaint-system/requirements.md) - AC11
