# Enable/Disable Escalation Rules - Visual Guide

## Overview

This guide demonstrates the visual elements and user interactions for enabling and disabling escalation rules.

## UI Components

### 1. Status Badge

Each rule displays its current status with a colored badge:

**Active Rule:**

```
┌─────────────────────────────────────────────────┐
│ Harassment - Critical  [Active]                 │
│                        ↑ Green badge            │
└─────────────────────────────────────────────────┘
```

**Inactive Rule:**

```
┌─────────────────────────────────────────────────┐
│ Course Content - Medium  [Inactive]             │
│                          ↑ Gray badge           │
└─────────────────────────────────────────────────┘
```

### 2. Toggle Button

Located in the actions section of each rule card:

**Active Rule (Eye Icon):**

```
┌──────────────────────────────────────────────────┐
│                                    [👁️] [✏️] [🗑️] │
│                                     ↑             │
│                              Click to deactivate │
└──────────────────────────────────────────────────┘
```

**Inactive Rule (EyeOff Icon):**

```
┌──────────────────────────────────────────────────┐
│                                    [👁️‍🗨️] [✏️] [🗑️] │
│                                     ↑             │
│                               Click to activate  │
└──────────────────────────────────────────────────┘
```

### 3. Status Filter

Located in the filter panel at the top of the page:

```
┌─────────────────────────────────────────────────┐
│ Search Rules    Category    Priority    Status  │
│ [Search...]     [All]       [All]       [All ▼] │
│                                          ├─────┤ │
│                                          │ All │ │
│                                          │Active│ │
│                                          │Inactive│
│                                          └─────┘ │
└─────────────────────────────────────────────────┘
```

### 4. Create/Edit Form Checkbox

Located at the bottom of the rule form:

```
┌─────────────────────────────────────────────────┐
│ Escalate To                                     │
│ [Select a user... ▼]                            │
│                                                 │
│ ☑ Rule is active                                │
│ This rule will be applied to matching complaints│
│                                                 │
│                              [Cancel] [Create]  │
└─────────────────────────────────────────────────┘
```

## User Interactions

### Toggle Rule Status

**Step 1: View Rule**

```
┌─────────────────────────────────────────────────────────┐
│ Harassment - Critical  [Active]                         │
│                                                         │
│ ⏱️ Time Threshold: 2 hours                              │
│ ⬆️ Escalate To: Dr. Sarah Johnson                       │
│                                                         │
│ Created: 11/1/2024 • Last updated: 11/1/2024           │
│                                          [👁️] [✏️] [🗑️]  │
└─────────────────────────────────────────────────────────┘
```

**Step 2: Click Toggle Button**

```
┌─────────────────────────────────────────────────────────┐
│ Harassment - Critical  [Inactive]  ← Status changed     │
│                                                         │
│ ⏱️ Time Threshold: 2 hours                              │
│ ⬆️ Escalate To: Dr. Sarah Johnson                       │
│                                                         │
│ Created: 11/1/2024 • Last updated: 11/26/2024 ← Updated│
│                                          [👁️‍🗨️] [✏️] [🗑️] │
└─────────────────────────────────────────────────────────┘
```

**Step 3: Success Message**

```
┌─────────────────────────────────────────────────────────┐
│ ✓ Rule deactivated successfully                         │
└─────────────────────────────────────────────────────────┘
```

### Filter by Status

**Show Only Active Rules:**

```
┌─────────────────────────────────────────────────┐
│ Status: [Active ▼]                              │
└─────────────────────────────────────────────────┘

Results: 4 active rules displayed
```

**Show Only Inactive Rules:**

```
┌─────────────────────────────────────────────────┐
│ Status: [Inactive ▼]                            │
└─────────────────────────────────────────────────┘

Results: 1 inactive rule displayed
```

### Create Rule with Status

**New Rule Form:**

```
┌─────────────────────────────────────────────────┐
│ Create New Escalation Rule                      │
│                                                 │
│ Category: [Academic ▼]                          │
│ Priority: [High ▼]                              │
│ Time Threshold: [48] hours                      │
│ Escalate To: [Dr. Sarah Johnson ▼]             │
│                                                 │
│ ☑ Rule is active                                │
│ This rule will be applied to matching complaints│
│                                                 │
│                              [Cancel] [Create]  │
└─────────────────────────────────────────────────┘
```

**Inactive Rule:**

