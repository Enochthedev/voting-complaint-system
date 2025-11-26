# Vote Submission - Quick Start Guide

## What Was Implemented

The vote submission functionality allows lecturers to create voting polls and students to participate in them. This implementation uses mock data following the UI-first development approach.

## How to Test

### 1. Test Vote Creation (Lecturer View)

**Navigate to**: `/admin/votes/new`

**Steps**:
1. Fill in the vote title (e.g., "Preferred Study Hours")
2. Add a description (e.g., "Help us understand when students prefer to study")
3. Add at least 2 options (e.g., "Morning", "Afternoon", "Evening", "Night")
4. Optionally set a closing date
5. Click "Create Vote"
6. You should see a success message and be redirected to `/admin/votes`

**Validation to Test**:
- Try submitting with empty title → Should show error
- Try submitting with only 1 option → Should show error
- Try adding duplicate options → Should show error
- Try setting closing date in the past → Should show error

### 2. Test Vote Listing (Lecturer View)

**Navigate to**: `/admin/votes`

**What You'll See**:
- List of all created votes (including 2 pre-populated mock votes)
- Each vote shows:
  - Title and description
  - Active/Closed status badge
  - Number of options
  - Creation date
  - Closing date (if set)
  - All available options as badges
- "Create Vote" button to add new votes

### 3. Test Vote Participation (Student View)

**Navigate to**: `/votes`

**Steps**:
1. You'll see active voting polls
2. Select an option by clicking the radio button
3. Click "Submit Vote"
4. You should see a success message
5. The poll will now show a "Voted" badge
6. You cannot vote again on the same poll

**What to Test**:
- Try submitting without selecting an option → Button should be disabled
- After voting, try to vote again → Should show "already voted" message
- Closed polls appear in a separate "Closed Polls" section

## Mock Data

The system comes with 2 pre-populated mock votes:

1. **Preferred Study Hours**
   - Options: Morning, Afternoon, Evening, Night
   - Status: Active
   - Closes in 7 days

2. **Campus WiFi Improvement Priority**
   - Options: Library, Cafeteria, Lecture Halls, Outdoor Areas, Dormitories
   - Status: Active
   - No closing date

## Key Features

### Vote Creation
- ✅ Form validation for all fields
- ✅ Dynamic option management (add/remove)
- ✅ Optional closing date
- ✅ Optional complaint linking
- ✅ Active/inactive toggle
- ✅ Success feedback and redirect

### Vote Listing
- ✅ View all votes
- ✅ Status badges (Active/Closed)
- ✅ Metadata display
- ✅ Loading states
- ✅ Empty states

### Vote Participation
- ✅ View active polls
- ✅ Submit vote responses
- ✅ One vote per poll enforcement
- ✅ Already voted indication
- ✅ Closed polls section
- ✅ Success/error feedback

## API Functions Available

Located in `src/lib/api/votes.ts`:

**Vote Management**:
- `createVote()` - Create new vote
- `getVotes()` - Get all votes (with filtering)
- `getVoteById()` - Get single vote
- `updateVote()` - Update vote
- `deleteVote()` - Delete vote
- `closeVote()` - Close a vote
- `reopenVote()` - Reopen a vote

**Vote Responses**:
- `submitVoteResponse()` - Submit a vote
- `getVoteResponses()` - Get all responses
- `hasStudentVoted()` - Check if voted
- `getVoteResults()` - Get aggregated results

## Routes

| Route | Role | Description |
|-------|------|-------------|
| `/admin/votes` | Lecturer/Admin | View all votes |
| `/admin/votes/new` | Lecturer/Admin | Create new vote |
| `/votes` | Student | View and participate in votes |

## Next Steps

The following features are planned for future tasks:

1. **Vote Results Page** (`/admin/votes/[id]`) - View detailed results with charts
2. **Vote Editing** - Edit votes before responses are submitted
3. **Notifications** - Notify students when new votes are created
4. **Real-time Updates** - Live vote count updates
5. **Vote Analytics** - Participation rates and trends

## Phase 12 Integration

In Phase 12, the following will be updated:

1. Replace mock user IDs with real auth context
2. Replace in-memory storage with Supabase database calls
3. Add real-time subscriptions for live updates
4. Implement notification triggers
5. Add proper error handling for database operations

## Troubleshooting

**Issue**: Can't see the votes I created
- **Solution**: Votes are stored in-memory, so they'll be lost on page refresh. This is expected behavior until Phase 12.

**Issue**: Getting "already voted" error immediately
- **Solution**: Clear your browser's local storage or use incognito mode.

**Issue**: Validation errors not showing
- **Solution**: Check browser console for errors. Ensure all required fields are filled.

## Files Modified/Created

### Created Files
- `src/app/admin/votes/new/page.tsx` - Vote creation page
- `src/app/votes/page.tsx` - Student voting page
- `src/lib/api/votes.ts` - Vote API functions
- `docs/VOTE_SUBMISSION_IMPLEMENTATION.md` - Detailed documentation
- `docs/VOTE_SUBMISSION_QUICK_START.md` - This file

### Modified Files
- `src/app/admin/votes/page.tsx` - Updated to show vote list
- `.kiro/specs/tasks.md` - Marked task as completed

## Acceptance Criteria Met

From AC6 (Voting System):
- ✅ Lecturers can create voting polls with multiple options
- ✅ Polls can be associated with specific topics or complaints
- ✅ Students can cast votes on active polls
- ✅ Students can only vote once per poll
- ✅ Polls can be closed by lecturers
- ⏳ Lecturers can view voting results (next task)

## Questions?

If you encounter any issues or have questions about the implementation, please refer to:
- `docs/VOTE_SUBMISSION_IMPLEMENTATION.md` for detailed technical documentation
- `.kiro/specs/requirements.md` for requirements (AC6)
- `.kiro/specs/design.md` for design specifications
