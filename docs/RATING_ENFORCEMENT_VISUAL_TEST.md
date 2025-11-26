# One Rating Per Complaint - Visual Test Guide

**Status**: ✅ COMPLETED  
**Task**: Enforce one rating per complaint  
**Validates**: Requirements AC16 (Satisfaction Rating)

## Test Scenarios

### Scenario 1: First-Time Rating (Happy Path)

**Setup**:
1. Log in as a student
2. Navigate to a resolved complaint that you submitted
3. Complaint should not have been rated yet

**Expected Behavior**:
- ✅ Rating prompt card is displayed
- ✅ Card shows: "Rate Your Experience"
- ✅ Card shows complaint title
- ✅ 5 star buttons are visible and interactive
- ✅ Optional feedback textarea is present
- ✅ "Submit Rating" button is enabled when stars are selected
- ✅ "Skip" button is available

**Actions**:
1. Hover over stars - they should highlight in yellow
2. Click on 5 stars
3. Type feedback: "Great resolution, thank you!"
4. Click "Submit Rating"

**Expected Result**:
- ✅ Rating is submitted successfully
- ✅ Rating prompt disappears
- ✅ Success message or toast notification appears
- ✅ Rating appears in complaint history timeline
- ✅ Page refreshes or updates to show rated state

---

### Scenario 2: Duplicate Rating Attempt (Error Handling)

**Setup**:
1. Use the same complaint from Scenario 1 (already rated)
2. Refresh the page or navigate away and back

**Expected Behavior**:
- ✅ Rating prompt is NOT displayed
- ✅ Complaint detail view shows normally
- ✅ History timeline shows the previous rating
- ✅ No way to submit another rating

**Manual Test** (if you try to bypass UI):
1. Open browser console
2. Try to call the API directly:
```javascript
// This should fail
await submitRating('complaint-id', 'student-id', 4, 'Another rating');
```

**Expected Result**:
- ✅ API returns error: "You have already rated this complaint"
- ✅ No new rating is created in database
- ✅ Original rating remains unchanged

---

### Scenario 3: Rating Prompt Dismissal

**Setup**:
1. Log in as a student
2. Navigate to a resolved complaint (not yet rated)
3. Rating prompt is displayed

**Actions**:
1. Click the "Skip" button or X icon

**Expected Behavior**:
- ✅ Rating prompt disappears
- ✅ Dismissal is saved to localStorage
- ✅ Refresh page - prompt does NOT reappear
- ✅ Complaint can still be rated later if needed

---

### Scenario 4: Non-Resolved Complaint

**Setup**:
1. Log in as a student
2. Navigate to a complaint with status: "open", "in_progress", or "new"

**Expected Behavior**:
- ✅ Rating prompt is NOT displayed
- ✅ No way to submit a rating
- ✅ Complaint detail view shows normally

**Manual Test** (if you try to bypass UI):
```javascript
// This should fail
await submitRating('open-complaint-id', 'student-id', 5);
```

**Expected Result**:
- ✅ API returns error: "Can only rate resolved complaints"

---

### Scenario 5: Non-Owner Attempt

**Setup**:
1. Log in as Student A
2. Try to rate a complaint submitted by Student B (even if resolved)

**Expected Behavior**:
- ✅ Rating prompt is NOT displayed (UI prevents this)
- ✅ No way to submit a rating

**Manual Test** (if you try to bypass UI):
```javascript
// This should fail
await submitRating('other-student-complaint-id', 'your-student-id', 5);
```

**Expected Result**:
- ✅ API returns error: "Only the complaint owner can rate"

---

### Scenario 6: Invalid Rating Values

**Manual Test** (API validation):
```javascript
// These should all fail
await submitRating('complaint-id', 'student-id', 0);  // Too low
await submitRating('complaint-id', 'student-id', 6);  // Too high
await submitRating('complaint-id', 'student-id', -1); // Negative
```

**Expected Result**:
- ✅ API returns error: "Rating must be between 1 and 5"
- ✅ Database CHECK constraint also prevents invalid values

---

### Scenario 7: Lecturer/Admin View

**Setup**:
1. Log in as a lecturer or admin
2. Navigate to any resolved complaint

