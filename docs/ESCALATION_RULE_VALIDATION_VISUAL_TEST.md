# Escalation Rule Validation - Visual Test Guide

## Overview
This guide demonstrates how to test the escalation rule validation functionality in the UI.

## Test Scenarios

### 1. Create Valid Rule
**Steps:**
1. Navigate to `/admin/escalation-rules`
2. Click "Create New Rule"
3. Fill in the form:
   - Category: Facilities
   - Priority: Medium
   - Time Threshold: 48 hours
   - Escalate To: Select an admin or lecturer
   - Active: Checked
4. Click "Create Rule"

**Expected Result:**
✅ Rule created successfully
✅ Success message displayed
✅ Rule appears in the list

---

### 2. Test Required Field Validation
**Steps:**
1. Click "Create New Rule"
2. Leave all fields empty
3. Click "Create Rule"

**Expected Result:**
❌ Error messages appear for:
- "Category is required"
- "Priority is required"
- "Time threshold is required"
- "Please select a user to escalate to"

---

### 3. Test Hours Threshold Validation

#### 3a. Zero Hours
**Steps:**
1. Create new rule
2. Set hours threshold to `0`
3. Try to submit

**Expected Result:**
❌ Error: "Time threshold must be greater than 0"

#### 3b. Negative Hours
**Steps:**
1. Set hours threshold to `-5`
2. Try to submit

**Expected Result:**
❌ Error: "Time threshold must be greater than 0"

#### 3c. Exceeds Maximum
**Steps:**
1. Set hours threshold to `10000`
2. Try to submit

**Expected Result:**
❌ Error: "Time threshold cannot exceed 1 year (8760 hours)"

---

### 4. Test Priority-Based Warnings

#### 4a. Critical Priority with Long Threshold
**Steps:**
1. Create new rule
2. Set Priority: Critical
3. Set Hours Threshold: 48
4. Fill other required fields

**Expected Result:**
⚠️ Warning: "Critical priority complaints typically require faster escalation (recommended: ≤24 hours)"
✅ Can still submit (warning, not error)

#### 4b. High Priority with Long Threshold
**Steps:**
1. Set Priority: High
2. Set Hours Threshold: 100

**Expected Result:**
⚠️ Warning: "High priority complaints typically require faster escalation (recommended: ≤72 hours)"

---

### 5. Test Duplicate Rule Prevention

**Setup:**
First, create an active rule:
- Category: Academic
- Priority: High
- Hours: 24
- Escalate To: Admin User
- Active: Yes

**Steps:**
1. Click "Create New Rule"
2. Try to create another rule with:
   - Category: Academic
   - Priority: High
   - Any hours threshold
   - Any user
   - Active: Yes
3. Try to submit

**Expected Result:**
❌ Error: "An active escalation rule already exists for this category and priority combination. Please deactivate the existing rule first or choose a different category/priority combination."

⚠️ Warning alert shows:
- Existing rule details
- Who it escalates to
- Current threshold

---

### 6. Test Editing Existing Rule

**Steps:**
1. Click edit on an existing rule
2. Change the hours threshold
3. Keep same category and priority
4. Submit

**Expected Result:**
✅ Rule updated successfully
✅ No duplicate error (editing same rule)

---

### 7. Test Escalation Target Validation

#### 7a. No User Selected
**Steps:**
1. Create new rule
2. Leave "Escalate To" as "Select a user..."
3. Try to submit

**Expected Result:**
❌ Error: "Please select a user to escalate to"

#### 7b. Invalid User Role (if student in list)
**Note:** The form filters to only show lecturers and admins, so this shouldn't be possible in the UI. But the validation would catch it if it happened.

---

### 8. Test Real-time Validation

**Steps:**
1. Click "Create New Rule"
2. Start typing in Hours Threshold field
3. Enter `0`
4. Click outside the field (blur)

**Expected Result:**
❌ Error appears immediately (before submitting)
❌ Error: "Time threshold must be greater than 0"

**Steps:**
5. Change to `48`
6. Select Priority: Critical

**Expected Result:**
⚠️ Warning appears immediately
⚠️ Warning about critical priority needing faster escalation

---

### 9. Test Inactive Rule Warning

**Steps:**
1. Create new rule
2. Fill all required fields correctly
3. Uncheck "Rule is active"
4. Submit

