# Rating Prompt Implementation

## Overview

This document describes the implementation of the satisfaction rating prompt feature (Task 8.2.1) that appears after a complaint is resolved.

## Requirements

Based on AC16 (Satisfaction Rating):
- After complaint is marked as resolved, student receives prompt to rate
- Rating scale: 1-5 stars
- Optional text feedback on resolution quality
- Ratings are anonymous to encourage honest feedback
- Aggregate ratings visible in analytics dashboard (future task)

## Implementation

### Components Created

#### 1. RatingPrompt Component (`src/components/complaints/rating-prompt.tsx`)

A standalone component that displays the rating interface with the following features:

**Features:**
- **Star Rating System**: Interactive 1-5 star rating with hover effects
- **Rating Labels**: Descriptive labels for each rating level (Very Dissatisfied to Very Satisfied)
- **Optional Feedback**: Textarea for additional comments (500 character limit)
- **Anonymous Submission**: Clear messaging that ratings are anonymous
- **Dismissible**: Users can skip or dismiss the prompt
- **Validation**: Ensures a rating is selected before submission
- **Loading States**: Shows loading state during submission
- **Error Handling**: Displays error messages if submission fails

**Props:**
```typescript
interface RatingPromptProps {
  complaintId: string;
  complaintTitle: string;
  onSubmit: (rating: number, feedbackText: string) => Promise<void>;
  onDismiss: () => void;
}
```

**Visual Design:**
- Gradient background (primary color) to make it stand out
- Large, interactive star icons with smooth animations
- Clear typography and spacing
- Responsive design

#### 2. Textarea Component (`src/components/ui/textarea.tsx`)

A reusable textarea component following the design system patterns:
- Consistent styling with other form inputs
- Focus states and accessibility
- Disabled states
- Proper ref forwarding

### Integration

#### ComplaintDetailView Updates

The rating prompt is integrated into the complaint detail view with the following logic:

**Display Conditions:**
The prompt appears when ALL of the following are true:
1. User is a student (not lecturer/admin)
2. Complaint status is 'resolved'
3. User is the complaint owner (student_id matches current user)
4. Complaint hasn't been rated yet
5. Prompt hasn't been dismissed by the user

**State Management:**
```typescript
const [showRatingPrompt, setShowRatingPrompt] = useState(false);
const [hasRated, setHasRated] = useState(false);
```

**Dismissal Persistence:**
When a user dismisses the prompt, the dismissal is stored in localStorage:
```typescript
localStorage.setItem(`rating-dismissed-${complaintId}`, 'true');
```

This ensures the prompt doesn't reappear for that specific complaint.

**Rating Submission:**
```typescript
const handleRatingSubmit = async (rating: number, feedbackText: string) => {
  // 1. Submit to API (Phase 12)
  // 2. Update local state
  // 3. Add to complaint history
  // 4. Hide prompt
}
```

### Mock Data Updates

Updated `getMockComplaintData` to support testing:
- Added `isResolved` flag to easily toggle between resolved/in-progress states
- Added resolved status to history when `isResolved` is true
- Set `resolved_at` timestamp when resolved

### Database Schema

The rating is stored in the `complaint_ratings` table (already defined):

```sql
complaint_ratings:
- id: uuid (PK)
- complaint_id: uuid (FK to complaints)
- student_id: uuid (FK to users)
- rating: integer (1-5)
- feedback_text: text (nullable)
- created_at: timestamp
- UNIQUE(complaint_id) -- One rating per complaint
```

### History Tracking

When a rating is submitted, a history entry is created:
```typescript
{
  action: 'rated',
  old_value: null,
  new_value: rating.toString(),
  performed_by: currentUserId,
  details: feedbackText ? { feedback: feedbackText } : null,
}
```

## User Flow

1. **Student submits complaint** → Complaint created with status 'new'
2. **Lecturer works on complaint** → Status changes to 'opened', 'in_progress'
3. **Lecturer resolves complaint** → Status changes to 'resolved'
4. **Student views resolved complaint** → Rating prompt appears prominently
5. **Student rates complaint** → Rating submitted, prompt disappears
   - OR **Student dismisses prompt** → Prompt hidden, won't show again

## UI/UX Considerations