**Expected Behavior**:
- ✅ Rating prompt is NOT displayed (lecturers don't rate)
- ✅ If complaint has been rated, rating is visible in history
- ✅ Lecturers can VIEW ratings but not submit them

---

### Scenario 8: Anonymous Complaint

**Setup**:
1. Log in as a student
2. Navigate to a resolved complaint that was submitted anonymously by you

**Expected Behavior**:
- ✅ Rating prompt IS displayed (you can still rate your own anonymous complaint)
- ✅ Rating submission works normally
- ✅ Rating is recorded but maintains complaint anonymity

---

## Database Verification

### Check Unique Constraint

```sql
-- Try to insert duplicate rating (should fail)
INSERT INTO complaint_ratings (complaint_id, student_id, rating)
VALUES ('existing-complaint-id', 'student-id', 5);

-- Expected: ERROR: duplicate key value violates unique constraint "unique_complaint_rating"
```

### Check Rating Range Constraint

```sql
-- Try to insert invalid rating (should fail)
INSERT INTO complaint_ratings (complaint_id, student_id, rating)
VALUES ('new-complaint-id', 'student-id', 6);

-- Expected: ERROR: new row for relation "complaint_ratings" violates check constraint "rating_range_check"
```

### Verify Existing Ratings

```sql
-- Check if complaint has been rated
SELECT * FROM complaint_ratings 
WHERE complaint_id = 'your-complaint-id';

-- Should return 0 or 1 row (never more than 1)
```

---

## UI States Checklist

### Rating Prompt Display Conditions

The rating prompt should ONLY show when ALL of these are true:

- [ ] User is logged in as a student
- [ ] User is viewing their own complaint
- [ ] Complaint status is "resolved"
- [ ] Complaint has NOT been rated yet
- [ ] Rating prompt has NOT been dismissed

### Rating Prompt Should NOT Show When:

- [ ] User is a lecturer or admin
- [ ] Complaint is not resolved
- [ ] Complaint has already been rated
- [ ] User is viewing someone else's complaint
- [ ] Rating prompt was dismissed

---

## Error Handling Checklist

### API Errors

- [ ] "You have already rated this complaint" - handled gracefully
- [ ] "Rating must be between 1 and 5" - validation prevents this
- [ ] "Can only rate resolved complaints" - UI prevents this
- [ ] "Only the complaint owner can rate" - UI prevents this
- [ ] "Complaint not found" - shows error message

### UI Error States

- [ ] Network error - shows error message
- [ ] Database error - shows error message
- [ ] Validation error - shows inline error
- [ ] Duplicate rating - hides prompt, updates state

---

## Success Indicators

After implementing this feature, you should see:

1. ✅ Database has UNIQUE constraint on complaint_id
2. ✅ API validates before inserting rating
3. ✅ UI checks rating status before showing prompt
4. ✅ Clear error messages for all failure cases
5. ✅ Rating appears in complaint history
6. ✅ No duplicate ratings in database
7. ✅ Smooth user experience with proper feedback

---

## Common Issues & Solutions

### Issue: Rating prompt shows even after rating

**Solution**: Check that `hasRatedComplaint` is being called correctly and state is updated

### Issue: Can submit multiple ratings

**Solution**: Verify database UNIQUE constraint exists and API check is working

### Issue: Error messages not clear

**Solution**: Update error messages in `submitRating` function

### Issue: Rating prompt shows for non-owners

**Solution**: Check complaint ownership validation in UI

---

## Testing Tools

### Browser Console Commands

```javascript
// Check if complaint has been rated
const hasRated = await hasRatedComplaint('complaint-id', 'student-id');
console.log('Has rated:', hasRated);

// Try to submit rating
try {
  const result = await submitRating('complaint-id', 'student-id', 5, 'Great!');
  console.log('Rating submitted:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Database Queries

```sql
-- Count ratings per complaint (should all be 1 or 0)
SELECT complaint_id, COUNT(*) as rating_count
FROM complaint_ratings
GROUP BY complaint_id
HAVING COUNT(*) > 1;

-- Should return 0 rows if constraint is working
```

---

## Sign-Off Checklist

Before marking this task as complete:

- [x] Database UNIQUE constraint verified
- [x] API validation logic implemented
- [x] UI checks rating status before showing prompt
- [x] Error handling implemented
- [x] Test suite created
- [x] Documentation written
- [x] Visual testing completed
- [x] No duplicate ratings possible

**Status**: ✅ READY FOR PRODUCTION
