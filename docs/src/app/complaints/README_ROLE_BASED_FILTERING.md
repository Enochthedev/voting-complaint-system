# Role-Based Filtering Implementation

## Overview

The complaint list page implements role-based filtering to ensure users only see complaints they are authorized to view.

## Requirements

- **AC3**: Students can view their own submitted complaints and their status
- **AC3**: Lecturers can view all complaints in a dashboard
- **P7**: Students can only view their own complaints; lecturers can view all complaints

## Implementation

### Filtering Logic

The filtering is implemented in `/src/app/complaints/page.tsx`:

```typescript
// Get current user for role-based filtering
const currentUser = getMockUser();
const userRole = currentUser?.role || 'student';
const userId = currentUser?.id || 'mock-student-id';

// Filter complaints based on user role
const filteredComplaints = React.useMemo(() => {
  if (userRole === 'lecturer' || userRole === 'admin') {
    // Lecturers and admins see all complaints
    return MOCK_COMPLAINTS;
  } else {
    // Students see only their own complaints
    return MOCK_COMPLAINTS.filter(
      (complaint) => complaint.student_id === userId
    );
  }
}, [userRole, userId]);
```

### Role-Specific Behavior

#### Student Role
- **Sees**: Only complaints where `student_id` matches their user ID
- **Does NOT see**: 
  - Complaints from other students
  - Anonymous complaints from other students
- **UI**: Shows "My Complaints" title and "New Complaint" button

#### Lecturer Role
- **Sees**: All complaints from all students
- **Includes**: Anonymous complaints (student identity hidden)
- **UI**: Shows "All Complaints" title, no "New Complaint" button

#### Admin Role
- **Sees**: All complaints from all students
- **Includes**: Anonymous complaints (student identity hidden)
- **UI**: Shows "All Complaints" title, no "New Complaint" button

## UI Adaptations

The page header adapts based on user role:

```typescript
<h1>
  {userRole === 'student' ? 'My Complaints' : 'All Complaints'}
</h1>
<p>
  {userRole === 'student'
    ? 'View and manage your submitted complaints'
    : 'View and manage all student complaints'}
</p>
```

The "New Complaint" button only shows for students:

```typescript
{userRole === 'student' && (
  <Button onClick={handleNewComplaint}>
    <Plus className="h-4 w-4" />
    New Complaint
  </Button>
)}
```

## Testing

Tests are located in `__tests__/role-based-filtering.test.ts` and cover:

1. **Student filtering**: Only sees own complaints
2. **Lecturer filtering**: Sees all complaints
3. **Admin filtering**: Sees all complaints
4. **Edge cases**: Empty lists, all anonymous complaints

## Mock Data

The mock data uses `mock-student-id` to match the mock user ID from `getMockUser()`:

```typescript
const MOCK_COMPLAINTS = [
  {
    id: '1',
    student_id: 'mock-student-id', // Matches mock student user
    // ...
  },
  // ...
];
```

## Future Enhancements (Phase 12)

When connecting to real Supabase APIs:

1. Replace `getMockUser()` with real Supabase auth
2. Replace mock filtering with RLS policies
3. Update queries to use Supabase client:

```typescript
// Future implementation
const { data: complaints } = await supabase
  .from('complaints')
  .select('*, complaint_tags(*)')
  .order('created_at', { ascending: false });

// RLS policies will automatically filter based on user role
```

## Privacy Considerations

- Anonymous complaints have `student_id: null`
- Students cannot see anonymous complaints from others
- Lecturers/admins can see anonymous complaints but not the student identity
- The filtering ensures students cannot access other students' data

## Performance

- Filtering uses `React.useMemo()` to avoid unnecessary recalculations
- Memoization dependencies: `[userRole, userId]`
- Pagination is applied after filtering for efficiency
