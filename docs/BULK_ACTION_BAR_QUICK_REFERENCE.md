# Bulk Action Bar - Quick Reference

## Component Usage

### BulkActionBar

```tsx
import { BulkActionBar } from '@/components/complaints';

<BulkActionBar
  selectedCount={selectedIds.size}
  totalCount={totalComplaints}
  userRole={userRole}
  
  // Export
  isExporting={isExporting}
  exportProgress={exportProgress}
  exportMessage={exportMessage}
  onExport={handleBulkExport}
  onExportWithAttachments={handleExportWithAttachments}
  hasAttachments={hasAttachments}
  
  // Selection
  onSelectAll={handleSelectAll}
  onClearSelection={handleClearSelection}
  
  // Bulk Actions (Lecturer/Admin only)
  onBulkStatusChange={handleBulkStatusChange}
  onBulkAssignment={handleBulkAssignment}
  onBulkTagAddition={handleBulkTagAddition}
/>
```

### BulkActionConfirmationModal

```tsx
import { BulkActionConfirmationModal } from '@/components/complaints';

<BulkActionConfirmationModal
  open={showModal}
  onOpenChange={setShowModal}
  title="Change Status"
  description="Are you sure you want to change the status?"
  itemCount={selectedIds.size}
  actionType="default" // or "destructive"
  confirmText="Confirm"
  cancelText="Cancel"
  onConfirm={handleConfirm}
  isLoading={isLoading}
/>
```

### BulkAssignmentModal

```tsx
import { BulkAssignmentModal } from '@/components/complaints';

<BulkAssignmentModal
  open={showModal}
  onOpenChange={setShowModal}
  itemCount={selectedIds.size}
  availableLecturers={[
    { id: '1', name: 'Dr. Smith' },
    { id: '2', name: 'Prof. Johnson' }
  ]}
  onConfirm={(lecturerId) => handleAssign(lecturerId)}
  isLoading={isLoading}
/>
```

### BulkTagAdditionModal

```tsx
import { BulkTagAdditionModal } from '@/components/complaints';

<BulkTagAdditionModal
  open={showModal}
  onOpenChange={setShowModal}
  itemCount={selectedIds.size}
  availableTags={['urgent', 'wifi', 'facilities']}
  onConfirm={(tags) => handleAddTags(tags)}
  isLoading={isLoading}
/>
```

## State Management Pattern

```tsx
// Selection state
const [selectionMode, setSelectionMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// Modal state
const [bulkActionModal, setBulkActionModal] = useState<{
  type: 'status' | 'assignment' | 'tags' | null;
  status?: ComplaintStatus;
}>({ type: null });

// Confirmation state
const [showConfirmationModal, setShowConfirmationModal] = useState(false);
const [confirmationConfig, setConfirmationConfig] = useState<{
  title: string;
  description: string;
  action: () => void;
} | null>(null);

// Loading state
const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
```

## Handler Functions

### Selection Handlers

```tsx
const handleSelectAll = () => {
  const allIds = new Set(complaints.map((c) => c.id));
  setSelectedIds(allIds);
};

const handleClearSelection = () => {
  setSelectedIds(new Set());
  setSelectionMode(false);
};

const handleToggleSelectionMode = () => {
  setSelectionMode(!selectionMode);
  if (selectionMode) {
    setSelectedIds(new Set());
  }
};
```

### Bulk Action Handlers

```tsx
// Status Change
const handleBulkStatusChange = (status: ComplaintStatus) => {
  setConfirmationConfig({
    title: 'Change Status',
    description: `Change status to "${status}"?`,
    action: () => performBulkStatusChange(status),
  });
  setShowConfirmationModal(true);
};

// Assignment
const handleBulkAssignment = () => {
  setBulkActionModal({ type: 'assignment' });
};

// Tag Addition
const handleBulkTagAddition = () => {
  setBulkActionModal({ type: 'tags' });
};
```

### Execution Functions

```tsx
const performBulkStatusChange = async (status: ComplaintStatus) => {
  setIsBulkActionLoading(true);
  try {
    // API call
    await updateComplaintStatuses(Array.from(selectedIds), status);
    
    // Clear selection
    setSelectedIds(new Set());
    setSelectionMode(false);
    setShowConfirmationModal(false);
    
    // Show success
    toast.success('Status changed successfully');
  } catch (error) {
    toast.error('Failed to change status');
  } finally {
    setIsBulkActionLoading(false);
  }
};
```

