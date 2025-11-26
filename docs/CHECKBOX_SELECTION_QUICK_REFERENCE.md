# Checkbox Selection - Quick Reference Guide

## 🎯 Overview
Quick reference for implementing and using checkbox selection in the complaint list.

---

## 📦 Components Involved

### 1. ComplaintList
**File:** `src/components/complaints/complaint-list.tsx`

**Props:**
```typescript
interface ComplaintListProps {
  selectionMode?: boolean;           // Enable/disable selection mode
  selectedIds?: Set<string>;         // Set of selected IDs
  onSelectionChange?: (ids: Set<string>) => void; // Selection callback
  // ... other props
}
```

### 2. ComplaintsHeader
**File:** `src/components/complaints/complaints-header.tsx`

**Props:**
```typescript
interface ComplaintsHeaderProps {
  selectionMode?: boolean;           // Current selection mode state
  onToggleSelectionMode?: () => void; // Toggle callback
  // ... other props
}
```

### 3. BulkActionBar
**File:** `src/components/complaints/bulk-action-bar.tsx`

**Props:**
```typescript
interface BulkActionBarProps {
  selectedCount: number;             // Number of selected items
  totalCount: number;                // Total available items
  onExport: () => void;              // Export callback
  onSelectAll: () => void;           // Select all callback
  onClearSelection: () => void;      // Clear callback
  // ... other props
}
```

---

## 🔧 Implementation Pattern

### Basic Setup

```typescript
// 1. State management
const [selectionMode, setSelectionMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// 2. Toggle selection mode
const handleToggleSelectionMode = () => {
  setSelectionMode(!selectionMode);
  if (selectionMode) {
    setSelectedIds(new Set()); // Clear on exit
  }
};

// 3. Select all
const handleSelectAll = () => {
  const allIds = new Set(complaints.map(c => c.id));
  setSelectedIds(allIds);
};

// 4. Clear selection
const handleClearSelection = () => {
  setSelectedIds(new Set());
  setSelectionMode(false);
};

// 5. Bulk action (e.g., export)
const handleBulkExport = async () => {
  const selected = complaints.filter(c => selectedIds.has(c.id));
  await exportToCSV(selected);
  setSelectedIds(new Set());
  setSelectionMode(false);
};
```

### Component Integration

```typescript
<ComplaintsHeader
  selectionMode={selectionMode}
  onToggleSelectionMode={handleToggleSelectionMode}
/>

<ComplaintList
  complaints={complaints}
  selectionMode={selectionMode}
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
/>

<BulkActionBar
  selectedCount={selectedIds.size}
  totalCount={complaints.length}
  onExport={handleBulkExport}
  onSelectAll={handleSelectAll}
  onClearSelection={handleClearSelection}
/>
```

---

## 🎨 Styling

### Selected Item Styles
```typescript
className={cn(
  'rounded-lg border bg-card p-4',
  isSelected && 'border-primary bg-primary/5'
)}
```

### Checkbox Styles
```typescript
<input
  type="checkbox"
  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
/>
```

---

## 📋 Common Patterns

### Pattern 1: Toggle Individual Selection
```typescript
const toggleSelection = (id: string) => {
  const newSelection = new Set(selectedIds);
  if (newSelection.has(id)) {
    newSelection.delete(id);
  } else {
    newSelection.add(id);
  }
  setSelectedIds(newSelection);
};
```

### Pattern 2: Check if All Selected
```typescript
const allSelected = selectedIds.size === complaints.length;
```

### Pattern 3: Get Selected Items
```typescript
const selectedComplaints = complaints.filter(c => 
  selectedIds.has(c.id)
);
```

### Pattern 4: Clear After Action
```typescript
const performAction = async () => {
  // Do something with selected items
  await doSomething(selectedIds);
  
  // Clear and exit
  setSelectedIds(new Set());
  setSelectionMode(false);
};
```

---

## 🚀 Usage Examples

