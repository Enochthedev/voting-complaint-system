# Vote Casting Implementation

## Overview

The vote casting functionality allows students to participate in polls created by lecturers. This feature is fully implemented with proper validation, error handling, and user feedback.

## Implementation Status: ✅ COMPLETE

### Features Implemented

#### 1. Vote Casting Interface (`src/app/votes/[id]/page.tsx`)

**Student View - Before Voting:**

- ✅ Display vote title, description, and metadata
- ✅ Show all available options as radio buttons
- ✅ Highlight selected option with visual feedback
- ✅ Display vote status badges (Active, Closed, Voted)
- ✅ Show closing date/time if applicable
- ✅ Submit button with loading state

**Student View - After Voting:**

- ✅ Display success message
- ✅ Show vote results with percentages and bar charts
- ✅ Display total vote count
- ✅ Show "Voted" badge
- ✅ Prevent re-voting

**Lecturer View:**

- ✅ Always show live results
- ✅ Display "Live Results" badge for active votes
- ✅ Show total participation count

#### 2. API Layer (`src/lib/api/votes.ts`)

**Core Functions:**

- ✅ `submitVoteResponse()` - Submit a vote with validation
- ✅ `hasStudentVoted()` - Check if student already voted
- ✅ `getVoteResults()` - Get aggregated vote results
- ✅ `getVoteById()` - Fetch vote details

**Validation Rules:**

1. ✅ Prevent duplicate voting (one vote per student per poll)
2. ✅ Verify vote exists
3. ✅ Verify vote is active
4. ✅ Verify vote hasn't closed
5. ✅ Verify selected option is valid

#### 3. Error Handling

**User-Friendly Error Messages:**

- ✅ "You have already voted on this poll" - Duplicate vote attempt
- ✅ "Vote not found" - Invalid vote ID
- ✅ "This vote is no longer active" - Inactive vote
- ✅ "This vote has closed" - Past closing date
- ✅ "Invalid option selected" - Invalid option
- ✅ "Please select an option before submitting" - No selection

#### 4. User Experience Features

**Visual Feedback:**

- ✅ Radio button selection with hover states
- ✅ Selected option highlighted with primary color
- ✅ Loading spinner during submission
- ✅ Success message with green alert
- ✅ Error message with red alert
- ✅ Disabled state for buttons during submission

**Results Display:**

- ✅ Percentage calculation for each option
- ✅ Animated progress bars
- ✅ Vote count per option
- ✅ Total votes summary
- ✅ Responsive layout

**Status Indicators:**

- ✅ "Voted" badge (green) - Student has voted
- ✅ "Closed" badge (gray) - Vote has closed
- ✅ "Inactive" badge (gray) - Vote is inactive
- ✅ "Live Results" badge (outline) - For lecturers viewing active votes

#### 5. Business Logic

**Vote Eligibility:**

```typescript
const canVote = vote && !hasVoted && !isVoteClosed(vote) && vote.is_active;
```

A student can vote if:

- ✅ Vote exists
- ✅ Student hasn't voted yet
- ✅ Vote hasn't closed
- ✅ Vote is active

**Results Visibility:**

- ✅ Students see results after voting
- ✅ Lecturers always see results
- ✅ Results hidden until student votes (prevents bias)

## Code Examples

### Submitting a Vote

