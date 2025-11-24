# Storage Setup Guide

This guide walks you through setting up Supabase Storage for complaint attachments in the Student Complaint Resolution System.

## Overview

The system uses Supabase Storage to store file attachments (images, PDFs, documents) uploaded with complaints. Files are stored in a private bucket with Row Level Security (RLS) policies to ensure proper access control.

## Prerequisites

Before setting up storage, ensure you have:

1. ✅ Supabase project created and running
2. ✅ Environment variables configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (required for bucket creation)
3. ✅ Database tables created (especially the `complaints` table)

## Storage Configuration

### Bucket Details

- **Bucket Name**: `complaint-attachments`
- **Access**: Private (not publicly accessible)
- **File Size Limit**: 10MB per file
- **Max Files per Complaint**: 5 files
- **Allowed File Types**:
  - Images: JPEG, PNG, GIF
  - Documents: PDF, DOC, DOCX

### Folder Structure

Files are organized by complaint ID:

```
complaint-attachments/
├── {complaint-id-1}/
│   ├── document1.pdf
│   └── image1.jpg
├── {complaint-id-2}/
│   ├── screenshot.png
│   └── report.docx
└── ...
```

## Setup Steps

### Step 1: Create the Storage Bucket

Run the setup script to create the storage bucket:

```bash
cd student-complaint-system
node scripts/setup-storage-bucket.js
```

The script will:
- ✅ Verify environment variables
- ✅ Test Supabase connection
- ✅ Check for existing buckets
- ✅ Create the `complaint-attachments` bucket
- ✅ Configure bucket settings (file size, allowed types)
- ✅ Verify bucket creation

**Expected Output:**

```
Supabase Storage Bucket Setup Tool
===================================

============================================================
1. Checking Environment Variables
============================================================

✓ NEXT_PUBLIC_SUPABASE_URL: https://your-project.supabase.co
✓ SUPABASE_SERVICE_ROLE_KEY is set

============================================================
2. Testing Supabase Connection
============================================================

✓ Successfully connected to Supabase

...

✓ Storage bucket setup complete!
```

### Step 2: Apply Storage RLS Policies

After creating the bucket, apply the Row Level Security policies:

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/storage-rls-policies.sql`
4. Copy the SQL content
5. Paste into the SQL Editor
6. Click **Run** to execute

The policies will:
- ✅ Allow students to upload files to their own complaints
- ✅ Allow lecturers/admins to upload files to any complaint
- ✅ Allow students to view attachments on their own complaints
- ✅ Allow lecturers/admins to view all attachments
- ✅ Allow users to delete their own attachments

### Step 3: Verify Setup

Run the verification queries at the end of `storage-rls-policies.sql` to confirm:

```sql
-- List all storage policies
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%attachments%';

-- Check bucket configuration
SELECT name, public, file_size_limit FROM storage.buckets
WHERE name = 'complaint-attachments';
```

**Expected Results:**

| policyname | cmd |
|------------|-----|
| Students upload attachments | INSERT |
| View attachments | SELECT |
| Delete own attachments | DELETE |

| name | public | file_size_limit |
|------|--------|-----------------|
| complaint-attachments | false | 10485760 |

## Testing Storage

### Test File Upload (Manual)

1. Log in as a student
2. Navigate to "Submit Complaint" page
3. Try uploading a test file (image or PDF)
4. Verify the file appears in the attachment list
5. Submit the complaint
6. Check Supabase Storage dashboard to see the uploaded file

### Test Access Control

1. **As Student**: Try to access your own complaint's attachments ✅
2. **As Student**: Try to access another student's attachments ❌ (should fail)
3. **As Lecturer**: Try to access any complaint's attachments ✅
4. **As Anonymous**: Try to access any attachments ❌ (should fail)

## Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY is not set"

**Solution**: Add the service role key to your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Find this key in: Supabase Dashboard → Project Settings → API → service_role key

### Error: "Bucket already exists"

**Solution**: This is not an error. The bucket was already created. You can proceed to Step 2 (RLS policies).

### Error: "Failed to create bucket: permission denied"

**Solution**: 
1. Verify you're using the service role key (not anon key)
2. Check that your Supabase project is active
3. Ensure you have admin access to the project

### Error: "Row Level Security policy check violation"

**Solution**: 
1. Verify RLS policies are applied (Step 2)
2. Check that the user is authenticated
3. Verify the user's role is set correctly in JWT claims
4. Ensure the complaint belongs to the user (for students)

### Files not uploading

**Checklist**:
- ✅ Bucket created successfully
- ✅ RLS policies applied
- ✅ User is authenticated
- ✅ File size is under 10MB
- ✅ File type is allowed (JPEG, PNG, GIF, PDF, DOC, DOCX)
- ✅ Complaint exists in database

## Storage Limits

### File Size Limits

- **Per File**: 10MB maximum
- **Per Complaint**: 5 files maximum (50MB total)
- **Total Storage**: Depends on your Supabase plan

### Allowed MIME Types

```javascript
[
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
```

## Security Considerations

### Private Bucket

The bucket is **private** by default, meaning:
- Files are NOT publicly accessible via direct URL
- All access requires authentication
- RLS policies enforce access control

### Access Control

- **Students**: Can only access attachments on their own complaints
- **Lecturers/Admins**: Can access all attachments
- **Anonymous Complaints**: Attachments are accessible to lecturers but not linked to student identity

### File Validation

Always validate files on both client and server:
- ✅ Check file size before upload
- ✅ Verify file type/MIME type
- ✅ Scan for malware (recommended for production)
- ✅ Sanitize file names

## API Usage

### Upload File

```typescript
import { supabase } from '@/lib/supabase';

async function uploadAttachment(complaintId: string, file: File) {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${complaintId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('complaint-attachments')
    .upload(filePath, file);

  if (error) throw error;
  return data;
}
```

### Download File

```typescript
async function downloadAttachment(filePath: string) {
  const { data, error } = await supabase.storage
    .from('complaint-attachments')
    .download(filePath);

  if (error) throw error;
  return data;
}
```

### Get Public URL (Signed)

```typescript
async function getSignedUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from('complaint-attachments')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}
```

### Delete File

```typescript
async function deleteAttachment(filePath: string) {
  const { error } = await supabase.storage
    .from('complaint-attachments')
    .remove([filePath]);

  if (error) throw error;
}
```

## Next Steps

After completing storage setup:

1. ✅ Implement file upload component (Task 3.2)
2. ✅ Add file validation logic
3. ✅ Create attachment preview component
4. ✅ Test upload/download functionality
5. ✅ Implement file deletion for drafts

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://supabase.com/docs/guides/storage/uploads)
- Design Document: `.kiro/specs/student-complaint-system/design.md`

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase Storage logs in the dashboard
3. Verify RLS policies are correctly applied
4. Test with the Supabase SQL Editor
5. Check browser console for client-side errors

---

**Last Updated**: November 2024  
**Version**: 1.0