### Example 1: Basic Selection
```typescript
function ComplaintsPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  return (
    <>
      <button onClick={() => setSelectionMode(!selectionMode)}>
        {selectionMode ? 'Cancel' : 'Select'}
      </button>
      
      <ComplaintList
        complaints={complaints}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </>
  );
}
```

### Example 2: With Bulk Export
```typescript
function ComplaintsPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleExport = async () => {
    const selected = complaints.filter(c => selectedIds.has(c.id));
    await exportComplaintsToCSV(selected);
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  return (
    <>
      <ComplaintList
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      
      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onExport={handleExport}
          onClearSelection={() => {
            setSelectedIds(new Set());
            setSelectionMode(false);
          }}
        />
      )}
    </>
  );
}
```

### Example 3: With Progress Tracking
```typescript
function ComplaintsPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const selected = complaints.filter(c => selectedIds.has(c.id));
      
      setProgress(20);
      await prepareExport(selected);
      
      setProgress(60);
      await generateCSV(selected);
      
      setProgress(100);
      
      // Cleanup
      setSelectedIds(new Set());
      setSelectionMode(false);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <>
      <ComplaintList
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
      
      <BulkActionBar
        selectedCount={selectedIds.size}
        isExporting={isExporting}
        exportProgress={progress}
        onExport={handleExport}
      />
    </>
  );
}
```

---

## ⚠️ Important Notes

### State Management
- ✅ Use `Set<string>` for efficient lookups
- ✅ Create new Set for immutable updates
- ✅ Clear selection when exiting mode
- ❌ Don't mutate Set directly

### Event Handling
- ✅ Stop propagation on checkbox clicks
- ✅ Handle both click and change events
- ✅ Respect selection mode in click handlers
- ❌ Don't navigate when in selection mode

### Performance
- ✅ Use Set for O(1) lookups
- ✅ Memoize filtered lists
- ✅ Avoid unnecessary re-renders
- ❌ Don't iterate over all items repeatedly

### User Experience
- ✅ Clear visual feedback for selection
- ✅ Show selection count
- ✅ Provide "Select all" option
- ✅ Clear selection after actions
- ❌ Don't leave orphaned selections

---

## 🐛 Troubleshooting

### Checkboxes Not Showing
```typescript
// Check: selectionMode is true
console.log('Selection mode:', selectionMode);

// Check: prop is passed to ComplaintList
<ComplaintList selectionMode={selectionMode} />
```

### Selection Not Working
```typescript
// Check: callback is provided
<ComplaintList onSelectionChange={setSelectedIds} />

// Check: Set is updated immutably
const newSet = new Set(selectedIds); // ✅ Good
selectedIds.add(id); // ❌ Bad (mutates)
```

### Visual Feedback Missing
```typescript
// Check: isSelected is calculated correctly
const isSelected = selectedIds.has(complaint.id);

// Check: className is applied
className={cn(
  'base-styles',
  isSelected && 'selected-styles'
)}
```

---

## 📚 Related Files

- `src/components/complaints/complaint-list.tsx` - Main list component
- `src/components/complaints/complaints-header.tsx` - Header with toggle
- `src/components/complaints/bulk-action-bar.tsx` - Action bar
- `src/components/complaints/complaints-grid.tsx` - Grid wrapper
- `src/app/complaints/page.tsx` - Page implementation
- `src/lib/export/csv-export.ts` - CSV export utility

---

## 🎯 Key Takeaways

1. **Use Set for selection state** - Efficient and clean
2. **Clear on exit** - Always reset when leaving selection mode
3. **Immutable updates** - Create new Set for each change
4. **Visual feedback** - Make selection obvious
5. **Cleanup after actions** - Clear selection after bulk operations

---

## 📞 Need Help?

- Check the completion report: `docs/TASK_9.1_CHECKBOX_SELECTION_COMPLETION.md`
- Visual test guide: `docs/CHECKBOX_SELECTION_VISUAL_TEST.md`
- Component source code for implementation details

---

**Quick Start:** Copy the "Basic Setup" pattern and integrate with your components!
