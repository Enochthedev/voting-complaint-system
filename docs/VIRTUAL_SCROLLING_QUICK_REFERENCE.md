# Virtual Scrolling - Quick Reference

## What is Virtual Scrolling?

Virtual scrolling only renders items visible in the viewport, dramatically improving performance for large lists.

## When to Use

- ✅ Lists with 50+ items
- ✅ Potentially unbounded data
- ✅ Performance-critical scrolling
- ❌ Small lists (< 50 items)
- ❌ Variable height items (without proper configuration)

## Quick Start

### Automatic (Recommended)

```typescript
import { ComplaintsGrid } from '@/components/complaints';

// Automatically uses virtual scrolling for 50+ items
<ComplaintsGrid
  complaints={complaints}
  userRole={userRole}
  isLoading={isLoading}
  currentPage={currentPage}
  totalPages={totalPages}
  useSearch={useSearch}
  onComplaintClick={handleClick}
  onPageChange={handlePageChange}
  onClearSearch={handleClearSearch}
/>
```

### Manual

```typescript
import { ComplaintListVirtualized } from '@/components/complaints';

<ComplaintListVirtualized
  complaints={complaints}
  onComplaintClick={handleClick}
  containerHeight={600}
  estimateSize={200}
/>
```

## Components

### ComplaintListVirtualized

```typescript
<ComplaintListVirtualized
  complaints={complaints}           // Required: Array of complaints
  onComplaintClick={handleClick}    // Optional: Click handler
  containerHeight={600}             // Optional: Container height in px
  estimateSize={200}                // Optional: Estimated item height
  selectionMode={false}             // Optional: Enable selection
  selectedIds={new Set()}           // Optional: Selected IDs
  onSelectionChange={setSelected}   // Optional: Selection handler
  searchQuery=""                    // Optional: Search highlighting
/>
```

### NotificationListVirtualized

```typescript
<NotificationListVirtualized
  notifications={notifications}     // Required: Array of notifications
  onMarkAsRead={handleMarkRead}     // Required: Mark as read handler
  onClick={handleClick}             // Required: Click handler
  containerHeight={600}             // Optional: Container height
  estimateSize={120}                // Optional: Estimated item height
/>
```

## Hooks

### useVirtualScrolling

```typescript
import { useVirtualScrolling } from '@/hooks/use-virtual-scrolling';

const shouldUseVirtual = useVirtualScrolling(items.length, {
  threshold: 50, // Enable for 50+ items
  forceVirtual: false, // Force enable
  disableVirtual: false, // Force disable
});
```

### useContainerHeight

```typescript
import { useContainerHeight } from '@/hooks/use-virtual-scrolling';

const height = useContainerHeight(
  600, // Default height
  0.7 // Max 70% of viewport
);
```

## Configuration

### Change Threshold

```typescript
// Enable virtual scrolling for 100+ items instead of 50
const shouldUseVirtual = useVirtualScrolling(items.length, {
  threshold: 100,
});
```

### Adjust Container Height

```typescript
<ComplaintListVirtualized
  containerHeight={800}  // Taller container
  // ...
/>
```

### Optimize Item Size

```typescript
<ComplaintListVirtualized
  estimateSize={250}  // If items are ~250px tall
  // ...
/>
```

## Performance Metrics

| Items  | DOM Nodes | Performance Gain |
| ------ | --------- | ---------------- |
| 50     | ~15       | 3.3x             |
| 100    | ~15       | 6.7x             |
| 1,000  | ~15       | 67x              |
| 10,000 | ~15       | 667x             |

## Demo

Visit `/demo/virtual-scrolling` to:

- Test with 50 to 10,000 items
- See performance metrics
- Compare with/without virtual scrolling

## Common Issues

### Items Not Rendering

- Check `estimateSize` is reasonable
- Ensure items have proper height

### Jumpy Scrolling

- Use consistent item heights
- Provide accurate `estimateSize`

### Still Slow

- Optimize item component
- Reduce expensive operations
- Check for unnecessary re-renders

## Best Practices

1. ✅ Use `ComplaintsGrid` for automatic switching
2. ✅ Provide accurate `estimateSize`
3. ✅ Keep item heights consistent
4. ✅ Use `useContainerHeight` for responsive sizing
5. ❌ Don't use for small lists (< 50 items)
6. ❌ Don't perform expensive operations in item render

## Examples

### With Search

```typescript
<ComplaintListVirtualized
  complaints={searchResults}
  searchQuery={query}
  isSearchResult={true}
  onClearSearch={clearSearch}
/>
```

### With Selection

```typescript
const [selected, setSelected] = useState(new Set());

<ComplaintListVirtualized
  complaints={complaints}
  selectionMode={true}
  selectedIds={selected}
  onSelectionChange={setSelected}
/>
```

### Custom Height

```typescript
const height = useContainerHeight(800, 0.8);

<ComplaintListVirtualized
  complaints={complaints}
  containerHeight={height}
/>
```

## Testing

```bash
# 1. Navigate to demo page
/demo/virtual-scrolling

# 2. Generate 10,000 items
# 3. Verify smooth scrolling
# 4. Open DevTools > Elements
# 5. Confirm ~15 items in DOM
```

## Resources

- [Full Documentation](./VIRTUAL_SCROLLING_IMPLEMENTATION.md)
- [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
- [Demo Page](/demo/virtual-scrolling)