```typescript
const handleSubmitVote = async () => {
  if (!selectedOption) {
    setError('Please select an option before submitting');
    return;
  }

  setIsSubmitting(true);
  setError(null);
  setSuccessMessage(null);

  try {
    await submitVoteResponse(voteId, mockStudentId, selectedOption);

    // Update state
    setHasVoted(true);
    setSelectedOption('');
    setSuccessMessage('Your vote has been submitted successfully!');

    // Load results after voting
    const voteResults = await getVoteResults(voteId);
    setResults(voteResults);
    setShowResults(true);
  } catch (err) {
    console.error('Error submitting vote:', err);
    setError(err instanceof Error ? err.message : 'Failed to submit vote. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

### API Validation

```typescript
export async function submitVoteResponse(
  voteId: string,
  studentId: string,
  selectedOption: string
): Promise<VoteResponse> {
  // Check if student already voted
  const existingResponse = mockVoteResponses.find(
    (r) => r.vote_id === voteId && r.student_id === studentId
  );

  if (existingResponse) {
    throw new Error('You have already voted on this poll');
  }

  // Verify vote exists
  const vote = mockVotes.find((v) => v.id === voteId);
  if (!vote) {
    throw new Error('Vote not found');
  }

  // Verify vote is active
  if (!vote.is_active) {
    throw new Error('This vote is no longer active');
  }

  // Verify vote hasn't closed
  if (vote.closes_at && new Date(vote.closes_at) < new Date()) {
    throw new Error('This vote has closed');
  }

  // Verify selected option is valid
  const options = Array.isArray(vote.options) ? vote.options : [];
  if (!options.includes(selectedOption)) {
    throw new Error('Invalid option selected');
  }

  // Create response
  const newResponse: VoteResponse = {
    id: `response-${Date.now()}`,
    vote_id: voteId,
    student_id: studentId,
    selected_option: selectedOption,
    created_at: new Date().toISOString(),
  };

  mockVoteResponses.push(newResponse);
  return newResponse;
}
```

## Testing

### Manual Testing Checklist

**As a Student:**

- [x] Navigate to /votes and select a vote
- [x] Select an option and submit
- [x] Verify success message appears
- [x] Verify results are displayed
- [x] Verify "Voted" badge appears
- [x] Try to vote again (should be prevented)
- [x] Try voting on a closed vote (should be prevented)
- [x] Try voting on an inactive vote (should be prevented)

**As a Lecturer:**

- [x] Navigate to /votes/[id]
- [x] Verify results are visible immediately
- [x] Verify "Live Results" badge shows for active votes
- [x] Verify total vote count is accurate

### Automated Tests

Test file: `src/lib/api/__tests__/votes.test.ts`

**Test Coverage:**

- ✅ Allow student to cast a vote
- ✅ Prevent duplicate voting
- ✅ Track voting status correctly
- ✅ Aggregate results correctly
- ✅ Reject invalid options
- ✅ Prevent voting on inactive votes
- ✅ Prevent voting on closed votes

## UI Screenshots

### Before Voting

```
┌─────────────────────────────────────────┐
│ ← Back to Votes                         │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Preferred Study Hours               │ │
│ │ Help us understand when students... │ │
│ │                                     │ │
│ │ Cast Your Vote                      │ │
│ │                                     │ │
│ │ ○ Morning (6am-12pm)               │ │
│ │ ● Afternoon (12pm-6pm)  [Selected] │ │
│ │ ○ Evening (6pm-12am)               │ │
│ │ ○ Night (12am-6am)                 │ │
│ │                                     │ │
│ │ [Submit Vote]                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### After Voting

```
┌─────────────────────────────────────────┐
│ ← Back to Votes                         │
│                                          │
│ ✓ Your vote has been submitted!         │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Preferred Study Hours    [Voted]    │ │
│ │ Help us understand when students... │ │
│ │                                     │ │
│ │ 📊 Vote Results                     │ │
│ │                                     │ │
│ │ Morning (6am-12pm)                  │ │
│ │ 5 votes (25%)                       │ │
│ │ ████████░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│ │                                     │ │
│ │ Afternoon (12pm-6pm)                │ │
│ │ 10 votes (50%)                      │ │
│ │ ████████████████░░░░░░░░░░░░░░░░   │ │
│ │                                     │ │
│ │ Evening (6pm-12am)                  │ │
│ │ 3 votes (15%)                       │ │
│ │ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│ │                                     │ │
│ │ Night (12am-6am)                    │ │
│ │ 2 votes (10%)                       │ │
│ │ ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│ │                                     │ │
│ │ Total Votes: 20                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Phase 12 Migration Notes

When connecting to real Supabase API in Phase 12:

1. **Replace mock student ID** with actual authenticated user ID from auth context
2. **Uncomment Supabase queries** in `src/lib/api/votes.ts`
3. **Add RLS policies** for vote_responses table
4. **Test with real database** to ensure constraints work
5. **Add database trigger** for vote notification (if needed)

### Database Considerations

**vote_responses table:**

- Unique constraint on (vote_id, student_id) to prevent duplicates
- Foreign key to votes table
- Foreign key to users table
- Index on vote_id for fast lookups

**RLS Policies:**

- Students can insert their own responses
- Students can view results after voting
- Lecturers can view all results
- No one can update or delete responses

## Related Files

- `src/app/votes/[id]/page.tsx` - Vote detail page with casting UI
- `src/lib/api/votes.ts` - Vote API functions
- `src/types/database.types.ts` - Type definitions
- `src/components/votes/vote-form.tsx` - Vote creation form (lecturer)
- `src/app/votes/page.tsx` - Vote listing page

## Acceptance Criteria Met

From Task 7.1 in tasks.md:

- ✅ Implement vote casting (student)
- ✅ Enforce one vote per student per poll
- ✅ Show vote results (lecturer)
- ✅ Proper error handling
- ✅ User-friendly UI with feedback

## Summary

The vote casting functionality is **fully implemented and working**. Students can:

- View active votes
- Select an option
- Submit their vote
- See results after voting
- Receive clear feedback on success/errors

The implementation includes comprehensive validation, error handling, and a polished user experience. All business rules are enforced, and the UI provides clear visual feedback at every step.
