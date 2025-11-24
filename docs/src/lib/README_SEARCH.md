# Full-Text Search Implementation

## Overview

This document describes the full-text search implementation for the Student Complaint System. The search functionality allows users to search complaints by title and description using PostgreSQL's full-text search capabilities.

## Architecture

### Components

1. **search.ts** - Core search utilities and API
2. **search-mock.ts** - Mock implementation for UI development
3. **use-complaint-search.ts** - React hook for search state management
4. **SearchBar component** - UI component for search input

### Database Setup

The full-text search relies on a `search_vector` column in the `complaints` table that is automatically maintained by a database trigger:

```sql
-- Add tsvector column for full-text search
ALTER TABLE complaints ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_complaint_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_search_vector
BEFORE INSERT OR UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_complaint_search_vector();

-- Create GIN index for fast search
CREATE INDEX complaints_search_idx ON complaints USING GIN(search_vector);
```

## API Reference

### searchComplaints()

Performs full-text search on complaints with filtering, sorting, and pagination.

```typescript
async function searchComplaints(
  query: string,
  options?: SearchOptions
): Promise<SearchResult>
```

**Parameters:**
- `query` - Search query string
- `options` - Optional search configuration:
  - `filters` - Filter by status, category, priority, date range, tags, assignedTo
  - `sortBy` - Sort field (created_at, updated_at, priority, status)
  - `sortOrder` - Sort direction (asc, desc)
  - `page` - Page number (1-indexed)
  - `pageSize` - Results per page

**Returns:**
- `SearchResult` object containing:
  - `complaints` - Array of matching complaints
  - `total` - Total number of results
  - `page` - Current page number
  - `pageSize` - Results per page
  - `totalPages` - Total number of pages

**Example:**
```typescript
const results = await searchComplaints('wifi library', {
  filters: {
    status: ['new', 'opened'],
    category: ['facilities'],
    priority: ['high', 'critical'],
  },
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
});
```

### getSearchSuggestions()

Gets intelligent search suggestions for autocomplete functionality.

```typescript
async function getSearchSuggestions(
  partialQuery: string,
  limit?: number
): Promise<string[]>
```

**Parameters:**
- `partialQuery` - Partial search query (minimum 2 characters)
- `limit` - Maximum number of suggestions (default: 5)

**Returns:**
- Array of suggestion strings, prioritized by relevance

**Suggestion Sources:**
1. Complaint titles (prioritized if they start with the query)
2. Common search terms (wifi, grading, parking, etc.)
3. Tags from existing complaints

**Example:**
```typescript
const suggestions = await getSearchSuggestions('air', 5);
// Returns: [
//   'Broken Air Conditioning in Lecture Hall A',  // Title match (starts with)
//   'air conditioning',                            // Common term
//   ...
// ]
```

**Prioritization:**
- Titles starting with the query appear first
- Titles containing the query appear next
- Common search terms follow
- Matching tags appear last
- All suggestions are unique (no duplicates)

### highlightSearchTerms()

Highlights search terms in text for display.

```typescript
function highlightSearchTerms(text: string, query: string): string
```

**Parameters:**
- `text` - Text to highlight
- `query` - Search query

**Returns:**
- HTML string with `<mark>` tags around matches

**Example:**
```typescript
const highlighted = highlightSearchTerms(
  'The air conditioning is broken',
  'air conditioning'
);
// Returns: 'The <mark>air</mark> <mark>conditioning</mark> is broken'
```

### validateSearchQuery()

Validates a search query.

```typescript
function validateSearchQuery(query: string): {
  valid: boolean;
  error?: string;
}
```

## React Hook Usage

### useComplaintSearch()

React hook for managing search state and operations.

```typescript
const {
  query,
  results,
  isLoading,
  error,
  suggestions,
  setQuery,
  search,
  clearSearch,
  goToPage,
  nextPage,
  previousPage,
} = useComplaintSearch({
  debounceMs: 300,
  autoSearch: false,
  pageSize: 20,
});
```

**Options:**
- `debounceMs` - Debounce delay in milliseconds (default: 300)
- `autoSearch` - Automatically search on query change (default: false)
- `pageSize` - Results per page (default: 20)
- Plus all `SearchOptions` from `searchComplaints()`

**Returns:**
- `query` - Current search query
- `results` - Search results
- `isLoading` - Loading state
- `error` - Error message if any
- `suggestions` - Search suggestions
- `setQuery` - Update search query
- `search` - Perform search
- `clearSearch` - Clear search state
- `goToPage` - Navigate to specific page
- `nextPage` - Navigate to next page
- `previousPage` - Navigate to previous page

