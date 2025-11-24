# Filter Presets - Developer Guide

## Quick Start

### Basic Usage

```typescript
import { 
  FilterPanel, 
  FilterPresetManager,
  saveFilterPreset,
  type FilterState,
  type FilterPreset 
} from '@/components/complaints';

function MyComponent() {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    category: [],
    priority: [],
    dateFrom: '',
    dateTo: '',
    tags: [],
    assignedTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const handleSavePreset = (name: string, filters: FilterState) => {
    saveFilterPreset(name, filters);
    // Optionally trigger a re-render or show success message
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  return (
    <>
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onSavePreset={handleSavePreset}
      />
      
      <FilterPresetManager
        onLoadPreset={handleLoadPreset}
      />
    </>
  );
}
```

## API Reference

### Components

#### FilterPresetManager

Displays and manages saved filter presets.

**Props:**
- `onLoadPreset: (preset: FilterPreset) => void` - Callback when preset is loaded
- `className?: string` - Optional CSS classes

**Features:**
- Automatically loads presets from localStorage
- Displays list of saved presets
- Highlights active preset
- Delete functionality
- Shows preset count

#### FilterPanel (Enhanced)

The filter panel now includes preset save functionality.

**New Props:**
- `onSavePreset?: (name: string, filters: FilterState) => void` - Callback to save preset

**Behavior:**
- Shows "Save Filter Preset" button when filters are active
- Provides input field for preset name
- Validates name before saving
- Keyboard shortcuts (Enter to save, Escape to cancel)

### Utility Functions

#### saveFilterPreset

Save a new filter preset to localStorage.

```typescript
function saveFilterPreset(
  name: string, 
  filters: FilterState
): FilterPreset
```

**Parameters:**
- `name` - Preset name (required, non-empty)
- `filters` - Complete filter state to save

**Returns:**
- `FilterPreset` object with generated ID and timestamp

**Throws:**
- Error if localStorage operation fails

**Example:**
```typescript
const preset = saveFilterPreset('High Priority', {
  status: ['new'],
  priority: ['high'],
  // ... other filters
});
console.log(preset.id); // "preset-1732123456789"
```

#### loadFilterPresets

Load all saved presets from localStorage.

```typescript
function loadFilterPresets(): FilterPreset[]
```

**Returns:**
- Array of FilterPreset objects
- Empty array if no presets or on error

**Example:**
```typescript
const presets = loadFilterPresets();
console.log(`Found ${presets.length} presets`);
```

#### deleteFilterPreset

Delete a preset by ID.

```typescript
function deleteFilterPreset(presetId: string): void
```

**Parameters:**
- `presetId` - ID of preset to delete

**Throws:**
- Error if localStorage operation fails

**Example:**
```typescript
deleteFilterPreset('preset-1732123456789');
```

## Types

### FilterPreset

```typescript
interface FilterPreset {
  id: string;              // Unique ID (e.g., "preset-1732123456789")
  name: string;            // User-provided name
  filters: FilterState;    // Complete filter configuration
  createdAt: string;       // ISO timestamp
}
```

### FilterState

```typescript
interface FilterState {
  status: ComplaintStatus[];
  category: ComplaintCategory[];
  priority: ComplaintPriority[];
  dateFrom: string;
  dateTo: string;
  tags: string[];
  assignedTo: string;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}
```

## Storage

### LocalStorage Key

```typescript
const STORAGE_KEY = 'complaint-filter-presets';
```

### Data Format

```json
[
  {
    "id": "preset-1732123456789",
    "name": "High Priority Academic",
    "filters": {
      "status": ["new", "opened"],
      "category": ["academic"],
      "priority": ["high"],
      "dateFrom": "",
      "dateTo": "",
      "tags": [],
      "assignedTo": "",
      "sortBy": "created_at",
      "sortOrder": "desc"
    },
    "createdAt": "2024-11-20T10:30:45.789Z"
  }
]
```

## Common Patterns

### Pattern 1: Force Preset Manager Refresh

```typescript
const [presetKey, setPresetKey] = useState(0);

const handleSavePreset = (name: string, filters: FilterState) => {
  saveFilterPreset(name, filters);
  setPresetKey(prev => prev + 1); // Force re-render
};

return (
  <FilterPresetManager
    key={presetKey}
    onLoadPreset={handleLoadPreset}
  />
);
```

### Pattern 2: Clear Search When Loading Preset

```typescript
const handleLoadPreset = (preset: FilterPreset) => {
  setFilters(preset.filters);
  setCurrentPage(1);
  if (searchActive) {
    clearSearch();
  }
};
```

### Pattern 3: Show Success Message

