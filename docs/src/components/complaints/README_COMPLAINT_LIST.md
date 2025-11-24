# Complaint List Component

## Overview

The `ComplaintList` component displays a paginated list of complaints with status badges, priority indicators, and metadata. It includes loading states, empty states, and error handling.

## Features

### ✅ Implemented Features

1. **Complaint List Display**
   - Shows complaint title, description preview, and metadata
   - Displays status badges with color coding
   - Shows priority indicators with colored dots
   - Displays category labels
   - Shows relative timestamps (e.g., "2 hours ago")
   - Indicates anonymous complaints
   - Displays tags (up to 5, with "+X more" indicator)

2. **Pagination**
   - Page navigation with Previous/Next buttons
   - Shows current page and total pages
   - Responsive design (mobile and desktop layouts)
   - Smooth scrolling to top on page change

3. **Loading States**
   - Skeleton loading placeholders
   - Smooth transitions between states

4. **Empty States**
   - Customizable empty message
   - Clear visual indication when no complaints exist

5. **Error States**
   - Error message display
   - Visual error indicator

6. **Role-Based Filtering**
   - Component accepts filtered complaints from parent
   - Parent component handles role-based logic (students see own, lecturers see all)

7. **Interactive Elements**
   - Clickable complaint cards
   - Hover effects for better UX
   - Callback support for navigation

## Component API

### Props

```typescript
interface ComplaintListProps {
  complaints?: ComplaintWithTags[];      // Array of complaints to display
  isLoading?: boolean;                   // Loading state
  error?: string;                        // Error message
  onComplaintClick?: (id: string) => void; // Click handler
  currentPage?: number;                  // Current page number
  totalPages?: number;                   // Total number of pages
  onPageChange?: (page: number) => void; // Page change handler
  emptyMessage?: string;                 // Custom empty state message
  showPagination?: boolean;              // Show/hide pagination
}
```

### Usage Example

```tsx
import { ComplaintList } from '@/components/complaints';

function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <ComplaintList
      complaints={complaints}
      isLoading={isLoading}
      onComplaintClick={(id) => router.push(`/complaints/${id}`)}
      currentPage={currentPage}
      totalPages={10}
      onPageChange={setCurrentPage}
      showPagination={true}
    />
  );
}
```

## Status Badge Colors

- **Draft**: Gray
- **New**: Blue
- **Opened**: Purple
- **In Progress**: Yellow
- **Resolved**: Green
- **Closed**: Gray
- **Reopened**: Orange

## Priority Indicators

- **Low**: Blue dot
- **Medium**: Yellow dot
- **High**: Orange dot
- **Critical**: Red dot

## Mock Data

The `/complaints` page includes comprehensive mock data for UI development:
- 8 sample complaints with various statuses, priorities, and categories
- Mix of anonymous and non-anonymous complaints
- Different timestamps (from 30 minutes ago to 10 days ago)
- Various tags and metadata

## Responsive Design

- **Mobile**: Stacked layout with simplified pagination
- **Desktop**: Full layout with detailed pagination controls
- **Tablet**: Adaptive layout that works well on medium screens

## Accessibility

- Semantic HTML structure
- ARIA labels for priority indicators
- Keyboard navigation support
- Screen reader friendly

## Future Enhancements (Phase 12 - API Integration)

When connecting to real APIs:

1. Replace mock data with Supabase queries
2. Implement real-time updates via Supabase Realtime
3. Add filtering and sorting capabilities
4. Implement search functionality
5. Add role-based access control
6. Connect to actual complaint detail pages

## Testing

The component is ready for testing with:
- Mock data provided in the demo page
- All UI states (loading, error, empty, success)
- Pagination functionality
- Responsive design across devices

## Related Components

- `ComplaintForm` - For creating/editing complaints
- `ComplaintDetail` - For viewing complaint details (to be implemented)
- `Button` - UI component for actions
- `Loading` - Loading states and skeletons

## Notes

- Following UI-first development approach
- No API calls in current implementation
- Ready for Phase 12 integration
- All TypeScript types properly defined
- Follows existing design patterns from the project
