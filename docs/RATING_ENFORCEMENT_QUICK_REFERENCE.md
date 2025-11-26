# One Rating Per Complaint - Quick Reference

**Status**: ✅ COMPLETED  
**Validates**: Requirements AC16 (Satisfaction Rating)

## Summary

The system enforces that each complaint can only be rated once by the student who submitted it. This is implemented at three layers: database, API, and UI.

## Key Components

### 1. Database Constraint
```sql
-- In: supabase/migrations/007_create_complaint_ratings_table.sql
CONSTRAINT unique_complaint_rating UNIQUE(complaint_id)
```

### 2. API Functions

**Submit Rating** (`src/lib/api/complaints.ts`):
```typescript
await submitRating(complaintId, studentId, rating, feedbackText);
// Throws: "You have already rated this complaint" if duplicate
```

**Check Rating Status** (`src/lib/api/complaints.ts`):
```typescript
const hasRated = await hasRatedComplaint(complaintId, studentId);
// Returns: true if rated, false if not
```

### 3. UI Integration

**Complaint Detail View** (`src/components/complaints/complaint-detail/index.tsx`):
- Checks if complaint has been rated on load
- Only shows rating prompt if not rated
- Handles duplicate rating errors gracefully

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| One rating per complaint | Database UNIQUE constraint + API check |
| Rating range (1-5) | Database CHECK constraint + API validation |
| Only resolved complaints | API validation |
| Only complaint owner | API validation + RLS policy |
| Only students can rate | RLS policy + UI logic |

## Error Messages

```typescript
// Rating already exists
"You have already rated this complaint"

// Invalid rating value
"Rating must be between 1 and 5"

// Complaint not resolved
"Can only rate resolved complaints"

// Not complaint owner
"Only the complaint owner can rate"
```

## Usage Example

```typescript
// Check if already rated
const hasRated = await hasRatedComplaint(complaintId, userId);

if (!hasRated) {
  // Show rating form
  try {
    await submitRating(complaintId, userId, 5, "Great service!");
    // Success - rating saved
  } catch (error) {
    if (error.message.includes('already rated')) {
      // Handle duplicate rating attempt
    }
  }
}
```

## Testing

Run tests with:
```bash
npm test -- src/lib/api/__tests__/complaints-rating.test.ts --run
```

Test coverage:
- ✅ First-time rating submission
- ✅ Duplicate rating prevention
- ✅ Invalid rating values
- ✅ Non-resolved complaints
- ✅ Non-owner attempts
- ✅ Rating status checking

## Files Modified

1. `src/lib/api/complaints.ts` - Added validation logic
2. `src/components/complaints/complaint-detail/index.tsx` - Updated to check rating status
3. `src/lib/api/__tests__/complaints-rating.test.ts` - Test suite
4. `docs/RATING_ENFORCEMENT_IMPLEMENTATION.md` - Full documentation

## Related Documentation

- Full Implementation: `docs/RATING_ENFORCEMENT_IMPLEMENTATION.md`
- Database Schema: `supabase/migrations/007_create_complaint_ratings_table.sql`
- Rating Form: `src/components/complaints/rating-form.tsx`
- Rating Prompt: `src/components/complaints/rating-prompt.tsx`