```typescript
const handleSavePreset = (name: string, filters: FilterState) => {
  try {
    saveFilterPreset(name, filters);
    showToast('Preset saved successfully!', 'success');
  } catch (error) {
    showToast('Failed to save preset', 'error');
  }
};
```

### Pattern 4: Confirm Before Delete

```typescript
// In a custom preset manager
const handleDelete = (presetId: string, presetName: string) => {
  if (confirm(`Delete preset "${presetName}"?`)) {
    deleteFilterPreset(presetId);
    loadPresets(); // Refresh list
  }
};
```

### Pattern 5: Export/Import Presets

```typescript
// Export presets to JSON file
const exportPresets = () => {
  const presets = loadFilterPresets();
  const json = JSON.stringify(presets, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'filter-presets.json';
  a.click();
};

// Import presets from JSON file
const importPresets = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const presets = JSON.parse(e.target?.result as string);
    localStorage.setItem('complaint-filter-presets', JSON.stringify(presets));
  };
  reader.readAsText(file);
};
```

## Error Handling

### LocalStorage Errors

```typescript
try {
  saveFilterPreset(name, filters);
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    console.error('LocalStorage quota exceeded');
    // Show user-friendly message
  } else {
    console.error('Failed to save preset:', error);
  }
}
```

### Corrupted Data

```typescript
const presets = loadFilterPresets();
// loadFilterPresets handles corrupted data gracefully
// Returns empty array if data is invalid
```

## Testing

### Unit Tests

```typescript
import { saveFilterPreset, loadFilterPresets, deleteFilterPreset } from './filter-preset-manager';

describe('Filter Presets', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load presets', () => {
    const filters = { /* ... */ };
    const preset = saveFilterPreset('Test', filters);
    
    const loaded = loadFilterPresets();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Test');
  });
});
```

### Integration Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPresetManager } from './filter-preset-manager';

it('should load preset on click', () => {
  const onLoadPreset = vi.fn();
  render(<FilterPresetManager onLoadPreset={onLoadPreset} />);
  
  const preset = screen.getByText('Test Preset');
  fireEvent.click(preset);
  
  expect(onLoadPreset).toHaveBeenCalled();
});
```

## Performance Considerations

### Optimization Tips

1. **Memoize Preset List**: Use `useMemo` to avoid re-computing preset list
2. **Debounce Save**: If auto-saving, debounce the save operation
3. **Lazy Load**: Only load presets when preset manager is visible
4. **Limit Presets**: Consider limiting number of presets per user

```typescript
// Example: Memoized preset list
const presets = useMemo(() => loadFilterPresets(), [presetKey]);

// Example: Limit presets
const MAX_PRESETS = 10;
const handleSavePreset = (name: string, filters: FilterState) => {
  const existing = loadFilterPresets();
  if (existing.length >= MAX_PRESETS) {
    alert(`Maximum ${MAX_PRESETS} presets allowed`);
    return;
  }
  saveFilterPreset(name, filters);
};
```

## Accessibility

### Keyboard Navigation

- Enter key saves preset
- Escape key cancels preset creation
- Tab navigation through preset list
- Delete button accessible via keyboard

### Screen Readers

- Proper ARIA labels on all buttons
- Preset count announced
- Active preset state announced

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires localStorage support.

## Migration Guide

### From No Presets to Presets

If you're adding presets to an existing filter panel:

1. Add `onSavePreset` prop to FilterPanel
2. Add FilterPresetManager component
3. Implement save and load handlers
4. Test with existing filters

```typescript
// Before
<FilterPanel
  filters={filters}
  onFiltersChange={setFilters}
/>

// After
<FilterPanel
  filters={filters}
  onFiltersChange={setFilters}
  onSavePreset={handleSavePreset}  // Add this
/>

<FilterPresetManager              // Add this
  onLoadPreset={handleLoadPreset}
/>
```

## Troubleshooting

### Presets Not Saving

1. Check browser localStorage is enabled
2. Check for localStorage quota errors
3. Verify `onSavePreset` callback is provided
4. Check browser console for errors

### Presets Not Loading

1. Check localStorage key is correct
2. Verify data format in localStorage
3. Check for JSON parse errors
4. Clear localStorage and try again

### Presets Disappearing

1. Check if localStorage is being cleared
2. Verify browser is not in private/incognito mode
3. Check for localStorage quota issues
4. Verify no other code is modifying the storage key

## Related Documentation

- [Filter Panel Quick Start](./FILTER_PANEL_QUICK_START.md)
- [Filter Preset Demo](../__tests__/filter-preset-demo.md)
- [Completion Summary](../../../docs/FILTER_PRESET_COMPLETION.md)