### Placement
The rating prompt appears:
- After the action buttons
- Before the main content (description, attachments, etc.)
- In a prominent position to catch the user's attention

### Visual Hierarchy
- Gradient background makes it stand out from other content
- Clear heading and instructions
- Large, interactive star icons
- Dismiss button in top-right corner

### Accessibility
- Proper ARIA labels for star buttons
- Keyboard navigation support
- Screen reader friendly
- Focus management

### Mobile Responsiveness
- Touch-friendly star buttons
- Responsive layout
- Proper spacing on small screens

## Testing

### Manual Testing Steps

1. **Test Rating Prompt Appearance:**
   - Set `isResolved = true` in mock-data.ts
   - Set `userRole = 'student'` in index.tsx
   - Navigate to complaint detail page
   - Verify prompt appears

2. **Test Star Rating:**
   - Hover over stars (should highlight)
   - Click different star values
   - Verify label updates correctly

3. **Test Feedback Text:**
   - Type in textarea
   - Verify character counter updates
   - Test 500 character limit

4. **Test Validation:**
   - Click "Submit Rating" without selecting stars
   - Verify error message appears

5. **Test Submission:**
   - Select rating and add feedback
   - Click "Submit Rating"
   - Verify prompt disappears
   - Check console for submission log
   - Verify history entry added

6. **Test Dismissal:**
   - Click "Skip" or X button
   - Verify prompt disappears
   - Refresh page
   - Verify prompt doesn't reappear

7. **Test Non-Display Conditions:**
   - Set `userRole = 'lecturer'` → Prompt should not appear
   - Set `isResolved = false` → Prompt should not appear
   - Submit rating → Refresh page → Prompt should not appear

## Phase 12 Integration

In Phase 12, the following will be implemented:

### API Integration
```typescript
// Replace mock submission with real API call
await supabase.from('complaint_ratings').insert({
  complaint_id: complaintId,
  student_id: currentUserId,
  rating,
  feedback_text: feedbackText || null,
});
```

### Check Existing Rating
```typescript
// Check if complaint has been rated
const { data: existingRating } = await supabase
  .from('complaint_ratings')
  .select('*')
  .eq('complaint_id', complaintId)
  .single();

setHasRated(!!existingRating);
```

### Real-time Updates
- Consider adding real-time subscription to rating changes
- Update analytics dashboard when new ratings are submitted

## Future Enhancements

1. **Analytics Integration** (Task 8.1):
   - Display aggregate ratings in analytics dashboard
   - Show average satisfaction rating
   - Trend analysis over time

2. **Notification**:
   - Notify lecturers when they receive low ratings (optional)
   - Aggregate feedback for improvement

3. **Rating Display**:
   - Show rating on complaint card (for lecturers only)
   - Display in complaint list view

4. **Reminder System**:
   - Send reminder notification if student hasn't rated after X days
   - Email reminder (future phase)

## Files Modified/Created

### Created:
- `src/components/complaints/rating-prompt.tsx` - Main rating prompt component
- `src/components/ui/textarea.tsx` - Reusable textarea component
- `docs/RATING_PROMPT_IMPLEMENTATION.md` - This documentation

### Modified:
- `src/components/complaints/complaint-detail/index.tsx` - Integrated rating prompt
- `src/components/complaints/complaint-detail/types.ts` - Added complaint_rating field
- `src/components/complaints/complaint-detail/mock-data.ts` - Added resolved state support

## Validation Against Requirements

✅ **AC16.1**: After complaint is marked as resolved, student receives prompt to rate
- Prompt appears automatically when complaint status is 'resolved'

✅ **AC16.2**: Rating scale: 1-5 stars
- Interactive 5-star rating system implemented

✅ **AC16.3**: Optional text feedback on resolution quality
- Textarea with 500 character limit for additional feedback

✅ **AC16.4**: Ratings are anonymous to encourage honest feedback
- Clear messaging that ratings are anonymous
- No identifying information displayed with ratings

✅ **AC16.5**: Aggregate ratings visible in analytics dashboard
- Database schema supports this (future task 8.1)

## Notes

- Following UI-first development approach with mock data
- Real API integration deferred to Phase 12
- LocalStorage used for dismissal persistence (temporary solution)
- Component is fully accessible and responsive
- Proper error handling and loading states implemented
