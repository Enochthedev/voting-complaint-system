# One Rating Per Complaint - Implementation Documentation

**Task**: Enforce one rating per complaint  
**Status**: ✅ COMPLETED  
**Validates**: Requirements AC16 (Satisfaction Rating)

## Overview

This document describes the implementation of the "one rating per complaint" enforcement mechanism. The system ensures that each complaint can only be rated once by the student who submitted it.

## Implementation Layers

### 1. Database Layer (Primary Enforcement)

**File**: `supabase/migrations/007_create_complaint_ratings_table.sql`

The database schema includes a `UNIQUE` constraint on the `complaint_id` column:

```sql
CREATE TABLE IF NOT EXISTS public.complaint_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: ensure one rating per complaint
  CONSTRAINT unique_complaint_rating UNIQUE(complaint_id),
  
  -- Constraint: rating must be between 1 and 5
  CONSTRAINT rating_range_check CHECK (rating >= 1 AND rating <= 5)
);
```

**Benefits**:
- ✅ Guarantees data integrity at the database level
- ✅ Prevents duplicate ratings even if application logic fails
- ✅ Atomic enforcement - no race conditions possible
- ✅ Works across all application instances

### 2. API Layer (Application Enforcement)

**File**: `src/lib/api/complaints.ts`

The `submitRating` function includes multiple validation checks:

```typescript
export async function submitRating(
  complaintId: string,
  studentId: string,
  rating: number,
  feedbackText?: string
) {
  const supabase = getSupabaseClient();

  // 1. Validate rating is between 1-5
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // 2. Check if complaint exists and is resolved
  const { data: complaint, error: complaintError } = await supabase
    .from('complaints')
    .select('id, status, student_id')
    .eq('id', complaintId)
    .single();

  if (complaintError) throw complaintError;
  if (!complaint) throw new Error('Complaint not found');
  if (complaint.status !== 'resolved') {
    throw new Error('Can only rate resolved complaints');
  }
  if (complaint.student_id !== studentId) {
    throw new Error('Only the complaint owner can rate');
  }

  // 3. Check if already rated (CRITICAL CHECK)
  const { data: existingRating, error: checkError } = await supabase
    .from('complaint_ratings')
    .select('id')
    .eq('complaint_id', complaintId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existingRating) {
    throw new Error('You have already rated this complaint');
  }

  // 4. Insert rating
  const { data: newRating, error: insertError } = await supabase
    .from('complaint_ratings')
    .insert({
      complaint_id: complaintId,
      student_id: studentId,
      rating,
      feedback_text: feedbackText || null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // 5. Log rating in history
  await supabase
    .from('complaint_history')
    .insert({
      complaint_id: complaintId,
      action: 'rated',
      old_value: null,
      new_value: rating.toString(),
      performed_by: studentId,
      details: feedbackText ? { feedback: feedbackText } : null,
    });

  return newRating;
}
```

**Helper Function**: `hasRatedComplaint`

```typescript
export async function hasRatedComplaint(
  complaintId: string, 
  studentId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('complaint_ratings')
    .select('id')
    .eq('complaint_id', complaintId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    console.error('Error checking rating status:', error);
    return false;
  }

  return !!data;
}
```

**Benefits**:
- ✅ Provides clear error messages to users
- ✅ Validates business rules before database interaction
- ✅ Prevents unnecessary database operations
- ✅ Enables better user experience with specific error handling

### 3. UI Layer (User Experience)

**File**: `src/components/complaints/complaint-detail/index.tsx`

The complaint detail view checks if a rating exists before showing the rating prompt:

```typescript
React.useEffect(() => {
  const loadComplaint = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load complaint data
      const mockData = getMockComplaintData(complaintId);
      setComplaint(mockData);

      // Check if complaint has been rated using the API function
      // This properly checks the complaint_ratings table
      const { hasRatedComplaint } = await import('@/lib/api/complaints');
      const hasExistingRating = await hasRatedComplaint(complaintId, currentUserId);
      setHasRated(hasExistingRating);

      // Check if rating prompt was dismissed
      const wasDismissed = localStorage.getItem(`rating-dismissed-${complaintId}`) === 'true';

      // Show rating prompt if:
      // 1. User is a student
      // 2. Complaint is resolved
      // 3. User is the complaint owner
      // 4. Hasn't been rated yet
      // 5. Hasn't been dismissed
      const shouldShowPrompt =
        userRole === 'student' &&
        mockData.status === 'resolved' &&
        mockData.student_id === currentUserId &&
        !hasExistingRating &&
        !wasDismissed;

      setShowRatingPrompt(shouldShowPrompt);
    } catch (err) {
      setError('Failed to load complaint details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  loadComplaint();
}, [complaintId, currentUserId, userRole]);
```

**Error Handling in Rating Submission**:

