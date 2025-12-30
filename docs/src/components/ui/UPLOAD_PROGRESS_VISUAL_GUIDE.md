# Upload Progress Visual Guide

## Component States

### 1. Uploading State

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 document.pdf                                    ⟳ 45%    │
│ 2.5 MB • PDF Document                                       │
│                                                              │
│ Uploading...                                          45%   │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

- Animated spinner icon (⟳)
- Progress percentage in top right
- "Uploading..." text
- Animated progress bar
- File name, size, and type displayed

### 2. Completed State

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 document.pdf                                    ✓        │
│ 2.5 MB • PDF Document                                       │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

- Green checkmark icon (✓)
- No progress bar
- File moves to "Selected Files" section after brief delay

### 3. Error State

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 document.pdf                                    ⚠        │
│ 2.5 MB • PDF Document                                       │
│                                                              │
│ ⚠ Upload failed. Please try again.                         │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

- Red alert icon (⚠)
- Error message displayed below file info
- File remains in upload progress section

## Full Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                         ⬆                                   │
│                                                              │
│   Drag and drop files here, or browse                       │
│   Supported: .jpg, .jpeg, .png, .gif, .pdf, .doc, .docx    │
│   Max 10MB per file, 5 files total                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Uploading Files (1/3)
┌─────────────────────────────────────────────────────────────┐
│ 🖼️ photo1.jpg                                     ⟳ 30%    │
│ 1.2 MB • JPEG Image                                         │
│ Uploading...                                          30%   │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📄 report.pdf                                      ✓        │
│ 2.5 MB • PDF Document                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📄 data.xlsx                                       ⚠        │
│ 3.1 MB • Excel Spreadsheet                                 │
│ ⚠ Network error. Upload failed.                            │
└─────────────────────────────────────────────────────────────┘

Selected Files (2/5)
┌─────────────────────────────────────────────────────────────┐
│ 🖼️ screenshot.png                                 ✓    ✕   │
│ 856 KB • PNG Image                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📄 notes.pdf                                       ✓    ✕   │
│ 1.8 MB • PDF Document                                       │
└─────────────────────────────────────────────────────────────┘
```

## Progress Bar Animation

The progress bar smoothly animates from 0% to 100%:

```
0%   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

25%  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

50%  ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░

75%  ████████████████████████████████████░░░░░░░░░░░░

100% ████████████████████████████████████████████████
```

**Animation Details:**

- Smooth CSS transition (300ms ease-out)
- Updates in real-time as progress changes
- Dark mode compatible colors

## Color Scheme

### Light Mode

- **Progress Bar**: Dark gray (#18181b)
- **Background**: Light gray (#e4e4e7)
- **Success Icon**: Green (#16a34a)
- **Error Icon**: Red (#dc2626)
- **Spinner**: Gray (#52525b)

### Dark Mode

- **Progress Bar**: Light gray (#fafafa)
- **Background**: Dark gray (#27272a)
- **Success Icon**: Green (#22c55e)
- **Error Icon**: Red (#ef4444)
- **Spinner**: Gray (#a1a1aa)

## Responsive Behavior

### Desktop (≥640px)

- Full width layout
- Side-by-side file info and actions
- Larger icons and text

### Mobile (<640px)

- Stacked layout
- Smaller icons
- Touch-friendly tap targets
- Optimized spacing

## Accessibility Features

### ARIA Attributes

```html
<div
  role="progressbar"
  aria-valuenow="45"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Upload progress: 45%"
></div>
```

### Screen Reader Announcements

- "Uploading document.pdf, 45% complete"
- "Upload completed for document.pdf"
- "Upload failed for document.pdf: Network error"

### Keyboard Navigation

- Tab through file items
- Enter/Space to remove files
- Focus indicators visible

## Usage Example

```typescript
const [uploadProgress, setUploadProgress] = useState([
  {
    file: myFile,
    progress: 45,
    status: 'uploading'
  }
]);

<FileUpload
  files={completedFiles}
  uploadProgress={uploadProgress}
  onFilesSelected={handleUpload}
/>
```

## State Transitions

```
File Selected
     ↓
[Uploading] ──────→ [Completed] ──→ Moved to Selected Files
     │
     └──────────→ [Error] ──→ Stays in Upload Progress
```

## Performance Considerations

- Progress updates throttled to avoid excessive re-renders
- Object URLs cleaned up after image preview loads
- Smooth animations using CSS transforms
- Minimal re-renders with React.memo optimization

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)
