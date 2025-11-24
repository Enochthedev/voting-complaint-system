# Attachment Display Implementation

## Overview
This document describes the implementation of the attachment display functionality in the complaint detail view.

## Features Implemented

### 1. Attachment Display Section
- Shows all attachments associated with a complaint
- Displays attachment count in section header
- Responsive grid layout for multiple attachments

### 2. File Information Display
Each attachment card shows:
- **File icon** - Different icons based on file type (image, PDF, document, generic file)
- **File name** - Truncated if too long
- **File type label** - Human-readable type (Image, PDF, Document, File)
- **File size** - Formatted in B, KB, or MB
- **Upload timestamp** - Relative time (e.g., "2 hours ago")

### 3. File Type Icons
Different colored icons for different file types:
- **Images** (jpg, png, gif) - Blue file-image icon
- **PDFs** - Red file-text icon
- **Documents** (doc, docx) - Blue file icon
- **Other files** - Gray file icon

### 4. Download Functionality
- **Individual download** - Download button for each attachment
- **Preview button** - For image files, shows preview button on hover
- **Download all** - Bulk download button when multiple attachments exist

### 5. Visual Design
- Clean card-based layout
- Hover effects for better interactivity
- Action buttons appear on hover for cleaner UI
- Consistent with overall design system
- Dark mode support

## Component Structure

```typescript
AttachmentsSection
├── Section Header (with count)
├── Attachment List
│   └── Attachment Card (for each file)
│       ├── File Icon (type-specific)
│       ├── File Info
│       │   ├── File Name
│       │   └── Metadata (type, size, upload time)
│       └── Action Buttons
│           ├── Preview (images only)
│           └── Download
└── Download All Button (if multiple files)
```

## Mock Data
Currently using mock data following the UI-first development approach:
- 3 sample attachments (2 images, 1 PDF)
- Mock download handlers with alerts
- Real implementation will be connected in Phase 12

## Phase 12 Integration Notes

When connecting to Supabase Storage in Phase 12:

### Download Implementation
```typescript
const { data, error } = await supabase.storage
  .from('complaint-attachments')
  .download(attachment.file_path);

if (data) {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = attachment.file_name;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Preview Implementation
```typescript
const { data } = await supabase.storage
  .from('complaint-attachments')
  .createSignedUrl(attachment.file_path, 3600);

if (data?.signedUrl) {
  // Open in modal or new tab
  window.open(data.signedUrl, '_blank');
}
```

### Download All Implementation
```typescript
// Download multiple files as zip
const files = await Promise.all(
  attachments.map(att => 
    supabase.storage
      .from('complaint-attachments')
      .download(att.file_path)
  )
);

// Create zip and download
// (requires additional library like JSZip)
```

## User Experience

### Student View
- Can view all attachments they uploaded
- Can download individual files
- Can preview images
- Can download all files at once

### Lecturer View
- Can view all attachments on any complaint
- Same download and preview capabilities
- Can use attachments as evidence for resolution

## Accessibility
- Proper ARIA labels on buttons
- Keyboard navigation support
- Screen reader friendly file information
- High contrast icons for visibility

## Related Files
- `src/components/complaints/complaint-detail-view.tsx` - Main implementation
- `src/types/database.types.ts` - Type definitions
- `src/lib/utils.ts` - Utility functions

## Testing Considerations
- Test with different file types
- Test with large file names (truncation)
- Test with various file sizes
- Test download functionality
- Test preview for images
- Test bulk download
- Test empty state (no attachments)
- Test single attachment vs multiple

## Status
✅ **Completed** - UI implementation complete with mock data
⏳ **Pending** - Real Supabase Storage integration (Phase 12)
