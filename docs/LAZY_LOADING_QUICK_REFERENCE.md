# Lazy Loading Quick Reference Guide

## Quick Start

### Lazy Load a Component

```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// 1. Create lazy component
const MyComponent = lazy(() =>
  import('./my-component').then(mod => ({ default: mod.MyComponent }))
);

// 2. Wrap with Suspense
function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <MyComponent />
    </Suspense>
  );
}
```

### Lazy Load an Image

```typescript
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={75}
/>
```

### Use Intersection Observer

```typescript
import { useLazyLoad } from '@/hooks/use-lazy-load';

function LazySection() {
  const { ref, isInView } = useLazyLoad();

  return (
    <div ref={ref}>
      {isInView ? <Content /> : <Skeleton />}
    </div>
  );
}
```

## Available Skeletons

```typescript
import {
  DashboardGridSkeleton,
  ComplaintCardSkeleton,
  ComplaintDetailSkeleton,
  VoteCardSkeleton,
  AnnouncementCardSkeleton,
  ChartSkeleton,
} from '@/components/ui/skeletons';
```

## Loading Fallbacks

```typescript
import {
  PageLoadingFallback,
  CardLoadingFallback,
  FormLoadingFallback,
  ListLoadingFallback,
  ChartLoadingFallback,
} from '@/lib/utils/lazy-load';
```

## Configuration

Edit `src/lib/config/lazy-loading.config.ts` to customize:

- Intersection Observer settings
- Image quality presets
- Component priorities
- Route prefetch behavior

## Best Practices

✅ **DO:**

- Lazy load below-fold components
- Use appropriate loading skeletons
- Lazy load modal/dialog content
- Lazy load heavy charts/visualizations

❌ **DON'T:**

- Lazy load critical above-fold content
- Lazy load small components
- Lazy load navigation components
- Over-optimize (measure first!)

## Common Patterns

### Modal with Lazy Form

```typescript
const FormComponent = lazy(() => import('./form'));

{showModal && (
  <Dialog>
    <Suspense fallback={<FormLoadingFallback />}>
      <FormComponent />
    </Suspense>
  </Dialog>
)}
```

### Lazy Tab Content

```typescript
const Tab1 = lazy(() => import('./tab1'));
const Tab2 = lazy(() => import('./tab2'));

<Tabs>
  <TabContent value="tab1">
    <Suspense fallback={<Skeleton />}>
      <Tab1 />
    </Suspense>
  </TabContent>
  <TabContent value="tab2">
    <Suspense fallback={<Skeleton />}>
      <Tab2 />
    </Suspense>
  </TabContent>
</Tabs>
```

### Lazy Image Gallery

```typescript
import { LazyAttachmentList } from '@/components/complaints/lazy-attachment-preview';

<LazyAttachmentList
  attachments={attachments}
  onDownload={handleDownload}
  onPreview={handlePreview}
/>
```

## Troubleshooting

### Component not loading?

- Check browser console for errors
- Verify import path is correct
- Ensure component is default export

### Layout shift during load?

- Use skeleton with same dimensions
- Set explicit height/width
- Use `min-height` on container

### Slow loading?

- Check network tab in DevTools
- Verify chunk size isn't too large
- Consider splitting into smaller chunks

## Performance Tips

1. **Measure first**: Use Lighthouse before optimizing
2. **Bundle analysis**: Run `npm run analyze` to see chunk sizes
3. **Network throttling**: Test on slow 3G
4. **Monitor metrics**: Track Core Web Vitals
5. **Progressive enhancement**: Start with critical content

## Related Files

- `src/components/ui/lazy-image.tsx` - Image lazy loading
- `src/components/complaints/lazy-attachment-preview.tsx` - Attachment lazy loading
- `src/hooks/use-lazy-load.ts` - Lazy loading hooks
- `src/lib/utils/lazy-load.tsx` - Utility functions
- `src/lib/config/lazy-loading.config.ts` - Configuration

## Examples in Codebase

- Dashboard: `src/app/dashboard/page.tsx`
- Complaints: `src/app/complaints/page.tsx`
- Votes: `src/app/votes/page.tsx`
- Admin Templates: `src/app/admin/templates/page.tsx`
- Announcements: `src/app/announcements/page.tsx`

---

For detailed documentation, see [LAZY_LOADING_COMPLETE.md](./LAZY_LOADING_COMPLETE.md)
