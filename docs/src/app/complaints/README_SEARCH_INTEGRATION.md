# Search Bar Integration Guide

## Overview

This guide shows how to integrate the SearchBar component into the complaints page for full-text search functionality.

## Integration Example

Here's how the search bar will be integrated into the complaints page once the backend is connected (Phase 12):

```tsx
'use client';

import * as React from 'react';
import { ComplaintList } from '@/components/complaints';
import { SearchBar, SearchSuggestion } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ComplaintsPageWithSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [complaints, setComplaints] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Handle search input change - fetch suggestions
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // TODO (Phase 12): Fetch suggestions from Supabase
    // This would query recent searches or popular terms
    // For now, using mock data
    const mockSuggestions: SearchSuggestion[] = [
      { id: '1', text: 'broken air conditioning', type: 'recent' },
      { id: '2', text: 'lecture hall facilities', type: 'suggestion' },
      { id: '3', text: 'wifi connectivity', type: 'recent' },
    ];
    
    setSuggestions(
      mockSuggestions.filter(s => 
        s.text.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // Handle search submission
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setCurrentPage(1);

    try {
      // TODO (Phase 12): Implement full-text search with Supabase
      // This will use the search_vector column and PostgreSQL full-text search
      
      // Example Supabase query:
      // const { data, error } = await supabase
      //   .from('complaints')
      //   .select('*, complaint_tags(*)')
      //   .textSearch('search_vector', query, {
      //     type: 'websearch',
      //     config: 'english'
      //   })
      //   .order('created_at', { ascending: false });
      
      // For now, using mock filtered data
      console.log('Searching for:', query);
      
      // Mock: Filter complaints by search query
      // In production, this would be handled by the database
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    // Reset to show all complaints
    // TODO (Phase 12): Fetch all complaints again
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Complaints
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Search and manage complaints
            </p>
          </div>
          <Button onClick={() => router.push('/complaints/new')}>
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            suggestions={suggestions}
            isLoading={isSearching}
            showSuggestions={true}
            placeholder="Search complaints by title, description, or tags..."
          />
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            {isSearching ? (
              <span>Searching...</span>
            ) : (
              <span>
                Showing results for "<strong>{searchQuery}</strong>"
              </span>
            )}
          </div>
        )}

        {/* Complaint List */}
        <ComplaintList
          complaints={complaints}
          isLoading={isSearching}
          onComplaintClick={(id) => router.push(`/complaints/${id}`)}
          currentPage={currentPage}
          totalPages={Math.ceil(complaints.length / 20)}
          onPageChange={setCurrentPage}
          showPagination={true}
          emptyMessage={
            searchQuery
              ? `No complaints found matching "${searchQuery}"`
              : 'No complaints to display.'
          }
        />
      </div>
    </div>
  );
}
```

## Backend Integration (Phase 12)

### 1. Full-Text Search Query

The search will use PostgreSQL's full-text search capabilities via the `search_vector` column:

```typescript
// lib/api/search-complaints.ts
import { createClient } from '@/lib/supabase';

export async function searchComplaints(query: string, userId: string, userRole: string) {
  const supabase = createClient();
  
  let queryBuilder = supabase
    .from('complaints')
    .select(`
      *,
      complaint_tags(*),
      complaint_attachments(*)
    `)
    .textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english'
    });

  // Apply role-based filtering
  if (userRole === 'student') {
    queryBuilder = queryBuilder.eq('student_id', userId);
  }

  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}
```

### 2. Search Suggestions

Implement autocomplete suggestions based on:
- Recent searches (stored in user preferences)
- Popular search terms
- Tag names
- Common complaint keywords

```typescript
// lib/api/search-suggestions.ts
export async function getSearchSuggestions(query: string, userId: string) {
  const supabase = createClient();
  
  // Get matching tags
  const { data: tags } = await supabase
    .from('complaint_tags')
    .select('tag_name')
    .ilike('tag_name', `%${query}%`)
    .limit(5);

  // Get recent searches from user preferences
  // TODO: Implement user search history

  // Combine and format suggestions
  const suggestions: SearchSuggestion[] = [
    ...(tags || []).map(t => ({
      id: `tag-${t.tag_name}`,
      text: t.tag_name,
      type: 'suggestion' as const
    }))
  ];

  return suggestions;
}
```

### 3. Search Result Highlighting

Highlight matching terms in search results:

```typescript
// lib/utils/highlight-search.ts
export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const terms = query.split(' ').filter(t => t.length > 0);
  let highlighted = text;
  
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
    );
  });
  
  return highlighted;
}
```

## Search Features Checklist

- [x] Search bar component created
- [ ] Full-text search query implementation (Phase 12)
- [ ] Search suggestions/autocomplete (Phase 12)
- [ ] Search result highlighting (Phase 12)
- [ ] Empty search results handling (Phase 12)
- [ ] Search history tracking (Phase 12)
- [ ] Search analytics (Future enhancement)

## Related Files

- `src/components/ui/search-bar.tsx` - Search bar component
- `src/components/ui/README_SEARCH_BAR.md` - Component documentation
- `src/components/ui/__tests__/search-bar-demo.tsx` - Demo with mock data
- `src/app/complaints/page.tsx` - Current complaints page

## Testing

The search bar component includes:
- Keyboard navigation
- Accessibility features
- Loading states
- Error handling
- Responsive design

Test the component using the demo file before integrating with real data.

## Performance Considerations

1. **Debouncing**: Add debouncing to search input to reduce API calls
2. **Caching**: Cache search results for common queries
3. **Pagination**: Limit search results and implement pagination
4. **Indexing**: Ensure proper database indexes on search_vector column

## Accessibility

The search bar includes:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- Clear visual feedback

## Next Steps

1. Complete Task 4.1 sub-tasks:
   - Implement full-text search query
   - Add search result highlighting
   - Show search suggestions/autocomplete
   - Handle empty search results

2. Integrate with Task 4.2 (Advanced Filter System)
   - Combine search with filters
   - Save search + filter presets
   - Show active search and filters

3. Add search analytics (Future)
   - Track popular searches
   - Identify common issues
   - Improve search relevance
