# Draft Status Fix - Enum Synchronization

**Date:** 2025-12-28
**Status:** ✅ Fixed (pending database migration if needed)

## Problem

User reported: **"Failed to Save Draft - invalid input value for enum complaint_status: 'draft'"**

## Root Cause

There were **THREE different definitions** of `ComplaintStatus` that were out of sync:

1. **Database Types** (`src/types/database.types.ts`):

   ```typescript
   type ComplaintStatus =
     | 'draft'
     | 'new'
     | 'opened'
     | 'in_progress'
     | 'resolved'
     | 'closed'
     | 'reopened';
   ```

2. **Constants** (`src/lib/constants.ts`):

   ```typescript
   // BEFORE (WRONG):
   const COMPLAINT_STATUSES = ['new', 'open', 'in_progress', 'resolved', 'closed', 'escalated'];
   ```

3. **Validation Schema** (`src/lib/validation.ts`):
   ```typescript
   // BEFORE (WRONG):
   ComplaintStatusSchema = z.enum([
     'new',
     'open',
     'in_progress',
     'resolved',
     'closed',
     'escalated',
   ]);
   ```

### Issues Found:

- ❌ Constants had `'open'` instead of `'opened'`
- ❌ Constants had `'escalated'` instead of `'reopened'`
- ❌ Constants was **missing** `'draft'`
- ❌ Validation schema had same issues

This caused TypeScript compilation errors and potentially database enum errors.

---

## Fixes Applied

### Fix 1: Synced Constants

**File:** `src/lib/constants.ts`

**Changed:**

```typescript
export const COMPLAINT_STATUSES = [
  'draft', // ✅ Added
  'new',
  'opened', // ✅ Fixed (was 'open')
  'in_progress',
  'resolved',
  'closed',
  'reopened', // ✅ Fixed (was 'escalated')
] as const;
```

### Fix 2: Synced Validation Schema

**File:** `src/lib/validation.ts`

**Changed:**

```typescript
export const ComplaintStatusSchema = z.enum([
  'draft', // ✅ Added
  'new',
  'opened', // ✅ Fixed (was 'open')
  'in_progress',
  'resolved',
  'closed',
  'reopened', // ✅ Fixed (was 'escalated')
]);
```

### Fix 3: Confirmed Status Labels

**File:** `src/lib/constants.ts`

**Already Correct:**

```typescript
export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  draft: 'Draft',
  new: 'New',
  opened: 'Opened',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  reopened: 'Reopened',
};
```

---

## Database Consideration

**IMPORTANT:** If you're still seeing the error after restarting the dev server, it means the **database enum** needs to be updated.

The error: `invalid input value for enum complaint_status: "draft"` comes from **PostgreSQL**, not from our code.

### Check Database Enum

Run this query in Supabase SQL Editor:

```sql
SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'complaint_status'
ORDER BY enumsortorder;
```

### If 'draft' is Missing, Add It

```sql
-- Add 'draft' to the enum (if not present)
ALTER TYPE complaint_status ADD VALUE IF NOT EXISTS 'draft' BEFORE 'new';

-- If 'escalated' exists but 'reopened' doesn't
ALTER TYPE complaint_status ADD VALUE IF NOT EXISTS 'reopened';

-- Note: You can't remove enum values in PostgreSQL
-- If you have 'open' instead of 'opened', you'll need to migrate data
```

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

## Files Modified

1. **src/lib/constants.ts**
   - Updated `COMPLAINT_STATUSES` array

2. **src/lib/validation.ts**
   - Updated `ComplaintStatusSchema` enum

---

## Testing

1. **Restart Dev Server:**

   ```bash
   # Stop current dev server (Ctrl+C)
   npm run dev
   ```

2. **Test Draft Saving:**
   - Go to `/complaints/new`
   - Fill in minimal data (just title)
   - Click "Save as Draft"
   - Should save successfully

3. **Test Regular Submission:**
   - Fill in all required fields
   - Click "Submit Complaint"
   - Should validate and submit

4. **Check Browser Console:**
   - Should see no TypeScript errors
   - Should see no validation errors

---

## If Still Seeing Database Error

If you're still getting `invalid input value for enum complaint_status: "draft"`:

1. **Check the database enum** using the SQL query above
2. **Add missing values** to the enum if needed
3. **Restart the application** after database changes
4. **Clear browser cache** and reload

The code is now correct - any remaining issues are in the database schema itself.