```
┌─────────────────────────────────────────────────┐
│ ☐ Rule is active                                │
│ This rule will not be applied until activated   │
└─────────────────────────────────────────────────┘
```

## Color Scheme

### Light Mode

- **Active Badge**: Green background (#dcfce7), green text (#166534)
- **Inactive Badge**: Gray background (#f4f4f5), gray text (#27272a)
- **Toggle Button**: Outlined button with hover effect
- **Success Message**: Green background with checkmark icon

### Dark Mode

- **Active Badge**: Dark green background (#14532d), light green text (#86efac)
- **Inactive Badge**: Dark gray background (#27272a), light gray text (#e4e4e7)
- **Toggle Button**: Outlined button with dark mode colors
- **Success Message**: Dark green background with checkmark icon

## Accessibility

### Keyboard Navigation

- Tab to toggle button
- Enter/Space to activate toggle
- Tab to status filter dropdown
- Arrow keys to navigate filter options

### Screen Reader Support

- Button has `title` attribute: "Deactivate rule" / "Activate rule"
- Status badge has semantic meaning
- Success message is announced
- Form checkbox has associated label

### Visual Indicators

- Clear color contrast for badges
- Icon changes (Eye vs EyeOff)
- Text changes in help text
- Success message with icon

## Example Scenarios

### Scenario 1: Temporarily Disable Rule

**Use Case**: Admin wants to temporarily disable harassment escalation during a holiday period.

1. Navigate to Escalation Rules page
2. Find "Harassment - Critical" rule
3. Click Eye icon to deactivate
4. See "Rule deactivated successfully" message
5. Badge changes from green "Active" to gray "Inactive"
6. Icon changes from Eye to EyeOff

### Scenario 2: Activate Disabled Rule

**Use Case**: Admin wants to re-enable a previously disabled rule.

1. Filter by "Inactive" status
2. Find the disabled rule
3. Click EyeOff icon to activate
4. See "Rule activated successfully" message
5. Badge changes from gray "Inactive" to green "Active"
6. Icon changes from EyeOff to Eye

### Scenario 3: Create Inactive Rule for Testing

**Use Case**: Admin wants to create a rule but test it before activating.

1. Click "Create New Rule" button
2. Fill in rule details
3. Uncheck "Rule is active" checkbox
4. Click "Create Rule"
5. New rule appears with gray "Inactive" badge
6. Test the rule configuration
7. Click EyeOff icon to activate when ready

### Scenario 4: Bulk Status Management

**Use Case**: Admin wants to see all inactive rules to review them.

1. Set Status filter to "Inactive"
2. Review all inactive rules
3. Activate needed rules one by one
4. Or delete obsolete rules

## Implementation Notes

### State Management

- Status is stored in `is_active` boolean field
- Toggle updates state immediately
- Success message auto-dismisses after 3 seconds
- Filter state is independent of rule state

### Performance

- Filtering uses React.useMemo for efficiency
- Toggle updates only the affected rule
- No full page reload required
- Smooth transitions and animations

### Data Persistence

- Status changes update `updated_at` timestamp
- Changes are persisted to database (Phase 12)
- Filter preferences are session-based (not persisted)

## Testing Checklist

### Visual Testing

- [ ] Active badge displays correctly in light mode
- [ ] Active badge displays correctly in dark mode
- [ ] Inactive badge displays correctly in light mode
- [ ] Inactive badge displays correctly in dark mode
- [ ] Eye icon displays for active rules
- [ ] EyeOff icon displays for inactive rules
- [ ] Success message displays and auto-dismisses
- [ ] Status filter dropdown works correctly

### Functional Testing

- [ ] Toggle changes status from active to inactive
- [ ] Toggle changes status from inactive to active
- [ ] Badge updates immediately after toggle
- [ ] Icon updates immediately after toggle
- [ ] Success message shows correct text
- [ ] Filter shows only active rules when selected
- [ ] Filter shows only inactive rules when selected
- [ ] Form checkbox sets initial status correctly
- [ ] Form checkbox can be changed before submission

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces status changes
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Tooltips are accessible

---

**Last Updated**: November 26, 2024
**Status**: Complete
**Related Files**:

- `src/app/admin/escalation-rules/page.tsx`
- `src/components/complaints/escalation-rule-form.tsx`
- `docs/TASK_10.1_ENABLE_DISABLE_RULES_COMPLETION.md`
