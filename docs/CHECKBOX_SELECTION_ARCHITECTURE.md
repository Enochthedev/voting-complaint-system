# Checkbox Selection - Architecture Diagram

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ComplaintsPage                           │
│                     (State Management)                          │
│                                                                 │
│  State:                                                         │
│  • selectionMode: boolean                                       │
│  • selectedIds: Set<string>                                     │
│                                                                 │
│  Handlers:                                                      │
│  • handleToggleSelectionMode()                                  │
│  • handleSelectAll()                                            │
│  • handleClearSelection()                                       │
│  • handleBulkExport()                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Props Flow
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────┐                    ┌──────────────────────┐
│ ComplaintsHeader │                    │   ComplaintsGrid     │
│                  │                    │                      │
│ Props:           │                    │ Props:               │
│ • selectionMode  │                    │ • selectionMode      │
│ • onToggle...    │                    │ • selectedIds        │
│                  │                    │ • onSelectionChange  │
│ Renders:         │                    │                      │
│ [Select] button  │                    │ Passes to:           │
│ or               │                    │ ComplaintList        │
│ [Cancel] button  │                    │                      │
└──────────────────┘                    └──────────────────────┘
                                                   │
                                                   │ Props Flow
                                                   ▼
                                        ┌──────────────────────┐
                                        │   ComplaintList      │
                                        │                      │
                                        │ Props:               │
                                        │ • selectionMode      │
                                        │ • selectedIds        │
                                        │ • onSelectionChange  │
                                        │                      │
                                        │ Renders:             │
                                        │ • Checkboxes         │
                                        │ • Visual feedback    │
                                        │                      │
                                        │ Handles:             │
                                        │ • Toggle selection   │
                                        │ • Click events       │
                                        └──────────────────────┘

        ┌─────────────────────────────────────────┐
        │                                         │
        ▼                                         │
┌──────────────────┐                              │
│ BulkActionBar    │◄─────────────────────────────┘
│ (Conditional)    │
│                  │
│ Props:           │
│ • selectedCount  │
│ • totalCount     │
│ • onExport       │
│ • onSelectAll    │
│ • onClearSel...  │
│                  │
│ Renders:         │
│ • Selection count│
│ • [Select all]   │
│ • [Export CSV]   │
│ • [Clear]        │
│ • Progress bar   │
│                  │
│ Shows when:      │
│ selectedIds.size │
│ > 0              │
└──────────────────┘
```

---

## 🔄 Data Flow

### 1. Entering Selection Mode

```
User clicks "Select" button
         │
         ▼
ComplaintsHeader.onToggleSelectionMode()
         │
         ▼
ComplaintsPage.handleToggleSelectionMode()
         │
         ▼
setSelectionMode(true)
         │
         ▼
Re-render with selectionMode=true
         │
         ▼
ComplaintList shows checkboxes
```

### 2. Selecting an Item

```
User clicks checkbox
         │
         ▼
ComplaintListItem.handleCheckboxClick()
         │
         ▼
ComplaintList.handleSelectionToggle(id)
         │
         ▼
ComplaintList.onSelectionChange(newSet)
         │
         ▼
ComplaintsPage.setSelectedIds(newSet)
         │
         ▼
Re-render with updated selectedIds
         │
         ├─▶ ComplaintList shows visual feedback
         │
         └─▶ BulkActionBar appears/updates
```

### 3. Select All

```
User clicks "Select all" in BulkActionBar
         │
         ▼
BulkActionBar.onSelectAll()
         │
         ▼
ComplaintsPage.handleSelectAll()
         │
         ▼
Create Set with all complaint IDs
         │
         ▼
setSelectedIds(allIds)
         │
         ▼
Re-render with all items selected
         │
         ├─▶ All checkboxes checked
         │
         ├─▶ All items show visual feedback
         │
         └─▶ BulkActionBar updates count
```

### 4. Bulk Export

```
User clicks "Export CSV" in BulkActionBar
         │
         ▼
BulkActionBar.onExport()
         │
         ▼
ComplaintsPage.handleBulkExport()
         │
         ├─▶ setIsExporting(true)
         │
         ├─▶ Filter selected complaints
         │
         ├─▶ Update progress (0% → 100%)
         │
         ├─▶ Generate CSV file
         │
         ├─▶ Download file
         │
         ├─▶ setSelectedIds(new Set())
         │
         ├─▶ setSelectionMode(false)
         │
         └─▶ setIsExporting(false)
         │
         ▼
Re-render in normal mode
         │
         ├─▶ Checkboxes hidden
         │
         └─▶ BulkActionBar hidden
```

### 5. Exiting Selection Mode

```
User clicks "Cancel" button
         │
         ▼
ComplaintsHeader.onToggleSelectionMode()
         │
         ▼
ComplaintsPage.handleToggleSelectionMode()
         │
         ├─▶ setSelectionMode(false)
         │
         └─▶ setSelectedIds(new Set())
         │
         ▼
Re-render in normal mode
         │
         ├─▶ Checkboxes hidden
         │
         └─▶ BulkActionBar hidden
