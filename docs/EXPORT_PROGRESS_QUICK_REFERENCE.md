# Export Progress Indicator - Quick Reference

## Quick Start

### Using Progress Component

```tsx
import { Progress } from '@/components/ui/progress';

<Progress
  value={75}
  label="Processing..."
  showValue
  size="default"
  variant="default"
/>
```

### Using Export Progress Dialog

```tsx
import { ExportProgressDialog } from '@/components/complaints';

const [showDialog, setShowDialog] = useState(false);
const [progress, setProgress] = useState(0);
const [message, setMessage] = useState('');
const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

<ExportProgressDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  progress={progress}
  message={message}
  status={status}
  title="Exporting Data"
  onClose={() => setShowDialog(false)}
/>
```

## Component Props

### Progress

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Progress value (0-100) |
| `label` | `string` | - | Optional label text |
| `showValue` | `boolean` | `false` | Show percentage |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Size variant |
| `variant` | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` | Color variant |

### ExportProgressDialog

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | ✅ | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | - | Open state callback |
| `progress` | `number` | ✅ | Progress (0-100) |
| `message` | `string` | ✅ | Status message |
| `status` | `'idle' \| 'exporting' \| 'success' \| 'error'` | ✅ | Export status |
| `error` | `string` | - | Error message |
| `title` | `string` | - | Dialog title |
| `onClose` | `() => void` | - | Close callback |

### BulkActionBar (Updated)

| Prop | Type | Description |
|------|------|-------------|
| `exportProgress` | `number` | Progress value (0-100) |
| `exportMessage` | `string` | Status message |

## Common Patterns

### Basic Export with Progress

```tsx
const [isExporting, setIsExporting] = useState(false);
const [progress, setProgress] = useState(0);
const [message, setMessage] = useState('');
const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
const [showDialog, setShowDialog] = useState(false);

const handleExport = async () => {
  try {
    setIsExporting(true);
    setStatus('exporting');
    setShowDialog(true);
    setProgress(0);
    setMessage('Starting export...');
    
    // Stage 1
    setProgress(30);
    setMessage('Processing data...');
    await processData();
    
    // Stage 2
    setProgress(70);
    setMessage('Generating file...');
    await generateFile();
    
    // Complete
    setProgress(100);
    setMessage('Export complete!');
    setStatus('success');
    
    // Auto-close
    setTimeout(() => {
      setShowDialog(false);
      setStatus('idle');
    }, 2000);
  } catch (err) {
    setStatus('error');
    setMessage('Export failed');
  } finally {
    setIsExporting(false);
  }
};
```

### Export with Callback Progress

```tsx
const handleExport = async () => {
  try {
    setIsExporting(true);
    setStatus('exporting');
    setShowDialog(true);
    
    await exportWithProgress(
      data,
      (current, total) => {
        const percent = Math.round((current / total) * 100);
        setProgress(percent);
        setMessage(`Processing ${current}/${total} items...`);
      }
    );
    
    setProgress(100);
    setMessage('Success!');
    setStatus('success');
  } catch (err) {
    setStatus('error');
    setMessage('Failed');
  } finally {
    setIsExporting(false);
  }
};
```

### Inline Progress (Bulk Actions)

```tsx
<BulkActionBar
  selectedCount={selectedIds.size}
  totalCount={totalItems}
  isExporting={isExporting}
  exportProgress={exportProgress}
  exportMessage={exportMessage}
  onExport={handleBulkExport}
  onSelectAll={handleSelectAll}
  onClearSelection={handleClearSelection}
/>
```

## Status Icons

- **Exporting**: `<Loader2 className="animate-spin" />`
- **Success**: `<CheckCircle2 className="text-green-500" />`
- **Error**: `<XCircle className="text-red-500" />`

## Color Variants

```tsx
// Default (primary)
<Progress value={50} variant="default" />

// Success (green)
<Progress value={100} variant="success" />

// Warning (yellow)
<Progress value={75} variant="warning" />

// Error (red)
<Progress value={25} variant="error" />
```

## Size Variants

```tsx
// Small (4px height)
<Progress value={50} size="sm" />

// Default (8px height)
<Progress value={50} size="default" />

// Large (12px height)
<Progress value={50} size="lg" />
```

## Best Practices

1. **Always show progress for operations > 1 second**
2. **Use meaningful status messages**
3. **Auto-close success dialogs after 2 seconds**
4. **Require manual close for errors**
5. **Prevent closing during export**
6. **Update progress smoothly (avoid jumps)**
7. **Show percentage for long operations**
8. **Use appropriate color variants**

## Troubleshooting

### Progress not updating
- Ensure state updates are called
- Check for async/await issues
- Verify progress value is 0-100

### Dialog not closing
- Check `onOpenChange` callback
- Verify status is not 'exporting'
- Check auto-close timeout

### Progress bar not visible
- Verify `value` prop is set
- Check parent container width
- Ensure component is rendered

## Examples in Codebase

- **Single Export**: `src/components/complaints/export-complaint-button.tsx`
- **Bulk Export**: `src/app/complaints/page.tsx`
- **Progress Bar**: `src/components/complaints/bulk-action-bar.tsx`
- **Dialog**: `src/components/complaints/export-progress-dialog.tsx`

## Related Documentation

- [Full Implementation Guide](./EXPORT_PROGRESS_INDICATOR_IMPLEMENTATION.md)
- [Export Functionality](./BULK_EXPORT_IMPLEMENTATION.md)
- [UI Components](../src/components/ui/README.md)
