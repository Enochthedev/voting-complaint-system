# Filter Panel Component

## Overview

The Filter Panel component provides a comprehensive filtering interface for the complaint list. It allows users to filter complaints by multiple criteria, sort results, save filter presets, and view active filters as removable chips.

## Features

### Core Filtering Options

1. **Status Filter**
   - Filter by complaint status (New, Opened, In Progress, Resolved, Closed, Reopened)
   - Multiple selection via checkboxes
   - Expandable/collapsible section

2. **Category Filter**
   - Filter by complaint category (Academic, Facilities, Harassment, Course Content, Administrative, Other)
   - Multiple selection via checkboxes
   - Expandable/collapsible section

3. **Priority Filter**
   - Filter by priority level (Low, Medium, High, Critical)
   - Multiple selection via checkboxes
   - Expandable/collapsible section

4. **Date Range Filter**
   - Filter complaints by creation date
   - "From" and "To" date inputs
   - Supports partial ranges (only from or only to)

5. **Tag Filter**
   - Filter by complaint tags
   - Multiple selection via checkboxes
   - Scrollable list for many tags
   - Only shown if tags are available

6. **Assigned Lecturer Filter**
   - Filter by assigned lecturer
   - Dropdown selection
   - Only shown if lecturers are available

### Sorting Options

- Sort by: Date Created, Last Updated, Priority, Status, Title
- Sort order: Ascending or Descending
- Visual toggle buttons for sort order

### Active Filters Display

- Shows all active filters as removable chips
- Click X on chip to remove individual filter
- Displays filter count badge in header
- "Clear All" button to reset all filters

### Filter Presets

- Save current filter configuration with a custom name
- Load saved presets to quickly apply filter combinations
- Useful for frequently used filter combinations

### UI Features

- Collapsible panel to save screen space
- Expandable/collapsible filter sections
- Filter count badge in header
- Responsive design for mobile and desktop
- Full dark mode support
- Smooth animations and transitions

## Usage

### Basic Usage

```tsx
import { FilterPanel, FilterState } from '@/components/complaints/filter-panel';

function ComplaintsPage() {
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

  return (
    <FilterPanel
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
}
```

### With All Features

```tsx
import { FilterPanel, FilterState } from '@/components/complaints/filter-panel';

function ComplaintsPage() {
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

  const availableTags = ['wifi-issue', 'classroom', 'urgent', 'library'];
  const availableLecturers = [
    { id: '1', name: 'Dr. John Smith' },
    { id: '2', name: 'Prof. Sarah Johnson' },
  ];

  const handleSavePreset = (name: string, presetFilters: FilterState) => {
    // Save preset to database or local storage
    console.log('Saving preset:', name, presetFilters);
  };

  return (
    <FilterPanel
      filters={filters}
      onFiltersChange={setFilters}
      onSavePreset={handleSavePreset}
      availableTags={availableTags}
      availableLecturers={availableLecturers}
      isCollapsible={true}
      defaultCollapsed={false}
    />
  );
}
```

### Integration with Complaint List

```tsx
import { FilterPanel, FilterState } from '@/components/complaints/filter-panel';
import { ComplaintList } from '@/components/complaints/complaint-list';

function ComplaintsPage() {
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

  // Fetch complaints based on filters
  const { data: complaints, isLoading } = useComplaints(filters);

  return (
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
          complaints={complaints}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
```

## Props

### FilterPanelProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `filters` | `FilterState` | Yes | - | Current filter state |
| `onFiltersChange` | `(filters: FilterState) => void` | Yes | - | Callback when filters change |
| `onSavePreset` | `(name: string, filters: FilterState) => void` | No | - | Callback to save filter preset |
| `availableTags` | `string[]` | No | `[]` | List of available tags to filter by |
| `availableLecturers` | `Array<{ id: string; name: string }>` | No | `[]` | List of lecturers to filter by |
| `isCollapsible` | `boolean` | No | `true` | Whether the panel can be collapsed |
| `defaultCollapsed` | `boolean` | No | `false` | Initial collapsed state |
| `className` | `string` | No | - | Additional CSS classes |

### FilterState Interface

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

type SortOption = 'created_at' | 'updated_at' | 'priority' | 'status' | 'title';
```

## Components

### FilterPanel

Main filter panel component with all filtering options.

### FilterChip

Individual filter chip component for displaying active filters.

```tsx
import { FilterChip } from '@/components/complaints/filter-panel';

<FilterChip
  label="Status: New"
  onRemove={() => removeFilter('status', 'new')}
/>
```

## Styling

The component uses Tailwind CSS for styling and supports:
- Light and dark modes
- Responsive design
- Custom color schemes via Tailwind configuration
- Smooth transitions and animations

## Accessibility

- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Semantic HTML structure

## Best Practices

1. **State Management**: Keep filter state in parent component for easy integration with data fetching
2. **Debouncing**: Consider debouncing filter changes to avoid excessive API calls
3. **URL Sync**: Sync filter state with URL query parameters for shareable links
4. **Persistence**: Save user's last used filters to local storage
5. **Loading States**: Show loading indicators while fetching filtered data
6. **Empty States**: Handle cases where filters return no results

## Example: URL Sync

```tsx
import { useRouter, useSearchParams } from 'next/navigation';

function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>(() => ({
    status: searchParams.get('status')?.split(',') || [],
    category: searchParams.get('category')?.split(',') || [],
    // ... other filters
  }));

  // Update URL when filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (newFilters.status.length) params.set('status', newFilters.status.join(','));
    if (newFilters.category.length) params.set('category', newFilters.category.join(','));
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

## Example: Debounced Filtering

```tsx
import { useDebouncedCallback } from 'use-debounce';

function ComplaintsPage() {
  const [filters, setFilters] = useState<FilterState>({...});
  
  // Debounce API calls
  const debouncedFetch = useDebouncedCallback(
    (filters: FilterState) => {
      fetchComplaints(filters);
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

## Testing

See `__tests__/filter-panel-demo.tsx` for an interactive demo of all features.

## Related Components

- `ComplaintList` - Displays filtered complaints
- `SearchBar` - Provides text search functionality
- `Button` - Used for actions
- `Input` - Used for date inputs
- `Label` - Used for form labels

## Future Enhancements

- [ ] Preset management UI (edit, delete presets)
- [ ] Filter history (undo/redo)
- [ ] Advanced date filters (last 7 days, last month, etc.)
- [ ] Filter suggestions based on common patterns
- [ ] Export filter configuration
- [ ] Import filter configuration
- [ ] Filter analytics (most used filters)