```

---

## 🎨 Visual States

### State 1: Normal Mode (Default)

```
┌─────────────────────────────────────────────┐
│ My Complaints                    [Select]   │
│ View and manage your submitted complaints   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Broken Air Conditioning...       [New]      │
│ The air conditioning system...              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Library WiFi Connection...       [Medium]   │
│ The WiFi in the library...                  │
└─────────────────────────────────────────────┘
```

### State 2: Selection Mode (No Selection)

```
┌─────────────────────────────────────────────┐
│ My Complaints                    [Cancel]   │
│ Select complaints to export                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [ ] Broken Air Conditioning...   [New]      │
│     The air conditioning system...          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [ ] Library WiFi Connection...   [Medium]   │
│     The WiFi in the library...              │
└─────────────────────────────────────────────┘
```

### State 3: Selection Mode (Items Selected)

```
┌─────────────────────────────────────────────┐
│ My Complaints                    [Cancel]   │
│ Select complaints to export                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [✓] Broken Air Conditioning...   [New]      │ ← Selected
│     The air conditioning system...          │   (blue border)
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [ ] Library WiFi Connection...   [Medium]   │
│     The WiFi in the library...              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [✓] Parking Lot Lighting...      [Critical] │ ← Selected
│     Several lights in the...                │   (blue border)
└─────────────────────────────────────────────┘

        ┌─────────────────────────────────────┐
        │ 2 complaints selected │ Select all 8│
        │ ─────────────────────────────────── │
        │ [Export CSV]  [Clear]               │
        └─────────────────────────────────────┘
                    ▲ Sticky at bottom
```

### State 4: Exporting

```
┌─────────────────────────────────────────────┐
│ My Complaints                    [Cancel]   │
│ Select complaints to export                 │
└─────────────────────────────────────────────┘

[Selected items with checkboxes...]

        ┌─────────────────────────────────────┐
        │ 2 complaints selected               │
        │ ─────────────────────────────────── │
        │ [Exporting...]  [Clear]             │
        │                                     │
        │ ████████████████░░░░░░░░  60%      │
        │ Generating CSV file...              │
        └─────────────────────────────────────┘
```

---

## 🔧 State Management

### State Variables

```typescript
// Selection mode flag
const [selectionMode, setSelectionMode] = useState<boolean>(false);

// Set of selected complaint IDs
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// Export progress tracking
const [isExporting, setIsExporting] = useState<boolean>(false);
const [exportProgress, setExportProgress] = useState<number>(0);
const [exportMessage, setExportMessage] = useState<string>('');
```

### State Transitions

```
┌─────────────┐
│   Normal    │
│   Mode      │
└──────┬──────┘
       │ Click "Select"
       ▼
┌─────────────┐
│  Selection  │
│  Mode       │
│  (Empty)    │
└──────┬──────┘
       │ Select items
       ▼
┌─────────────┐
│  Selection  │
│  Mode       │
│  (Items)    │
└──────┬──────┘
       │ Click "Export"
       ▼
┌─────────────┐
│  Exporting  │
│  (Progress) │
└──────┬──────┘
       │ Complete
       ▼
┌─────────────┐
│   Normal    │
│   Mode      │
└─────────────┘
```

---

## 📦 Props Interface

### ComplaintList Props

```typescript
interface ComplaintListProps {
  // Selection props
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  
  // Other props
  complaints?: Complaint[];
  isLoading?: boolean;
  onComplaintClick?: (id: string) => void;
  // ... more props
}
```

### ComplaintsHeader Props

```typescript
interface ComplaintsHeaderProps {
  // Selection props
  selectionMode?: boolean;
  onToggleSelectionMode?: () => void;
  
  // Other props
  userRole: 'student' | 'lecturer' | 'admin';
  onNewComplaint: () => void;
  onExportCSV?: () => void;
  isExporting?: boolean;
}
```

### BulkActionBar Props

```typescript
interface BulkActionBarProps {
  // Required
  selectedCount: number;
  totalCount: number;
  onExport: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  
  // Optional
  isExporting?: boolean;
  exportProgress?: number;
  exportMessage?: string;
  onExportWithAttachments?: () => void;
  hasAttachments?: boolean;
}
```

---

## 🎯 Key Design Patterns

### 1. Controlled Component Pattern
- Parent (ComplaintsPage) owns state
- Children receive props and callbacks
- Unidirectional data flow

### 2. Conditional Rendering
- Checkboxes only when selectionMode=true
- BulkActionBar only when selectedIds.size > 0
- Different buttons based on state

### 3. Immutable State Updates
- Always create new Set for updates
- Never mutate existing Set
- Triggers proper React re-renders

### 4. Event Propagation Control
- Stop propagation on checkbox clicks
- Prevent navigation in selection mode
- Separate click handlers for different modes

### 5. Cleanup Pattern
- Clear selection on mode exit
- Clear selection after export
- Reset progress indicators

---

## 🚀 Performance Considerations

### Efficient Lookups
```typescript
// O(1) lookup with Set
const isSelected = selectedIds.has(complaint.id);

// vs O(n) with Array
const isSelected = selectedIds.includes(complaint.id); // ❌ Slower
```

### Memoization
```typescript
// Memoize filtered complaints
const filteredComplaints = useMemo(() => {
  return complaints.filter(/* filters */);
}, [complaints, filters]);
```

### Batch Updates
```typescript
// Single state update for multiple selections
const newSelection = new Set(selectedIds);
items.forEach(id => newSelection.add(id));
setSelectedIds(newSelection); // One update
```

---

## 📚 Related Documentation

- **Completion Report**: `docs/TASK_9.1_CHECKBOX_SELECTION_COMPLETION.md`
- **Visual Test Guide**: `docs/CHECKBOX_SELECTION_VISUAL_TEST.md`
- **Quick Reference**: `docs/CHECKBOX_SELECTION_QUICK_REFERENCE.md`
- **Implementation Summary**: `docs/CHECKBOX_SELECTION_IMPLEMENTATION_SUMMARY.md`

---

**Architecture Status:** ✅ Complete and Production-Ready
