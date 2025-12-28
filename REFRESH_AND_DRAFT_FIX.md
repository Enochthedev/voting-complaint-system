# Browser Refresh & Draft Display Fix

**Date:** 2025-12-28
**Status:** ✅ Fixed

## Problems Reported

1. **Browser refresh never loads data again** - After clicking browser refresh, data doesn't reload
2. **Draft only shows after logout/login** - After saving a draft, it only appears after logging out and back in

## Root Causes

### Problem 1: Browser Refresh Not Loading Data

**Root Cause #1**: `staleTime` was set to 1 minute
```typescript
// BEFORE:
staleTime: 1 * 60 * 1000,  // 1 minute
refetchOnMount: true,
```

**Issue**:
- React Query considers data "fresh" for 1 minute
- Even with `refetchOnMount: true`, if data is still "fresh", it won't refetch
- Refreshing the browser within 1 minute would show cached data
- Only after 1 minute would the data become "stale" and refetch

**Root Cause #2**: `refetchOnMount` was `true` instead of `'always'`
```typescript
refetchOnMount: true,  // Only refetches if data is stale
```

**Issue**:
- `refetchOnMount: true` only refetches if data is stale
- `refetchOnMount: 'always'` refetches even if data is fresh
- We need `'always'` to guarantee fresh data on every page load

### Problem 2: Draft Not Showing Until Logout/Login

**Root Cause**: Race condition between navigation and cache invalidation

**Flow Before Fix**:
```
1. User saves draft
   ↓
2. Mutation onSuccess fires
   ↓
3. queryClient.invalidateQueries() called (async)
   ↓
4. router.push('/complaints/drafts') executes immediately
   ↓
5. Drafts page mounts and fetches data
   ↓
6. Query uses CACHED data (invalidation hasn't completed yet)
   ↓
7. User sees old data (no new draft)
   ↓
8. Only after logout/login is cache cleared → fresh data
```

