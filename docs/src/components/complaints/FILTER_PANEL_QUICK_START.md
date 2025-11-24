# Filter Panel - Quick Start Guide

## Installation

The filter panel is already included in the complaints component library. No additional installation needed.

## Basic Usage

### 1. Import the Component

```tsx
import { FilterPanel, FilterState } from '@/components/complaints/filter-panel';
```

### 2. Set Up State

```tsx
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
```

### 3. Render the Component

```tsx
<FilterPanel
  filters={filters}
  onFiltersChange={setFilters}
/>
```

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import { FilterPanel, FilterState } from '@/components/complaints/filter-panel';
import { ComplaintList } from '@/components/complaints/complaint-list';

export default function ComplaintsPage() {
  // Initialize filter state
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

  // Mock data (replace with real data fetching)
  const availableTags = ['wifi-issue', 'classroom', 'urgent'];
  const availableLecturers = [
    { id: '1', name: 'Dr. John Smith' },
    { id: '2', name: 'Prof. Sarah Johnson' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filter Panel - Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTags}
            availableLecturers={availableLecturers}
          />
        </div>

        {/* Complaint List - Main Content */}
        <div className="lg:col-span-3">
          <ComplaintList
            complaints={[]} // Replace with filtered complaints
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}
```

## With All Features

```tsx
<FilterPanel
  filters={filters}
  onFiltersChange={setFilters}
  onSavePreset={handleSavePreset}
  availableTags={availableTags}
  availableLecturers={availableLecturers}
  isCollapsible={true}
  defaultCollapsed={false}
  className="sticky top-4"
/>
```

## Common Patterns

### Pattern 1: Fetch Data Based on Filters

```tsx
import { useEffect } from 'react';

function ComplaintsPage() {
  const [filters, setFilters] = useState<FilterState>({...});
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchComplaints() {
      setIsLoading(true);
      try {
        const data = await fetchFilteredComplaints(filters);
        setComplaints(data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchComplaints();
  }, [filters]);

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
      </div>
      <div className="lg:col-span-3">
        <ComplaintList complaints={complaints} isLoading={isLoading} />
      </div>
    </div>
  );
}
```

### Pattern 2: Debounced Filtering

```tsx
import { useDebouncedCallback } from 'use-debounce';

function ComplaintsPage() {
  const [filters, setFilters] = useState<FilterState>({...});

  const debouncedFetch = useDebouncedCallback(
    (newFilters: FilterState) => {
      fetchComplaints(newFilters);
    },
    500
  );

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    debouncedFetch(newFilters);
  };

  return (
    <FilterPanel
      filters={filters}
      onFiltersChange={handleFiltersChange}
    />
  );
}
```

### Pattern 3: URL Sync

```tsx
import { useRouter, useSearchParams } from 'next/navigation';

function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL
  const [filters, setFilters] = useState<FilterState>(() => ({
    status: searchParams.get('status')?.split(',') || [],
    category: searchParams.get('category')?.split(',') || [],
    // ... other filters
  }));

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (newFilters.status.length) {
      params.set('status', newFilters.status.join(','));
    }
    if (newFilters.category.length) {
      params.set('category', newFilters.category.join(','));
    }
    // ... other filters
    
    router.push(`?${params.toString()}`);
  };

  return (
    <FilterPanel
      filters={filters}
      onFiltersChange={handleFiltersChange}
    />
  );
}
```

### Pattern 4: Save Presets

```tsx
function ComplaintsPage() {
  const [filters, setFilters] = useState<FilterState>({...});
  const [presets, setPresets] = useState<Array<{name: string, filters: FilterState}>>([]);

  const handleSavePreset = (name: string, presetFilters: FilterState) => {
    const newPreset = { name, filters: presetFilters };
    setPresets([...presets, newPreset]);
    
    // Optionally save to local storage or database
    localStorage.setItem('filterPresets', JSON.stringify([...presets, newPreset]));
  };

  const loadPreset = (preset: {name: string, filters: FilterState}) => {
    setFilters(preset.filters);
  };

  return (
    <>
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onSavePreset={handleSavePreset}
      />
      
      {/* Preset List */}
      <div className="mt-4">
        {presets.map((preset, index) => (
          <button key={index} onClick={() => loadPreset(preset)}>
            {preset.name}
          </button>
        ))}
      </div>
    </>
  );
}
```

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `filters` | `FilterState` | ✅ | - | Current filter state |
| `onFiltersChange` | `(filters: FilterState) => void` | ✅ | - | Callback when filters change |
| `onSavePreset` | `(name: string, filters: FilterState) => void` | ❌ | - | Callback to save preset |
| `availableTags` | `string[]` | ❌ | `[]` | Available tags |
| `availableLecturers` | `Array<{id: string, name: string}>` | ❌ | `[]` | Available lecturers |
| `isCollapsible` | `boolean` | ❌ | `true` | Can collapse panel |
| `defaultCollapsed` | `boolean` | ❌ | `false` | Initial collapsed state |
| `className` | `string` | ❌ | - | Additional CSS classes |

## FilterState Type

```typescript
interface FilterState {
  status: ComplaintStatus[];           // ['new', 'opened', ...]
  category: ComplaintCategory[];       // ['academic', 'facilities', ...]
  priority: ComplaintPriority[];       // ['low', 'high', ...]
  dateFrom: string;                    // '2024-01-01'
  dateTo: string;                      // '2024-12-31'
  tags: string[];                      // ['wifi-issue', 'urgent', ...]
  assignedTo: string;                  // Lecturer ID
  sortBy: SortOption;                  // 'created_at' | 'updated_at' | ...
  sortOrder: 'asc' | 'desc';          // Sort direction
}
```

## Tips

1. **Start Simple**: Begin with just status and priority filters
2. **Add Gradually**: Add more filters as needed
3. **Debounce**: Use debouncing to avoid excessive API calls
4. **URL Sync**: Sync filters with URL for shareable links
5. **Persist**: Save user's last filters to local storage
6. **Loading States**: Show loading indicators while fetching
7. **Empty States**: Handle no results gracefully

## Common Issues

### Issue: Filters not updating list

**Solution**: Make sure you're passing the filter state to your data fetching function:

```tsx
useEffect(() => {
  fetchComplaints(filters); // Pass filters here
}, [filters]);
```

### Issue: Too many API calls

**Solution**: Use debouncing:

```tsx
const debouncedFetch = useDebouncedCallback(fetchComplaints, 500);
```

### Issue: Filters reset on page refresh

**Solution**: Sync with URL or local storage:

```tsx
// URL sync
const searchParams = useSearchParams();
const initialFilters = parseFiltersFromURL(searchParams);

// Or local storage
const savedFilters = localStorage.getItem('filters');
const initialFilters = savedFilters ? JSON.parse(savedFilters) : defaultFilters;
```

## Demo

To see the filter panel in action, check out:
- `src/components/complaints/__tests__/filter-panel-demo.tsx`

Run the demo:
```bash
# Add the demo component to a page and view in browser
```

## More Information

- [Full Documentation](./README_FILTER_PANEL.md)
- [Visual Guide](../../../docs/FILTER_PANEL_VISUAL_GUIDE.md)
- [Completion Summary](../../../docs/TASK_4.2_FILTER_PANEL_COMPLETION.md)
