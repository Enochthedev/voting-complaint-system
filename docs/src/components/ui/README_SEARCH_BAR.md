# Search Bar Component

## Overview

The `SearchBar` component provides a full-featured search interface for the Student Complaint System. It includes autocomplete suggestions, loading states, keyboard navigation, and a clean, accessible design.

## Features

- ✅ Real-time search input with debouncing support
- ✅ Autocomplete suggestions dropdown
- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ Loading indicator during search operations
- ✅ Clear button to reset search
- ✅ Click-outside to close suggestions
- ✅ Fully accessible (ARIA attributes)
- ✅ Responsive design
- ✅ Dark mode support

## Usage

### Basic Usage

```tsx
import { SearchBar } from '@/components/ui/search-bar';

function MyComponent() {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (query: string) => {
    // Perform search with the query
    console.log('Searching for:', query);
  };

  return (
    <SearchBar
      value={searchValue}
      onChange={setSearchValue}
      onSearch={handleSearch}
      placeholder="Search complaints..."
    />
  );
}
```

### With Autocomplete Suggestions

```tsx
import { SearchBar, SearchSuggestion } from '@/components/ui/search-bar';

function MyComponent() {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  const handleChange = (value: string) => {
    setSearchValue(value);
    
    // Fetch suggestions based on input
    // This would typically be an API call
    const newSuggestions = [
      { id: '1', text: 'broken air conditioning', type: 'recent' },
      { id: '2', text: 'lecture hall facilities', type: 'suggestion' },
    ];
    setSuggestions(newSuggestions);
  };

  const handleSearch = (query: string) => {
    // Perform search
    console.log('Searching for:', query);
  };

  return (
    <SearchBar
      value={searchValue}
      onChange={handleChange}
      onSearch={handleSearch}
      suggestions={suggestions}
      showSuggestions={true}
      placeholder="Search complaints..."
    />
  );
}
```

### With Loading State

```tsx
function MyComponent() {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      // Perform async search
      await searchComplaints(query);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SearchBar
      value={searchValue}
      onChange={setSearchValue}
      onSearch={handleSearch}
      isLoading={isLoading}
      placeholder="Search complaints..."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current search input value |
| `onChange` | `(value: string) => void` | - | Callback when input value changes |
| `onSearch` | `(query: string) => void` | - | Callback when search is submitted (Enter key or suggestion click) |
| `onClear` | `() => void` | - | Callback when clear button is clicked |
| `placeholder` | `string` | `'Search complaints...'` | Input placeholder text |
| `suggestions` | `SearchSuggestion[]` | `[]` | Array of autocomplete suggestions |
| `isLoading` | `boolean` | `false` | Shows loading spinner when true |
| `showSuggestions` | `boolean` | `false` | Controls whether to show suggestions dropdown |
| `className` | `string` | - | Additional CSS classes for the container |
| `disabled` | `boolean` | `false` | Disables the search input |

## SearchSuggestion Type

```typescript
interface SearchSuggestion {
  id: string;           // Unique identifier
  text: string;         // Suggestion text to display
  type?: 'recent' | 'suggestion';  // Optional type indicator
}
```

## Keyboard Navigation

- **Arrow Down**: Move to next suggestion
- **Arrow Up**: Move to previous suggestion
- **Enter**: Submit search (or select highlighted suggestion)
- **Escape**: Close suggestions dropdown and blur input

## Integration with Complaint List

The search bar is designed to work seamlessly with the complaint list:

```tsx
import { SearchBar } from '@/components/ui/search-bar';
import { ComplaintList } from '@/components/complaints/complaint-list';

function ComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      // Fetch complaints matching the search query
      const results = await searchComplaints(query);
      setComplaints(results);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      
      <ComplaintList
        complaints={complaints}
        isLoading={isLoading}
      />
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS and follows the existing design system:

- Consistent with other UI components (Input, Button)
- Supports dark mode
- Responsive design
- Accessible focus states

## Accessibility

The component includes proper ARIA attributes:

- `aria-label`: Describes the search input
- `aria-autocomplete`: Indicates autocomplete behavior
- `aria-controls`: Links to suggestions dropdown
- `aria-expanded`: Indicates dropdown state
- `role="listbox"` and `role="option"`: Proper roles for suggestions

## Future Enhancements

When integrating with the backend (Phase 12):

1. **Full-text Search**: Connect to Supabase full-text search using the `search_vector` column
2. **Debouncing**: Add debouncing to reduce API calls while typing
3. **Search History**: Store and display recent searches
4. **Advanced Filters**: Integrate with the filter system (Task 4.2)
5. **Search Highlighting**: Highlight matching terms in results (Task 4.1 sub-task)
6. **Search Analytics**: Track popular search terms

## Demo

See `__tests__/search-bar-demo.tsx` for a working demo with mock data.

## Related Components

- `Input` - Base input component
- `Button` - Used for actions
- `ComplaintList` - Displays search results

## Related Tasks

- Task 4.1: Implement Search Functionality
- Task 4.2: Build Advanced Filter System
- AC13: Search and Advanced Filtering
- P17: Search Result Accuracy