**Expected Result:**
⚠️ Warning: "This rule is inactive and will not be applied to complaints until activated"
✅ Rule created successfully (warning, not error)

---

### 10. Test Quick Presets

**Steps:**
1. Create new rule
2. Click on preset buttons:
   - "2 hours"
   - "24 hours (1 day)"
   - "168 hours (1 week)"

**Expected Result:**
✅ Hours threshold field updates to preset value
✅ Human-readable format shown below field
   - Example: "Complaints will escalate after: 1 day"

---

### 11. Test Conflict Detection UI

**Setup:**
Create an active rule:
- Category: Facilities
- Priority: High
- Hours: 24
- Escalate To: Dr. Sarah Johnson

**Steps:**
1. Click "Create New Rule"
2. Select Category: Facilities
3. Select Priority: High
4. Keep Active: Yes

**Expected Result:**
⚠️ Yellow warning alert appears:
"Warning: An active rule already exists for this category and priority combination. It escalates to Dr. Sarah Johnson after 1 day. You must deactivate this rule or deactivate the existing rule first."

---

### 12. Test Form Reset on Cancel

**Steps:**
1. Click "Create New Rule"
2. Fill in some fields
3. Click "Cancel"
4. Click "Create New Rule" again

**Expected Result:**
✅ Form is reset to default values
✅ No validation errors shown
✅ Clean slate for new rule

---

## Visual Indicators

### Error States
- 🔴 Red text
- ❌ AlertCircle icon
- Red border on input (if implemented)

### Warning States
- 🟡 Yellow text
- ⚠️ AlertTriangle icon
- Yellow background alert box

### Success States
- 🟢 Green text
- ✅ CheckCircle icon
- Green background alert box

---

## Browser Testing

Test in multiple browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## Accessibility Testing

1. **Keyboard Navigation**
   - Tab through all form fields
   - Submit with Enter key
   - Cancel with Escape key

2. **Screen Reader**
   - Error messages announced
   - Warning messages announced
   - Required fields indicated

3. **Color Contrast**
   - Error text readable
   - Warning text readable
   - Form labels clear

---

## Edge Cases

### 1. Very Short Threshold
- Hours: 1
- Expected: ⚠️ Warning about premature escalations

### 2. Very Long Threshold
- Hours: 8000
- Priority: High
- Expected: ⚠️ Warning about ineffective escalation

### 3. Boundary Values
- Hours: 1 (minimum) - ✅ Valid
- Hours: 8760 (maximum) - ✅ Valid
- Hours: 8761 - ❌ Error

### 4. Decimal Hours
- Hours: 24.5
- Expected: ❌ Error: "Time threshold must be a whole number"

---

## Performance Testing

1. **Large Number of Existing Rules**
   - Create 50+ rules
   - Test duplicate detection performance
   - Should still be instant

2. **Real-time Validation**
   - Type quickly in hours field
   - Validation should debounce/throttle
   - No lag or freezing

---

## Integration Testing

### With Database
1. Create rule in UI
2. Verify in database:
   ```sql
   SELECT * FROM escalation_rules ORDER BY created_at DESC LIMIT 1;
   ```
3. Check all fields match

### With RLS Policies
1. Test as admin user - ✅ Can create/edit
2. Test as lecturer user - ❌ Cannot create (if policy restricts)
3. Test as student user - ❌ Cannot access page

---

## Regression Testing

After any changes to validation logic:

1. ✅ All existing rules still load correctly
2. ✅ Can edit existing rules without issues
3. ✅ Can create new rules with valid data
4. ✅ Invalid data still rejected
5. ✅ Warnings still appear appropriately
6. ✅ No console errors
7. ✅ No TypeScript errors

---

## Success Criteria

All tests should pass with:
- ✅ Appropriate error messages
- ✅ Clear visual feedback
- ✅ No false positives
- ✅ No false negatives
- ✅ Consistent behavior across browsers
- ✅ Accessible to all users
- ✅ Fast and responsive

---

## Notes

- Mock data is used for UI development
- Real API integration will be in Phase 12
- Validation logic is centralized in `src/lib/validations/escalation-rules.ts`
- Form component is in `src/components/complaints/escalation-rule-form.tsx`
