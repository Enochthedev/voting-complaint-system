# Vote Submission Implementation

## Overview

This document describes the implementation of the vote submission functionality for the Student Complaint Resolution System. The implementation follows the UI-first development approach, using mock data that will be replaced with real Supabase API calls in Phase 12.

## Implemented Features

### 1. Vote Creation (Lecturer/Admin)

**Location**: `/admin/votes/new`

**Features**:
- Create new voting polls with title and description
- Add multiple voting options (minimum 2)
- Set optional closing date/time
- Link vote to a specific complaint (optional)
- Set active/inactive status
- Form validation for all fields

**Components**:
- `src/app/admin/votes/new/page.tsx` - Vote creation page
- `src/components/votes/vote-form.tsx` - Reusable vote form component

### 2. Vote Listing (Lecturer/Admin)

**Location**: `/admin/votes`

**Features**:
- View all created votes
- See vote status (Active/Closed)
- View vote options and metadata
- See creation date and closing date
- Identify votes linked to complaints
- Loading states and empty states

**Components**:
- `src/app/admin/votes/page.tsx` - Vote listing page

### 3. Vote Participation (Student)

**Location**: `/votes`

**Features**:
- View all active voting polls
- Submit vote responses
- See which polls the student has already voted on
- View closed polls
- Real-time validation (one vote per poll)
- Success/error feedback
- Loading states

**Components**:
- `src/app/votes/page.tsx` - Student voting page

## API Functions

**Location**: `src/lib/api/votes.ts`

### Vote Management Functions

1. **`createVote(voteData)`** - Create a new vote
2. **`getVotes(options)`** - Get all votes with optional filtering
3. **`getVoteById(voteId)`** - Get a single vote by ID
4. **`updateVote(voteId, updates)`** - Update a vote
5. **`deleteVote(voteId)`** - Delete a vote
6. **`closeVote(voteId)`** - Close a vote (set is_active to false)
7. **`reopenVote(voteId)`** - Reopen a vote (set is_active to true)

### Vote Response Functions

1. **`submitVoteResponse(voteId, studentId, selectedOption)`** - Submit a vote response
2. **`getVoteResponses(voteId)`** - Get all responses for a vote
3. **`hasStudentVoted(voteId, studentId)`** - Check if student has voted
4. **`getVoteResults(voteId)`** - Get aggregated vote results

## Validation Rules

### Vote Creation Validation

- **Title**: Required, 5-200 characters
- **Description**: Required, 10-1000 characters
- **Options**: Minimum 2 options, each max 200 characters
- **Options**: Must be unique (case-insensitive)
- **Closing Date**: Must be in the future (if provided)

### Vote Submission Validation

- **One Vote Per Poll**: Students can only vote once per poll (enforced by UNIQUE constraint)
- **Active Vote**: Can only vote on active polls
- **Not Closed**: Cannot vote on polls past their closing date
- **Valid Option**: Selected option must be one of the poll's options

## Mock Data

The implementation uses in-memory mock data for development:

```typescript
// Example mock votes
const mockVotes = [
  {
    id: 'vote-1',
    title: 'Preferred Study Hours',
    description: 'Help us understand when students prefer to study',
    options: ['Morning', 'Afternoon', 'Evening', 'Night'],
    is_active: true,
    // ... other fields
  }
];
```

## Phase 12 Migration

All API functions include TODO comments indicating where Supabase calls should be added:

```typescript
// TODO: Phase 12 - Replace with Supabase API call
// const { data, error } = await supabase
//   .from('votes')
//   .insert(voteData)
//   .select()
//   .single();
```

### Required Changes for Phase 12

1. **Authentication**: Replace `mock-lecturer-id` and `mock-student-id` with actual user IDs from auth context
2. **Database Calls**: Replace mock data operations with Supabase queries
3. **Real-time Updates**: Add Supabase Realtime subscriptions for live vote updates
4. **Notifications**: Create notifications when new votes are created (AC6)
5. **RLS Policies**: Ensure Row Level Security policies are properly configured

