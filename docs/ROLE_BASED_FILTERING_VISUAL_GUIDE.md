# Role-Based Filtering - Visual Guide

## Overview
This guide demonstrates how the complaint list page adapts based on user role.

## Student View

### What Students See
```
┌─────────────────────────────────────────────────────────────┐
│  My Complaints                          [+ New Complaint]    │
│  View and manage your submitted complaints                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Broken Air Conditioning in Lecture Hall A    [New]    │  │
│  │ The air conditioning system in Lecture Hall A...       │  │
│  │ 🔴 High  📄 Facilities  🕐 2 hours ago                 │  │
│  │ #air-conditioning #lecture-hall #urgent                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Library WiFi Connection Issues    [In Progress]        │  │
│  │ The WiFi in the library keeps disconnecting...         │  │
│  │ 🟡 Medium  📄 Facilities  🕐 3 days ago                │  │
│  │ #wifi #library #connectivity                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Parking Lot Lighting Safety Concern    [Opened]        │  │
│  │ Several lights in the north parking lot...             │  │
│  │ 🔴 Critical  📄 Facilities  🕐 6 days ago              │  │
│  │ #parking #safety #lighting                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Cafeteria Food Quality    [New]                        │  │
│  │ The quality of food in the cafeteria has declined...   │  │
│  │ 🔵 Low  📄 Other  🕐 30 minutes ago                    │  │
│  │ #cafeteria #food-quality                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│                    Page 1 of 1                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- ✅ Shows only complaints created by the logged-in student
- ✅ Displays "My Complaints" as the page title
- ✅ Shows "New Complaint" button
- ✅ Student sees 4 complaints (IDs: 1, 3, 5, 8)
- ❌ Does NOT see complaints from other students
- ❌ Does NOT see anonymous complaints from others

## Lecturer View

### What Lecturers See
```
┌─────────────────────────────────────────────────────────────┐
│  All Complaints                                              │
│  View and manage all student complaints                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Broken Air Conditioning in Lecture Hall A    [New]    │  │
│  │ The air conditioning system in Lecture Hall A...       │  │
│  │ 🔴 High  📄 Facilities  🕐 2 hours ago                 │  │
│  │ #air-conditioning #lecture-hall #urgent                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Unfair Grading in CS101    [Opened]    [Anonymous]    │  │
│  │ I believe the grading criteria for the recent...       │  │
│  │ 🟡 Medium  📄 Academic  🕐 1 day ago                   │  │
│  │ #grading #cs101                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Library WiFi Connection Issues    [In Progress]        │  │
│  │ The WiFi in the library keeps disconnecting...         │  │
│  │ 🟡 Medium  📄 Facilities  🕐 3 days ago                │  │
│  │ #wifi #library #connectivity                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Missing Course Materials for MATH202    [New]          │  │
│  │ The professor mentioned that course materials...       │  │
│  │ 🔴 High  📄 Course Content  🕐 5 hours ago             │  │
│  │ #course-materials #math202                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Parking Lot Lighting Safety Concern    [Opened]        │  │
│  │ Several lights in the north parking lot...             │  │
│  │ 🔴 Critical  📄 Facilities  🕐 6 days ago              │  │
│  │ #parking #safety #lighting                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│                    Page 1 of 2                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- ✅ Shows ALL complaints from ALL students
- ✅ Displays "All Complaints" as the page title
- ✅ Shows anonymous complaints (with [Anonymous] badge)
- ✅ Lecturer sees all 8 complaints
- ✅ Can see complaints from multiple students
- ❌ Does NOT show "New Complaint" button (lecturers don't submit complaints)

## Admin View

### What Admins See
```
┌─────────────────────────────────────────────────────────────┐
│  All Complaints                                              │
│  View and manage all student complaints                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Same as Lecturer View - Shows all 8 complaints]            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- ✅ Shows ALL complaints from ALL students (same as lecturer)
- ✅ Displays "All Complaints" as the page title
- ✅ Shows anonymous complaints
- ✅ Admin sees all 8 complaints
- ❌ Does NOT show "New Complaint" button

## Filtering Logic Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Logs In                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Get User Role  │
              └────────┬───────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐   ┌──────────┐  ┌───────┐
    │Student │   │ Lecturer │  │ Admin │
    └────┬───┘   └─────┬────┘  └───┬───┘
         │             │            │
         ▼             ▼            ▼
    ┌────────────┐  ┌──────────────────┐
    │Filter by   │  │Show ALL          │
    │student_id  │  │complaints        │
    └────────────┘  └──────────────────┘
         │                   │
         ▼                   ▼
    ┌────────────┐  ┌──────────────────┐
    │Show only   │  │Include anonymous │
    │own         │  │complaints        │
    │complaints  │  └──────────────────┘
    └────────────┘
```

## Data Flow

### Student Request
```
1. User logs in as student
2. getMockUser() returns { id: 'mock-student-id', role: 'student' }
3. Filter: MOCK_COMPLAINTS.filter(c => c.student_id === 'mock-student-id')
4. Result: 4 complaints (IDs: 1, 3, 5, 8)
5. Apply pagination: Show first 5 (all 4 fit on page 1)
6. Render with "My Complaints" title
```

### Lecturer Request
```
1. User logs in as lecturer
2. getMockUser() returns { id: 'mock-lecturer-id', role: 'lecturer' }
3. Filter: Return ALL MOCK_COMPLAINTS (no filtering)
4. Result: 8 complaints (all IDs)
5. Apply pagination: Show first 5 on page 1, remaining 3 on page 2
6. Render with "All Complaints" title
```

## Testing Scenarios

### Scenario 1: Student with Multiple Complaints
- **User**: student@test.com
- **Expected**: See 4 complaints (IDs: 1, 3, 5, 8)
- **Verify**: All complaints have student_id = 'mock-student-id'

### Scenario 2: Student with No Complaints
- **User**: New student (not in mock data)
- **Expected**: Empty state with message "No complaints to display..."
- **Verify**: Empty list, no errors

### Scenario 3: Lecturer Viewing All
- **User**: lecturer@test.com
- **Expected**: See all 8 complaints
- **Verify**: Includes anonymous complaints (ID: 2, 7)

### Scenario 4: Admin Viewing All
- **User**: admin@test.com
- **Expected**: See all 8 complaints (same as lecturer)
- **Verify**: Includes complaints from all students

## Privacy Protection

### Anonymous Complaints
```
Complaint ID: 2
student_id: null
is_anonymous: true
title: "Unfair Grading in CS101"

Student View (student-1):
  ❌ NOT VISIBLE (student_id doesn't match)

Lecturer View:
  ✅ VISIBLE (but student identity hidden)
  Shows: [Anonymous] badge
```

### Other Students' Complaints
```
Complaint ID: 4
student_id: 'student-2'
is_anonymous: false
title: "Missing Course Materials for MATH202"

Student View (student-1):
  ❌ NOT VISIBLE (different student_id)

Lecturer View:
  ✅ VISIBLE (can see all complaints)
```

## Performance Optimization

The filtering uses `React.useMemo()` to prevent unnecessary recalculations:

```typescript
const filteredComplaints = React.useMemo(() => {
  // Filtering logic
}, [userRole, userId]); // Only recalculate when role or ID changes
```

This ensures:
- ✅ Efficient filtering
- ✅ No unnecessary re-renders
- ✅ Smooth pagination
- ✅ Fast page loads