```typescript
const handleRatingSubmit = async (rating: number, feedbackText: string) => {
  if (!complaint) return;

  try {
    const { submitRating } = await import('@/lib/api/complaints');
    
    // Submit rating to database
    // This will throw an error if the user has already rated
    await submitRating(complaintId, currentUserId, rating, feedbackText);

    // Update local state
    setHasRated(true);
    setShowRatingPrompt(false);

    // Update UI with new rating
    // ... (history update code)
  } catch (err) {
    console.error('Error submitting rating:', err);
    
    // If the error is about already rating, update the UI state
    if (err instanceof Error && err.message.includes('already rated')) {
      setHasRated(true);
      setShowRatingPrompt(false);
    }
    
    throw err;
  }
};
```

**Benefits**:
- ✅ Prevents showing rating prompt if already rated
- ✅ Gracefully handles duplicate rating attempts
- ✅ Updates UI state when duplicate detected
- ✅ Provides clear feedback to users

## Validation Rules

The system enforces the following rules:

1. **One Rating Per Complaint**: Each complaint can only be rated once (enforced by database constraint)
2. **Rating Range**: Rating must be between 1 and 5 stars (enforced by database constraint and API validation)
3. **Resolved Only**: Only resolved complaints can be rated (enforced by API validation)
4. **Owner Only**: Only the student who submitted the complaint can rate it (enforced by API validation)
5. **Student Only**: Only students can submit ratings (enforced by RLS policies and UI logic)

## Row Level Security (RLS)

The database includes RLS policies to ensure proper access control:

```sql
-- Students can rate their own resolved complaints
CREATE POLICY "Students rate own resolved complaints"
  ON public.complaint_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id
      AND student_id = auth.uid()
      AND status = 'resolved'
    )
  );

-- Students can view their own ratings
CREATE POLICY "Students view own ratings"
  ON public.complaint_ratings
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

## Error Messages

The system provides clear error messages for different scenarios:

| Scenario | Error Message |
|----------|---------------|
| Already rated | "You have already rated this complaint" |
| Invalid rating | "Rating must be between 1 and 5" |
| Not resolved | "Can only rate resolved complaints" |
| Not owner | "Only the complaint owner can rate" |
| Complaint not found | "Complaint not found" |

## Testing

**Test File**: `src/lib/api/__tests__/complaints-rating.test.ts`

The test suite covers:

1. ✅ Successfully submitting a rating for the first time
2. ✅ Throwing error when trying to rate the same complaint twice
3. ✅ Throwing error when rating is not between 1-5
4. ✅ Throwing error when complaint is not resolved
5. ✅ Throwing error when student is not the complaint owner
6. ✅ Checking if a complaint has been rated (hasRatedComplaint)
7. ✅ Handling errors when checking rating status

## User Flow

### Happy Path

1. Student submits a complaint
2. Lecturer resolves the complaint
3. Student views the resolved complaint
4. System checks if complaint has been rated (using `hasRatedComplaint`)
5. If not rated, system shows rating prompt
6. Student submits rating (1-5 stars + optional feedback)
7. System validates and saves rating
8. Rating prompt is hidden
9. Rating is logged in complaint history

### Duplicate Rating Attempt

1. Student tries to rate a complaint they've already rated
2. System checks database for existing rating
3. System returns error: "You have already rated this complaint"
4. UI updates to hide rating prompt
5. User sees their previous rating in the complaint history

## Database Schema

```
complaint_ratings
├── id (UUID, PRIMARY KEY)
├── complaint_id (UUID, UNIQUE, FOREIGN KEY -> complaints.id)
├── student_id (UUID, FOREIGN KEY -> users.id)
├── rating (INTEGER, CHECK: 1-5)
├── feedback_text (TEXT, OPTIONAL)
└── created_at (TIMESTAMP)
```

## Key Files Modified

1. ✅ `src/lib/api/complaints.ts` - Added validation in `submitRating` function
2. ✅ `src/components/complaints/complaint-detail/index.tsx` - Updated to use `hasRatedComplaint`
3. ✅ `src/lib/api/__tests__/complaints-rating.test.ts` - Created comprehensive test suite
4. ✅ `supabase/migrations/007_create_complaint_ratings_table.sql` - Already has UNIQUE constraint

## Verification Checklist

- [x] Database constraint `UNIQUE(complaint_id)` exists
- [x] API function checks for existing rating before insert
- [x] API function validates rating range (1-5)
- [x] API function validates complaint is resolved
- [x] API function validates student is complaint owner
- [x] UI checks if complaint has been rated before showing prompt
- [x] UI handles duplicate rating error gracefully
- [x] Error messages are clear and user-friendly
- [x] Test suite covers all scenarios
- [x] RLS policies enforce proper access control

## Conclusion

The "one rating per complaint" enforcement is implemented at three layers:

1. **Database**: UNIQUE constraint prevents duplicates at the data level
2. **API**: Validation logic provides clear error messages and business rule enforcement
3. **UI**: Proactive checking prevents showing rating prompt when already rated

This multi-layered approach ensures data integrity while providing an excellent user experience.

**Status**: ✅ Implementation Complete