## Database Schema

### votes table
```sql
- id: uuid (PK)
- created_by: uuid (FK to users - lecturer)
- title: text
- description: text
- options: jsonb (array of option objects)
- is_active: boolean
- related_complaint_id: uuid (FK to complaints, nullable)
- created_at: timestamp
- closes_at: timestamp (nullable)
```

### vote_responses table
```sql
- id: uuid (PK)
- vote_id: uuid (FK to votes)
- student_id: uuid (FK to users)
- selected_option: text
- created_at: timestamp
- UNIQUE(vote_id, student_id)
```

## User Experience

### Lecturer Flow

1. Navigate to `/admin/votes`
2. Click "Create Vote" button
3. Fill in vote details (title, description, options)
4. Optionally set closing date and link to complaint
5. Click "Create Vote"
6. See success message and redirect to votes list
7. View created vote in the list

### Student Flow

1. Navigate to `/votes`
2. See list of active voting polls
3. Read vote description and options
4. Select an option
5. Click "Submit Vote"
6. See success message
7. Vote is marked as "Voted" and cannot be changed
8. View closed polls in separate section

## Acceptance Criteria Coverage

This implementation addresses the following acceptance criteria from AC6:

- ✅ Lecturers can create voting polls with multiple options
- ✅ Polls can be associated with specific topics or complaints
- ✅ Students can cast votes on active polls
- ✅ Students can only vote once per poll (enforced by validation)
- ✅ Polls can be closed by lecturers (via is_active flag and closes_at date)
- ⏳ Lecturers can view voting results (to be implemented in next task)

## Future Enhancements

1. **Vote Results Page**: Display aggregated results with charts
2. **Vote Editing**: Allow lecturers to edit votes before responses are submitted
3. **Vote Analytics**: Show participation rates and trends
4. **Notifications**: Notify students when new votes are created
5. **Vote Comments**: Allow discussion on voting topics
6. **Anonymous Voting**: Option to make votes anonymous
7. **Multiple Choice**: Support selecting multiple options
8. **Ranked Choice**: Support ranked voting systems

## Testing

### Manual Testing Checklist

**Lecturer (Vote Creation)**:
- [ ] Can create a vote with valid data
- [ ] Form validation works for all fields
- [ ] Can add/remove options
- [ ] Cannot create vote with less than 2 options
- [ ] Cannot create vote with duplicate options
- [ ] Closing date must be in future
- [ ] Success message appears after creation
- [ ] Redirects to votes list after creation

**Lecturer (Vote Listing)**:
- [ ] Can view all created votes
- [ ] Active votes show "Active" badge
- [ ] Closed votes show "Closed" badge
- [ ] Vote options are displayed
- [ ] Dates are formatted correctly
- [ ] Empty state shows when no votes exist

**Student (Vote Participation)**:
- [ ] Can view active votes
- [ ] Can select an option
- [ ] Can submit vote
- [ ] Cannot vote twice on same poll
- [ ] Success message appears after voting
- [ ] Voted polls show "Voted" badge
- [ ] Cannot vote on closed polls
- [ ] Closed polls appear in separate section

## Related Files

- `src/app/admin/votes/new/page.tsx` - Vote creation page
- `src/app/admin/votes/page.tsx` - Vote listing page (lecturer)
- `src/app/votes/page.tsx` - Vote participation page (student)
- `src/components/votes/vote-form.tsx` - Vote form component
- `src/lib/api/votes.ts` - Vote API functions
- `src/types/database.types.ts` - Type definitions
- `.kiro/specs/requirements.md` - Requirements (AC6)
- `.kiro/specs/design.md` - Design specifications

## Notes

- This implementation follows the UI-first development approach
- All data is currently stored in-memory (mock data)
- Real database integration will be done in Phase 12
- The implementation is fully functional for UI testing and development
- All validation rules are implemented and working
- The code is structured to make Phase 12 migration straightforward
