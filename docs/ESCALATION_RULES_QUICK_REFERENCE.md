# Escalation Rules - Quick Reference

## Overview
The Escalation Rules page allows administrators to configure automatic escalation of complaints that remain unaddressed for a specified time period.

## Access
- **URL**: `/admin/escalation-rules`
- **Role**: Admin only
- **Navigation**: Sidebar → "Escalation Rules"

## Key Features

### 1. Rule Configuration
Each escalation rule defines:
- **Category**: Type of complaint (Academic, Facilities, Harassment, etc.)
- **Priority**: Urgency level (Low, Medium, High, Critical)
- **Time Threshold**: Hours before escalation (displayed as hours or days)
- **Escalate To**: User who will receive the escalated complaint
- **Status**: Active or Inactive

### 2. Search and Filtering
- **Search**: By category name or assigned user name
- **Category Filter**: Filter by complaint category
- **Priority Filter**: Filter by priority level
- **Status Filter**: Show active, inactive, or all rules

### 3. Rule Management
- **Create**: Add new escalation rules (form to be implemented)
- **Edit**: Modify existing rules (form to be implemented)
- **Delete**: Remove rules with confirmation
- **Toggle**: Enable/disable rules without deleting

### 4. Visual Indicators
- **Active Badge**: Green badge for active rules
- **Inactive Badge**: Gray badge for inactive rules
- **Priority Badges**: Color-coded (Blue=Low, Yellow=Medium, Orange=High, Red=Critical)
- **Icons**: Clock for threshold, ArrowUpCircle for escalation target

## How Escalation Works

1. **Rule Matching**: System checks complaints against active rules hourly
2. **Time Check**: Compares complaint age against threshold
3. **Auto-Assignment**: Matching complaints are reassigned to designated user
4. **Notification**: Escalation target receives notification
5. **History Logging**: Escalation event is logged in complaint history

## Example Rules

### Critical Harassment (2 hours)
- Harassment complaints with critical priority
- Escalates after 2 hours
- Assigned to senior admin for immediate attention

### High Priority Facilities (24 hours)
- Facilities complaints with high priority
- Escalates after 1 day
- Assigned to facilities manager

### Academic Issues (48 hours)
- Academic complaints with high priority
- Escalates after 2 days
- Assigned to academic dean

## Time Threshold Guidelines

| Priority | Recommended Threshold |
|----------|----------------------|
| Critical | 2-4 hours |
| High | 24-48 hours |
| Medium | 3-7 days |
| Low | 7-14 days |

## Best Practices

1. **Start Conservative**: Begin with longer thresholds and adjust based on data
2. **Monitor Impact**: Track escalation frequency in analytics
3. **Clear Ownership**: Assign escalations to users with authority to act
4. **Category-Specific**: Different categories may need different thresholds
5. **Test Rules**: Start with inactive rules and enable after testing
6. **Regular Review**: Review and adjust rules quarterly

## Common Use Cases

### Urgent Safety Issues
- Category: Harassment
- Priority: Critical
- Threshold: 2 hours
- Escalate To: Safety Officer

### Facility Emergencies
- Category: Facilities
- Priority: High
- Threshold: 4 hours
- Escalate To: Facilities Director

### Academic Disputes
- Category: Academic
- Priority: High
- Threshold: 48 hours
- Escalate To: Academic Dean

### General Administrative
- Category: Administrative
- Priority: Medium
- Threshold: 7 days
- Escalate To: Admin Manager

## UI Components

### Rule Card
```
┌─────────────────────────────────────────────┐
│ Category - Priority Badge        Status     │
│                                             │
│ 🕐 Time Threshold: X hours/days            │
│ ⬆️ Escalate To: User Name                  │
│                                             │
│ Created: Date • Last updated: Date         │
│                                             │
│                        [👁️] [✏️] [🗑️]      │
└─────────────────────────────────────────────┘
```

### Action Buttons
- **Eye/EyeOff**: Toggle active/inactive status
- **Edit**: Open edit modal (to be implemented)
- **Trash**: Delete with confirmation

### Success Messages
- Auto-dismiss after 3 seconds
- Green background with checkmark icon
- Clear action confirmation

## Data Structure

```typescript
interface EscalationRule {
  id: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  hours_threshold: number;
  escalate_to: string; // User ID
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

## Future Enhancements (Phase 12)

- [ ] API integration with Supabase
- [ ] Rule creation form
- [ ] Rule editing form
- [ ] Form validation
- [ ] Duplicate rule detection
- [ ] Rule conflict detection
- [ ] Escalation history tracking
- [ ] Analytics on escalation effectiveness
- [ ] Email notifications for escalations
- [ ] Custom escalation chains (multi-level)

## Related Features

- **Complaint History**: Escalation events are logged
- **Notifications**: Escalation targets receive notifications
- **Analytics**: Track escalation frequency and effectiveness
- **User Management**: Assign escalation targets

## Support

For issues or questions:
1. Check the visual test guide: `ESCALATION_RULES_VISUAL_TEST.md`
2. Review implementation details: `TASK_10.1_ESCALATION_RULES_PAGE_COMPLETION.md`
3. Test with mock data before API integration

## Status

✅ **Phase 1 Complete**: UI and basic functionality with mock data
⏳ **Phase 2 Pending**: Form components for create/edit
⏳ **Phase 3 Pending**: API integration (Phase 12)