## UI Integration

### SearchBar Component

The `SearchBar` component provides a complete search UI with:
- Real-time input
- Autocomplete suggestions
- Loading indicator
- Clear button
- Keyboard navigation

```typescript
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  onClear={handleClearSearch}
  placeholder="Search complaints..."
  suggestions={suggestions}
  isLoading={isSearching}
  showSuggestions={true}
/>
```

### Example: Complaints Page Integration

```typescript
export default function ComplaintsPage() {
  const {
    query,
    results,
    isLoading,
    suggestions,
    setQuery,
    search,
    clearSearch,
  } = useComplaintSearch({
    autoSearch: false,
    pageSize: 20,
  });

  return (
    <div>
      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={search}
        onClear={clearSearch}
        suggestions={suggestions.map((text, i) => ({
          id: `suggestion-${i}`,
          text,
        }))}
        isLoading={isLoading}
        showSuggestions={query.length >= 2}
      />
      
      {results && (
        <ComplaintList complaints={results.complaints} />
      )}
    </div>
  );
}
```

## Development Mode

During UI development (Phases 3-11), the search functionality uses mock data:

```typescript
// In search.ts
const USE_MOCK_DATA = true; // Set to false in Phase 12
```

The mock implementation (`search-mock.ts`) provides:
- Simple text matching on title and description
- Simulated network delays
- Basic filtering and sorting
- Pagination support

This allows full UI development and testing without requiring database setup.

## Phase 12: Production Integration

In Phase 12, switch to real database search:

1. Set `USE_MOCK_DATA = false` in `search.ts`
2. Ensure database migrations are applied (search_vector column and trigger)
3. Verify GIN index is created for performance
4. Test with real data
5. Monitor search performance and adjust as needed

## Search Features

### Full-Text Search
- Searches both title and description fields
- Uses PostgreSQL's `websearch` type for natural query syntax
- Supports multiple search terms
- Relevance ranking (title matches weighted higher)

### Filtering
- Status (new, opened, in_progress, resolved, closed, reopened)
- Category (academic, facilities, harassment, course_content, administrative, other)
- Priority (low, medium, high, critical)
- Date range (from/to)
- Tags (multiple tag filtering)
- Assigned lecturer

### Sorting
- Created date (newest/oldest)
- Updated date
- Priority level
- Status

### Pagination
- Configurable page size
- Total count
- Page navigation

### Autocomplete
- Real-time intelligent suggestions
- Based on complaint titles, common terms, and tags
- Prioritized by relevance (titles starting with query first)
- Minimum 2 characters to trigger suggestions
- Keyboard navigation support (Arrow keys, Enter, Escape)
- Click to select suggestions
- Debounced for performance

## Performance Considerations

1. **GIN Index**: The `complaints_search_idx` GIN index provides fast full-text search
2. **Debouncing**: Search queries are debounced to reduce API calls
3. **Pagination**: Results are paginated to limit data transfer
4. **Caching**: Consider implementing client-side caching for repeated searches
5. **Query Optimization**: The search_vector column is pre-computed via trigger

## Testing

### Unit Tests
Test individual search functions:
- Query validation
- Text highlighting
- Filter application

### Integration Tests
Test search with database:
- Full-text search accuracy
- Filter combinations
- Pagination
- Sorting

### UI Tests
Test search component:
- Input handling
- Suggestion display
- Loading states
- Error handling

## Future Enhancements

1. **Advanced Search Syntax**
   - Boolean operators (AND, OR, NOT)
   - Phrase matching ("exact phrase")
   - Field-specific search (title:keyword)

2. **Search Analytics**
   - Track popular search terms
   - Identify searches with no results
   - Optimize based on usage patterns

3. **Saved Searches**
   - Allow users to save frequent searches
   - Quick access to saved search presets

4. **Search History**
   - Store recent searches per user
   - Quick re-run of previous searches

5. **Fuzzy Matching**
   - Handle typos and misspellings
   - Suggest corrections

6. **Multi-language Support**
   - Support for different text search configurations
   - Language-specific stemming and stop words

## Troubleshooting

### Search returns no results
- Verify search_vector column exists
- Check if trigger is active
- Ensure GIN index is created
- Test with simple queries first

### Slow search performance
- Verify GIN index is being used (EXPLAIN ANALYZE)
- Check index statistics
- Consider increasing work_mem for complex queries
- Monitor query execution time

### Suggestions not working
- Check if complaints table has data
- Verify ILIKE query syntax
- Test with different query lengths

## References

- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Supabase Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [GIN Indexes](https://www.postgresql.org/docs/current/gin.html)