## Role-Based Rendering

```tsx
const isLecturerOrAdmin = userRole === 'lecturer' || userRole === 'admin';

// In BulkActionBar, actions are conditionally rendered:
{isLecturerOrAdmin && (
  <>
    <Button onClick={handleBulkStatusChange}>Change Status</Button>
    <Button onClick={handleBulkAssignment}>Assign</Button>
    <Button onClick={handleBulkTagAddition}>Add Tags</Button>
  </>
)}
```

## API Integration Template

```tsx
// Example: Bulk Status Change API Integration
const performBulkStatusChange = async (status: ComplaintStatus) => {
  setIsBulkActionLoading(true);
  
  try {
    const complaintIds = Array.from(selectedIds);
    
    // 1. Update complaint statuses
    const { data, error } = await supabase
      .from('complaints')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', complaintIds);
    
    if (error) throw error;
    
    // 2. Log in history
    const historyEntries = complaintIds.map(id => ({
      complaint_id: id,
      action: 'status_changed',
      old_value: null, // Get from current state
      new_value: status,
      changed_by: currentUser.id,
      created_at: new Date().toISOString(),
    }));
    
    await supabase.from('complaint_history').insert(historyEntries);
    
    // 3. Send notifications
    await supabase.from('notifications').insert(
      complaintIds.map(id => ({
        user_id: getComplaintOwnerId(id),
        type: 'status_changed',
        title: 'Complaint Status Updated',
        message: `Your complaint status was changed to ${status}`,
        related_complaint_id: id,
      }))
    );
    
    // 4. Refresh data
    await refreshComplaints();
    
    // 5. Clear selection
    setSelectedIds(new Set());
    setSelectionMode(false);
    setShowConfirmationModal(false);
    
    // 6. Show success
    toast.success(`Status changed for ${complaintIds.length} complaints`);
    
  } catch (error) {
    console.error('Bulk status change failed:', error);
    toast.error('Failed to change status. Please try again.');
  } finally {
    setIsBulkActionLoading(false);
  }
};
```

## Keyboard Shortcuts (Future Enhancement)

```tsx
// Suggested keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'a':
          e.preventDefault();
          handleSelectAll();
          break;
        case 'd':
          e.preventDefault();
          handleClearSelection();
          break;
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Testing Checklist

- [ ] Selection mode toggle works
- [ ] Individual checkbox selection works
- [ ] Select all selects all filtered complaints
- [ ] Select none clears selection
- [ ] Bulk action bar appears when items selected
- [ ] Bulk action bar hides when no items selected
- [ ] Export CSV works
- [ ] Export with attachments works (if applicable)
- [ ] Status change modal opens
- [ ] Status change confirmation works
- [ ] Assignment modal opens
- [ ] Assignment confirmation works
- [ ] Tag addition modal opens
- [ ] Tag addition confirmation works
- [ ] Loading states show during operations
- [ ] Success messages appear after operations
- [ ] Error messages appear on failures
- [ ] Selection clears after successful operations
- [ ] Role-based actions show/hide correctly
- [ ] Progress indicator works during export

## Common Issues

### Issue: Selection not clearing after action
**Solution**: Ensure you call `setSelectedIds(new Set())` after successful operations

### Issue: Modal not closing after action
**Solution**: Set modal state to closed in the success handler

### Issue: Actions available to students
**Solution**: Check `userRole` prop is passed correctly to BulkActionBar

### Issue: Progress not updating
**Solution**: Ensure `exportProgress` and `exportMessage` state is updated during operation

## Files Modified/Created

- ✅ `src/components/complaints/bulk-action-bar.tsx` (enhanced)
- ✅ `src/components/complaints/bulk-action-confirmation-modal.tsx` (new)
- ✅ `src/components/complaints/bulk-assignment-modal.tsx` (new)
- ✅ `src/components/complaints/bulk-tag-addition-modal.tsx` (new)
- ✅ `src/components/ui/alert-dialog.tsx` (new)
- ✅ `src/components/ui/select.tsx` (new)
- ✅ `src/components/complaints/index.ts` (updated exports)
- ✅ `src/app/complaints/page.tsx` (integrated bulk actions)
