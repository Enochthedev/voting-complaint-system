# Draft Save Validation Fix

## Issue

Users were encountering a "Failed to Save Draft - Validation failed" error when trying to save complaints as drafts, even with empty or minimal content.

## Root Cause

The `CreateComplaintSchema` in `src/lib/validation.ts` was applying strict field validation to all complaints, including drafts. The schema had:

1. **Basic field validation**: Applied `.max()` length limits and `.trim()` to title and description for ALL complaints
2. **Conditional validation**: Used `.refine()` to require fields only for non-drafts

The issue was that the basic validation was too strict for drafts - empty strings after trimming were causing validation failures.

## Solution

Modified the `CreateComplaintSchema` to be more lenient for drafts:

### Before

```typescript
export const CreateComplaintSchema = z
  .object({
    title: z.string().max(200, 'Title must be 200 characters or less').trim(),
    description: z.string().max(5000, 'Description must be 5000 characters or less').trim(),
    // ... other fields
  })
  .refine(
    (data) => {
      if (!data.is_draft) {
        return (
          data.title.trim().length >= 1 &&
          data.description.trim().length >= 10 &&
          data.category !== '' &&
          data.priority !== ''
        );
      }
      return true;
    }
    // ...
  );
```

### After

```typescript
export const CreateComplaintSchema = z
  .object({
    title: z.string().trim(),
    description: z.string().trim(),
    // ... other fields (no max length in basic validation)
  })
  .refine(
    (data) => {
      // For non-drafts, require all fields with proper validation
      if (!data.is_draft) {
        return (
          data.title.trim().length >= 1 &&
          data.title.trim().length <= 200 &&
          data.description.trim().length >= 10 &&
          data.description.trim().length <= 5000 &&
          data.category !== '' &&
          data.priority !== ''
        );
      }
      // For drafts, only validate length limits if content exists
      if (data.title.trim().length > 200) {
        return false;
      }
      if (data.description.trim().length > 5000) {
        return false;
      }
      return true;
    },
    {
      message:
        'For submitted complaints: Title (1-200 chars), description (10-5000 chars), category, and priority are required. For drafts: Title max 200 chars, description max 5000 chars.',
    }
  );
```

## Key Changes

1. **Removed basic field length validation**: No longer apply `.max()` constraints at the object level
2. **Moved all validation to `.refine()`**: Both required field validation and length limits are now handled in the conditional validation
3. **Improved draft validation**: Drafts now only validate length limits if content exists
4. **Better error message**: Updated to clearly explain different requirements for drafts vs. submitted complaints

## Validation Behavior

### For Drafts (`is_draft: true`)

- ✅ Empty title and description allowed
- ✅ Empty category and priority allowed
- ✅ Title up to 200 characters allowed
- ✅ Description up to 5000 characters allowed
- ❌ Title over 200 characters rejected
- ❌ Description over 5000 characters rejected

### For Submitted Complaints (`is_draft: false`)

- ❌ Empty title rejected
- ❌ Description under 10 characters rejected
- ❌ Empty category rejected
- ❌ Empty priority rejected
- ❌ Title over 200 characters rejected
- ❌ Description over 5000 characters rejected

## Testing

Created and ran comprehensive validation tests to ensure:

- Empty drafts pass validation
- Partial drafts pass validation
- Regular complaints still require all fields
- Invalid complaints are properly rejected
- Length limits are enforced correctly

## Files Modified

- `src/lib/validation.ts` - Updated `CreateComplaintSchema`

## Impact

- ✅ Users can now save empty drafts without validation errors
- ✅ Users can save partial drafts with minimal content
- ✅ Regular complaint submission validation remains strict
- ✅ No breaking changes to existing functionality
- ✅ Improved user experience for draft workflow

## Status

**RESOLVED** - Draft save functionality now works correctly with appropriate validation for both drafts and submitted complaints.
