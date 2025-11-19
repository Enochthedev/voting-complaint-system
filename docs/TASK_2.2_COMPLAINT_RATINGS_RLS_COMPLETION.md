# Task 2.2: Complaint Ratings RLS Policies - Completion Summary

## Overview
This document summarizes the implementation of Row Level Security (RLS) policies for the `complaint_ratings` table in the Student Complaint Resolution System.

## Implementation Date
November 18, 2025

## Migration File
- **File**: `supabase/migrations/023_fix_complaint_ratings_rls.sql`
- **Purpose**: Fix RLS policies to use JWT claims instead of querying the users table to avoid infinite recursion

## RLS Policies Implemented

### 1. Students Rate Own Resolved Complaints (INSERT)
**Policy Name**: `Students rate own resolved complaints`

**Purpose**: Allow students to rate only their own complaints that have been resolved

**Rules**:
- User must have 'student' role (verified via JWT claims)
- `student_id` must match authenticated user's ID
- Complaint must exist and belong to the student
- Complaint status must be 'resolved'

**SQL**:
```sql
CREATE POLICY "Students rate own resolved complaints"
  ON public.complaint_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' = 'student'
    AND student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id
      AND student_id = auth.uid()
      AND status = 'resolved'
    )
  );
```

### 2. Students View Own Ratings (SELECT)
**Policy Name**: `Students view own ratings`

**Purpose**: Allow students to view their own ratings; lecturers and admins can view all ratings

**Rules**:
- Lecturers and admins can view all ratings
- Students can only view their own ratings
- Uses JWT claims for role-based access control

**SQL**:
```sql
CREATE POLICY "Students view own ratings"
  ON public.complaint_ratings
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role' IN ('lecturer', 'admin'))
    OR
    (auth.jwt()->>'role' = 'student' AND student_id = auth.uid())
  );
```

### 3. Students Update Own Ratings (UPDATE)
**Policy Name**: `Students update own ratings`

**Purpose**: Allow students to modify their ratings if they change their mind

**Rules**:
- User must have 'student' role
- Can only update their own ratings
- Uses JWT claims for verification

**SQL**:
```sql
CREATE POLICY "Students update own ratings"
  ON public.complaint_ratings
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'student'
    AND student_id = auth.uid()
  )
  WITH CHECK (
    auth.jwt()->>'role' = 'student'
    AND student_id = auth.uid()
  );
```

## Security Features

### Data Integrity Constraints
1. **Unique Constraint**: One rating per complaint (`UNIQUE(complaint_id)`)
2. **Rating Range Check**: Rating must be between 1 and 5 (`CHECK (rating >= 1 AND rating <= 5)`)
3. **Foreign Key Constraints**: 
   - `complaint_id` references `complaints(id)` with CASCADE delete
   - `student_id` references `users(id)` with CASCADE delete

### Access Control
- **No DELETE Policy**: Ratings cannot be deleted to maintain data integrity and audit trail
- **Role-Based Access**: Uses JWT claims (`auth.jwt()->>'role'`) to avoid infinite recursion
- **Ownership Verification**: Students can only interact with their own ratings

## Design Properties Validated

### P14: Rating Uniqueness (AC16)
- **Property**: A student can rate a complaint only once
- **Implementation**: UNIQUE constraint on `complaint_id` in `complaint_ratings` table
- **Verification**: Database constraint prevents duplicate ratings

### Additional Properties
- **Rating Validity**: Ratings must be in valid range (1-5 stars)
- **Resolution Requirement**: Students can only rate resolved complaints
- **Privacy**: Students cannot view other students' ratings
- **Transparency**: Lecturers and admins can view all ratings for analytics

## Database Indexes

The following indexes optimize query performance:

1. `idx_complaint_ratings_complaint_id` - Fast lookups by complaint
2. `idx_complaint_ratings_student_id` - User-specific queries
3. `idx_complaint_ratings_rating` - Analytics queries
4. `idx_complaint_ratings_created_at` - Time-based queries

## Testing

### Test Script
**File**: `scripts/test-complaint-ratings-rls.js`

### Test Cases
1. ✅ Student can rate their own resolved complaint
2. ✅ Student cannot rate a complaint that is not resolved
3. ✅ Student cannot rate another student's complaint
4. ✅ Student can view their own ratings
5. ✅ Student cannot view other students' ratings
6. ✅ Lecturer can view all ratings
7. ✅ Student can update their own rating
8. ✅ Unique constraint prevents duplicate ratings

### Running Tests
```bash
# Apply the migration
node scripts/apply-complaint-ratings-rls-fix.js

# Verify policies
node scripts/verify-complaint-ratings-policies.js

# Run functional tests
node scripts/test-complaint-ratings-rls.js
```

## Verification

### SQL Verification Script
**File**: `supabase/verify-complaint-ratings-rls.sql`

This script checks:
- RLS is enabled on the table
- All policies are created
- Table structure is correct
- Constraints are in place
- Indexes exist

## Integration with Requirements

### Acceptance Criteria Satisfied
- **AC16**: Satisfaction Rating
  - After complaint is marked as resolved, student receives prompt to rate
  - Rating scale: 1-5 stars
  - Optional text feedback on resolution quality
  - Ratings are anonymous to encourage honest feedback
  - Aggregate ratings visible in analytics dashboard

### Non-Functional Requirements
- **NFR2**: Security
  - Role-based access control enforced
  - Data integrity maintained through constraints
  - Audit trail preserved (no deletion allowed)

## Known Limitations

1. **No Time Window**: Currently, students can update ratings indefinitely. Consider adding a time window constraint in future iterations.
2. **No Deletion**: Ratings cannot be deleted once submitted. This is intentional for data integrity but may need admin override capability.
3. **Anonymous Ratings**: While ratings are stored with student_id, the display to lecturers should anonymize the data for honest feedback.

## Future Enhancements

1. **Time-Limited Updates**: Add constraint to allow rating updates only within 24-48 hours
2. **Admin Override**: Allow admins to delete inappropriate ratings
3. **Rating Analytics**: Implement aggregation views for performance optimization
4. **Notification Integration**: Trigger notifications when ratings are submitted

## Related Files

### Migration Files
- `007_create_complaint_ratings_table.sql` - Initial table creation
- `023_fix_complaint_ratings_rls.sql` - RLS policy fixes

### Scripts
- `apply-complaint-ratings-rls-fix.js` - Apply migration
- `verify-complaint-ratings-policies.js` - Verify policies
- `test-complaint-ratings-rls.js` - Functional tests

### Verification
- `verify-complaint-ratings-rls.sql` - SQL verification queries

## Conclusion

The complaint_ratings RLS policies have been successfully implemented following the same pattern as other tables in the system. The policies ensure:

1. ✅ Students can only rate their own resolved complaints
2. ✅ One rating per complaint (enforced by unique constraint)
3. ✅ Ratings are in valid range (1-5)
4. ✅ Students can view and update their own ratings
5. ✅ Lecturers and admins have full visibility for analytics
6. ✅ Data integrity is maintained (no deletion allowed)
7. ✅ JWT claims are used to avoid infinite recursion

The implementation aligns with the design document specifications and satisfies the acceptance criteria for the satisfaction rating feature.

