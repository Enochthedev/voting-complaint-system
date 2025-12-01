# Rate Limiting Quick Reference

## Overview

All API functions in the Student Complaint Resolution System are protected by rate limiting to prevent abuse and ensure fair usage.

## Rate Limits

| Operation | Limit        | Window     |
| --------- | ------------ | ---------- |
| Read      | 100 requests | 60 seconds |
| Write     | 30 requests  | 60 seconds |
| Bulk      | 10 requests  | 60 seconds |
| Auth      | 20 requests  | 60 seconds |
| Search    | 50 requests  | 60 seconds |
| Upload    | 20 requests  | 60 seconds |

## Usage

### Basic Usage (Automatic)

Rate limiting is automatically applied to all API functions:

```typescript
import { getUserComplaints } from '@/lib/api/complaints';

// Rate limiting is automatic
const complaints = await getUserComplaints(userId);
```

### Error Handling

```typescript
import { RateLimitError } from '@/lib/rate-limiter';

try {
  await createComplaint(data);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Rate limit exceeded
    console.log(`Retry after ${error.retryAfter} seconds`);
    toast.error(`Too many requests. Please wait ${error.retryAfter}s`);
  } else {
    // Other error
    toast.error('Failed to create complaint');
  }
}
```

### Check Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/lib/rate-limiter';

const status = getRateLimitStatus('read');
console.log(`${status.remaining}/${status.limit} requests remaining`);
console.log(`Resets at: ${status.resetAt}`);
```

### Custom Rate Limiting

For new API functions:

```typescript
import { withRateLimit } from '@/lib/rate-limiter';

async function myApiFunction(param: string) {
  // Your logic
  return result;
}

// Wrap with rate limiting
export const rateLimitedFunction = withRateLimit(
  myApiFunction,
  'write' // Operation type
);
```

## Protected APIs

### Complaints API

- ✅ `getUserComplaints()` - Read
- ✅ `getUserDrafts()` - Read
- ✅ `getUserComplaintStats()` - Read
- ✅ `getAllComplaints()` - Read
- ✅ `getComplaintById()` - Read
- ✅ `createComplaint()` - Write
- ✅ `updateComplaint()` - Write
- ✅ `deleteComplaint()` - Write
- ✅ `reopenComplaint()` - Write
- ✅ `submitRating()` - Write
- ✅ `hasRatedComplaint()` - Read
- ✅ `getUserAverageRating()` - Read
- ✅ `bulkAssignComplaints()` - Bulk
- ✅ `bulkChangeStatus()` - Bulk
- ✅ `bulkAddTags()` - Bulk

### Notifications API

- ✅ `fetchNotifications()` - Read
- ✅ `markNotificationAsRead()` - Write
- ✅ `markAllNotificationsAsRead()` - Write
- ✅ `getUnreadNotificationCount()` - Read

### Votes API

- ✅ `getVotes()` - Read
- ✅ `getVoteById()` - Read
- ✅ `createVote()` - Write
- ✅ `updateVote()` - Write
- ✅ `deleteVote()` - Write
- ✅ `submitVoteResponse()` - Write
- ✅ `getVoteResponses()` - Read
- ✅ `hasStudentVoted()` - Read
- ✅ `getVoteResults()` - Read
- ✅ `closeVote()` - Write
- ✅ `reopenVote()` - Write

### Announcements API

- ✅ `getAnnouncements()` - Read
- ✅ `getAnnouncementById()` - Read
- ✅ `createAnnouncement()` - Write
- ✅ `updateAnnouncement()` - Write
- ✅ `deleteAnnouncement()` - Write
- ✅ `getRecentAnnouncements()` - Read

## UI Integration

### Show Rate Limit Error

```typescript
import { toast } from '@/components/ui/toast';

try {
  await apiCall();
} catch (error) {
  if (error instanceof RateLimitError) {
    toast.error({
      title: 'Too Many Requests',
      description: `Please wait ${error.retryAfter} seconds before trying again.`,
    });
  }
}
```

### Disable Button on Rate Limit

```typescript
const [isRateLimited, setIsRateLimited] = useState(false);

const handleSubmit = async () => {
  try {
    await createComplaint(data);
  } catch (error) {
    if (error instanceof RateLimitError) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), error.retryAfter * 1000);
    }
  }
};

<button disabled={isRateLimited}>
  {isRateLimited ? 'Rate Limited...' : 'Submit'}
</button>
```

## Testing

### Run Tests

```bash
node scripts/test-rate-limiting.js
```

### Test in Browser

Use the demo component:

```typescript
import { RateLimitDemo } from '@/components/examples/rate-limit-demo';

// Add to a page
<RateLimitDemo />
```

## Configuration

To adjust rate limits, edit `src/lib/rate-limiter.ts`:

```typescript
const RATE_LIMITS = {
  read: {
    maxRequests: 100, // Change this
    windowMs: 60000,
  },
  // ...
};
```

## Troubleshooting

### "Rate limit exceeded" error

**Cause**: Too many requests in a short time
**Solution**: Wait for the retry-after period, then try again

### Rate limits too restrictive

**Cause**: Legitimate use case requires more requests
**Solution**: Adjust limits in `rate-limiter.ts` or use a different operation type

### Rate limits not working

**Cause**: Function not wrapped with `withRateLimit`
**Solution**: Ensure all API functions use the rate limiter wrapper

## Best Practices

1. ✅ Always handle `RateLimitError` in UI code
2. ✅ Show user-friendly error messages
3. ✅ Disable buttons/forms when rate limited
4. ✅ Use appropriate operation types (read/write/bulk)
5. ✅ Batch operations when possible to reduce API calls
6. ✅ Cache data on the client to minimize requests

## Related Documentation

- [Full Implementation Guide](./RATE_LIMITING_IMPLEMENTATION.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [API Documentation](./API_DOCUMENTATION.md)