**The Problem**:
- `invalidateQueries()` is asynchronous but we don't wait for it
- `router.push()` navigates immediately
- New page mounts before cache invalidation completes
- Query returns cached data (the invalidation mark hasn't propagated yet)

---

## Fixes Applied

### Fix 1: Aggressive Cache Invalidation

**File:** `src/lib/react-query.tsx`

**Changes:**
1. Set `staleTime: 0` - All data is always stale, always refetch
2. Set `refetchOnMount: 'always'` - Always refetch on mount, never use cache
3. Reduced `gcTime` to 5 minutes (was 10)

**Code:**
```typescript
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // CRITICAL: Set staleTime to 0 to always fetch fresh data
        // This ensures browser refresh always loads new data
        staleTime: 0,

        // Unused data is garbage collected after 5 minutes
        gcTime: 5 * 60 * 1000,

        // CRITICAL: Always refetch on mount, even if data exists
        // This ensures page refresh loads fresh data
        refetchOnMount: 'always',

        // Other optimizations...
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        throwOnError: false,
      },
    },
  });
}
```

**Impact**:
- ✅ Every page load fetches fresh data from server
- ✅ Browser refresh always loads new data
- ✅ No stale cache issues
- ⚠️ More network requests (but with proper caching headers, server can still return 304 Not Modified)

### Fix 2: Full Page Reload After Mutation

**File:** `src/app/complaints/new/page.tsx`

**Changes:**
1. Added small delay (150ms) to ensure mutation completes
2. Use `window.location.href` instead of `router.push()` for navigation
3. This forces a full page reload, clearing all React state and cache

**Code:**
```typescript
// BEFORE:
if (isDraft) {
  toast.success('Your draft has been saved successfully!', 'Draft Saved');
  router.push('/complaints/drafts');  // ❌ Soft navigation, uses cached data
}

// AFTER:
if (isDraft) {
  toast.success('Your draft has been saved successfully!', 'Draft Saved');
  // Small delay to ensure mutation completes and cache invalidates
  setTimeout(() => {
    // Use window.location for full page reload to ensure fresh data
    window.location.href = '/complaints/drafts';  // ✅ Full reload
  }, 150);
}
```

**Why This Works**:
- `window.location.href` performs a full page reload
- Completely clears React state and React Query cache
- New page loads with fresh data from server
- Guarantees user sees the new draft immediately

---

## Trade-offs

### Advantages:
✅ Guaranteed fresh data on every page load
✅ Browser refresh always works
✅ No stale cache issues
✅ Drafts appear immediately after save
✅ Simpler mental model - data is always fresh

### Disadvantages:
⚠️ More network requests (every page load fetches data)
⚠️ Slightly slower page loads (no cache benefit)
⚠️ Full page reload on save (loses some SPA feel)

### Mitigation:
- Server can still use HTTP caching headers (ETag, Last-Modified)
- Browser will send `If-None-Match` or `If-Modified-Since`
- Server can return 304 Not Modified if data hasn't changed
- This reduces bandwidth while still guaranteeing fresh data

---

## Alternative Solutions Considered

### Alternative 1: Wait for Invalidation (Rejected)
```typescript
// Could wait for invalidation to complete:
await queryClient.invalidateQueries({ queryKey: complaintKeys.all });
router.push('/complaints/drafts');
```

**Why Rejected**:
- `invalidateQueries` doesn't return a promise we can await
- Would need to manually refetch and wait: `await queryClient.refetchQueries()`
- More complex, harder to maintain

### Alternative 2: Prefetch on Navigation (Rejected)
```typescript
// Could prefetch before navigating:
await queryClient.prefetchQuery({
  queryKey: complaintKeys.userDrafts(userId),
  queryFn: () => getUserDrafts(userId),
});
router.push('/complaints/drafts');
```

**Why Rejected**:
- Still complex
- Doesn't solve browser refresh issue
- Full page reload is simpler and more reliable

### Alternative 3: Optimistic Updates (Not Needed Here)
```typescript
// Could add draft to cache optimistically
queryClient.setQueryData(complaintKeys.userDrafts(userId), (old) => [
  ...old,
  newDraft,
]);
```

**Why Not Needed**:
- With `staleTime: 0`, data refetches anyway
- Optimistic updates are best for instant feedback
- Full reload is acceptable after save action

---

## Performance Considerations

### Impact on Network:
- **Before**: 1 request per minute (due to staleTime)
- **After**: 1 request per page load

**Example**:
- User refreshes 10 times: 10 requests (was: 1-2 requests)
- But most users don't refresh that often
- And server can still use HTTP 304 responses

### Impact on User Experience:
- **Positive**: Always see fresh data, no confusion
- **Negative**: Slightly longer page loads (waiting for network)
- **Trade-off**: Reliability > Speed for this application

### When This Matters:
- ✅ Good for: Data that changes frequently (complaints, drafts)
- ✅ Good for: Small datasets (user's complaints, not all complaints)
- ❌ Bad for: Static data (categories, status labels) - should use separate caching
- ❌ Bad for: Large datasets - should use pagination and smarter caching

---

## Future Optimizations

If network requests become a problem, consider:

1. **Selective Staleness**:
   ```typescript
   // Per-query override for static data
   useQuery({
     queryKey: ['categories'],
     queryFn: getCategories,
     staleTime: Infinity,  // Never stale
   });
   ```

2. **HTTP Caching**:
   - Add `ETag` headers to API responses
   - React Query will still make requests, but server returns 304
   - Reduces bandwidth without code changes

3. **Server-Side Caching**:
   - Cache at API level (Redis, etc.)
   - Fast responses even with frequent requests

4. **Smart Invalidation**:
   - Only invalidate specific queries, not `complaintKeys.all`
   - More granular, less over-fetching

---

## Files Modified

1. **src/lib/react-query.tsx**
   - Set `staleTime: 0`
   - Set `refetchOnMount: 'always'`
   - Reduced `gcTime: 5 * 60 * 1000`

2. **src/app/complaints/new/page.tsx**
   - Use `window.location.href` instead of `router.push()`
   - Added 150ms delay before navigation
   - Applied to both draft and submit flows

---

## Build Status

✅ **Build Successful**

```
Route (app)
├ 28 routes successfully built
├ 0 errors
├ 0 warnings
```

---

## Testing

### Test 1: Browser Refresh Loads Data

1. **Go to Dashboard**
2. **Note the current data** (number of complaints, etc.)
3. **Click browser refresh** (Cmd+R / Ctrl+R)
4. **Expected**: Loading state appears, then fresh data loads
5. **Verify**: Network tab shows new requests

### Test 2: Draft Shows Immediately After Save

1. **Go to `/complaints/new`**
2. **Fill in minimal data** (just title)
3. **Click "Save as Draft"**
4. **Expected**:
   - Success toast appears
   - Page navigates to `/complaints/drafts`
   - New draft appears in the list immediately
5. **Verify**: Draft is visible, no need to refresh

### Test 3: Submitted Complaint Shows Immediately

1. **Go to `/complaints/new`**
2. **Fill in all required fields**
3. **Click "Submit"**
4. **Expected**:
   - Success toast appears
   - Page navigates to `/dashboard`
   - New complaint appears in dashboard
5. **Verify**: Complaint count updated, complaint visible in list

### Test 4: Multiple Refreshes Work

1. **Go to any page with data**
2. **Refresh 5 times quickly**
3. **Expected**: Data loads every time
4. **Verify**: No stale data, no errors

---

## Summary

Fixed both critical issues:

1. ✅ **Browser refresh now loads data** - Set `staleTime: 0` and `refetchOnMount: 'always'`
2. ✅ **Drafts show immediately** - Use full page reload with `window.location.href`

Trade-off: More network requests, but guaranteed fresh data and better user experience.

If performance becomes an issue, implement HTTP caching headers on the server to reduce bandwidth while maintaining freshness guarantees.
