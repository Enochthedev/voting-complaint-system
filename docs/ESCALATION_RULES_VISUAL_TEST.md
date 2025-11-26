# Escalation Rules Page - Visual Test Guide

## Overview
This document provides a visual testing guide for the Escalation Rules management page located at `/admin/escalation-rules`.

## Access
- **URL**: `/admin/escalation-rules`
- **Role Required**: Admin
- **Navigation**: Sidebar → "Escalation Rules" (with ArrowUpCircle icon)

## Page Layout

### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ Auto-Escalation Rules                                       │
│ Configure automatic escalation rules for complaints that   │
│ remain unaddressed                                          │
└─────────────────────────────────────────────────────────────┘
```

### Info Alert
```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Escalation rules automatically reassign complaints to    │
│   designated users when they remain unaddressed for a      │
│   specified time period. Rules are checked hourly.         │
└─────────────────────────────────────────────────────────────┘
```

### Search and Filters Panel
```
┌─────────────────────────────────────────────────────────────┐
│ Search Rules          Category         Priority    Status   │
│ [🔍 Search...]       [All Categories] [All Prior.] [All]    │
│                                                              │
│                                    [+ Create New Rule]       │
└─────────────────────────────────────────────────────────────┘
```

### Rules List (Example Card)
```
┌─────────────────────────────────────────────────────────────┐
│ Harassment - [Critical]                          [Active]   │
│                                                              │
│ 🕐 Time Threshold: 2 hours                                  │
│ ⬆️ Escalate To: Dr. Sarah Johnson                           │
│                                                              │
│ Created: 11/1/2024 • Last updated: 11/1/2024               │
│                                                              │
│                                    [👁️] [✏️] [🗑️]           │
└─────────────────────────────────────────────────────────────┘
```

## Visual Elements

### 1. Status Badges
- **Active**: Green badge with "Active" text
- **Inactive**: Gray badge with "Inactive" text

### 2. Priority Badges
- **Low**: Blue background, blue text
- **Medium**: Yellow background, yellow text
- **High**: Orange background, orange text
- **Critical**: Red background, red text

### 3. Icons
- **Clock** (🕐): Time threshold indicator
- **ArrowUpCircle** (⬆️): Escalation target indicator
- **Eye** (👁️): Activate rule button
- **EyeOff**: Deactivate rule button
- **Edit2** (✏️): Edit rule button
- **Trash2** (🗑️): Delete rule button
- **Plus**: Create new rule button
- **Search** (🔍): Search input icon

### 4. Color Scheme
- **Background**: zinc-50 (light) / zinc-900 (dark)
- **Cards**: white (light) / zinc-950 (dark)
- **Borders**: zinc-200 (light) / zinc-800 (dark)
- **Text Primary**: zinc-900 (light) / zinc-100 (dark)
- **Text Secondary**: zinc-600 (light) / zinc-400 (dark)

## Test Scenarios

### Scenario 1: View All Rules
1. Navigate to `/admin/escalation-rules`
2. Verify page loads with header and info alert
3. Verify all mock rules are displayed (5 rules)
4. Check that each rule card shows:
   - Category and priority
   - Active/inactive status
   - Time threshold
   - Escalation target user
   - Timestamps
   - Action buttons

**Expected Result**: All 5 mock rules displayed correctly

### Scenario 2: Search Functionality
1. Type "harassment" in search box
2. Verify only harassment-related rules appear
3. Clear search
4. Type "Sarah Johnson" in search box
5. Verify only rules assigned to Sarah Johnson appear

**Expected Result**: Search filters rules in real-time

### Scenario 3: Category Filter
1. Select "Facilities" from category dropdown
2. Verify only facilities rules appear (1 rule)
3. Select "Academic" from category dropdown
4. Verify only academic rules appear (1 rule)
5. Select "All Categories"
6. Verify all rules appear again

**Expected Result**: Category filter works correctly

### Scenario 4: Priority Filter
1. Select "Critical" from priority dropdown
2. Verify only critical priority rules appear (1 rule)
3. Select "High" from priority dropdown
4. Verify only high priority rules appear (2 rules)
5. Select "All Priorities"
6. Verify all rules appear again

**Expected Result**: Priority filter works correctly

### Scenario 5: Status Filter
1. Select "Active" from status dropdown
2. Verify only active rules appear (4 rules)
3. Select "Inactive" from status dropdown
4. Verify only inactive rules appear (1 rule)
5. Select "All Status"
6. Verify all rules appear again

**Expected Result**: Status filter works correctly

### Scenario 6: Toggle Active/Inactive
1. Find an active rule
2. Click the Eye icon button
3. Verify success message appears
4. Verify rule badge changes to "Inactive"
5. Click the EyeOff icon button
6. Verify success message appears
7. Verify rule badge changes back to "Active"

**Expected Result**: Toggle works and UI updates immediately

### Scenario 7: Delete Rule
1. Click the Trash icon on any rule
2. Verify delete confirmation modal appears
3. Verify modal shows rule details
4. Click "Cancel"
5. Verify modal closes and rule remains
6. Click Trash icon again
7. Click "Delete" in modal
8. Verify success message appears
9. Verify rule is removed from list

**Expected Result**: Delete confirmation works and rule is removed

### Scenario 8: Create New Rule (Placeholder)
1. Click "Create New Rule" button
2. Verify modal opens
3. Verify placeholder message is shown
4. Click "Close"
5. Verify modal closes

**Expected Result**: Modal opens and closes (form to be implemented)

### Scenario 9: Edit Rule (Placeholder)
1. Click Edit icon on any rule
2. Verify modal opens with placeholder
3. Verify modal title says "Edit Escalation Rule"
4. Click "Close"
5. Verify modal closes

**Expected Result**: Modal opens and closes (form to be implemented)

### Scenario 10: Empty State
1. Apply filters that match no rules (e.g., "Other" category + "Critical" priority)
2. Verify empty state message appears
3. Verify message says "No escalation rules found matching your filters"
4. Clear all filters
5. Verify rules appear again

**Expected Result**: Empty state displays correctly

### Scenario 11: Combined Filters
1. Select "Facilities" category
2. Select "High" priority
3. Select "Active" status
4. Verify only 1 rule matches all criteria
5. Clear filters one by one
6. Verify results update after each change

**Expected Result**: Multiple filters work together correctly

### Scenario 12: Dark Mode
1. Toggle dark mode
2. Verify all colors invert correctly
3. Verify text remains readable
4. Verify badges have appropriate dark mode colors
5. Verify cards have proper contrast

**Expected Result**: Dark mode styling works correctly

### Scenario 13: Responsive Design
1. Resize browser to mobile width
2. Verify filters stack vertically
3. Verify cards remain readable
4. Verify action buttons remain accessible
5. Resize back to desktop
6. Verify layout returns to grid

**Expected Result**: Page is responsive on all screen sizes

## Mock Data Summary

### Rules
1. **Harassment + Critical**: 2 hours → Dr. Sarah Johnson (Active)
2. **Facilities + High**: 24 hours → Prof. Michael Chen (Active)
3. **Academic + High**: 48 hours → Dr. Sarah Johnson (Active)
4. **Course Content + Medium**: 72 hours → Dr. Emily Rodriguez (Inactive)
5. **Administrative + Low**: 168 hours → Prof. Michael Chen (Active)

### Users
1. Dr. Sarah Johnson (Admin)
2. Prof. Michael Chen (Admin)
3. Dr. Emily Rodriguez (Admin)
4. Dr. James Wilson (Lecturer)

## Success Criteria

✅ Page loads without errors
✅ All mock data displays correctly
✅ Search functionality works
✅ All filters work independently
✅ Multiple filters work together
✅ Toggle active/inactive works
✅ Delete confirmation works
✅ Success messages display and auto-dismiss
✅ Empty state displays correctly
✅ Dark mode works
✅ Responsive design works
✅ Navigation link appears in sidebar
✅ Icons display correctly
✅ Time thresholds format correctly (hours/days)

## Known Limitations (To Be Implemented)

- Create rule form (placeholder modal)
- Edit rule form (placeholder modal)
- API integration (Phase 12)
- Real-time updates
- Form validation
- Error handling for API failures

## Next Steps

1. Implement rule creation form component
2. Implement rule editing functionality
3. Add form validation
4. Connect to Supabase API (Phase 12)
5. Add real-time updates if needed
