# Announcement Editing and Deletion - Quick Reference

## Overview
Lecturers can edit and delete announcements through the admin announcements management page.

## Access
- **URL**: `/admin/announcements`
- **Role Required**: Lecturer/Admin
- **Navigation**: Dashboard → Admin → Announcements

## Features

### ✏️ Edit Announcement

**How to Edit:**
1. Click "Edit" button on announcement card
2. Modify title and/or content
3. Click "Update Announcement"
4. Success message confirms update

**Validation Rules:**
- Title: 5-200 characters, required
- Content: 10-5000 characters, required

**What Gets Updated:**
- Title (if changed)
- Content (if changed)
- `updated_at` timestamp (automatically)

**What Stays the Same:**
- ID
- Created by
- Created at timestamp

### 🗑️ Delete Announcement

**How to Delete:**
1. Click "Delete" button on announcement card
2. Confirm in dialog (warns about permanent deletion)
3. Success message confirms deletion

**Important:**
- ⚠️ Deletion is permanent and cannot be undone
- Confirmation dialog prevents accidental deletion
- Announcement immediately removed from list

## UI Elements

### Announcement Card Actions
```
┌─────────────────────────────────────┐
│ 📢 Announcement Title               │
│ 📅 Nov 25, 2024 • Today            │
│                                     │
│ Announcement content here...        │
│                                     │
│ Last updated: Nov 25, 2024 3:45 PM │
│                                     │
│ [✏️ Edit] [🗑️ Delete]              │
└─────────────────────────────────────┘
```

### Edit Form
```
┌─────────────────────────────────────┐
│ Edit Announcement                   │
│                                     │
│ Announcement Title *                │
│ [System Maintenance Scheduled    ]  │
│ 32/200 characters                   │
│                                     │
│ Content *                           │
│ [The system will undergo...      ]  │
│ [                                 ]  │
│ [                                 ]  │
│ 156/5000 characters                 │
│                                     │
│ ℹ️ This announcement will be visible│
│    to all students immediately      │
│                                     │
│ [Cancel] [Update Announcement]      │
└─────────────────────────────────────┘
```

## API Functions

### Update Announcement
```typescript
import { updateAnnouncement } from '@/lib/api/announcements';

await updateAnnouncement(announcementId, {
  title: 'New Title',
  content: 'New Content'
});
```

### Delete Announcement
```typescript
import { deleteAnnouncement } from '@/lib/api/announcements';

await deleteAnnouncement(announcementId);
```

## State Management

### Edit State
- `editingAnnouncement`: Tracks which announcement is being edited
- `null` = list view
- `Announcement` object = edit form view

### Delete State
- `deletingAnnouncementId`: Tracks which announcement is being deleted
- Used for loading state on delete button

## User Feedback

### Success Messages
- ✅ "Announcement updated successfully!"
- ✅ "Announcement deleted successfully!"
- Auto-dismiss after 3 seconds
- Green background with checkmark icon

### Error Messages
- ❌ "Failed to update announcement. Please try again."
- ❌ "Failed to delete announcement. Please try again."
- Red background with alert icon
- Stays visible until dismissed or new action

### Loading States
- Update: Button shows spinner, disabled
- Delete: Button shows "Deleting...", disabled

## Validation Errors

### Title Errors
- "Title is required" (empty)
- "Title must be at least 5 characters" (too short)
- "Title must be less than 200 characters" (too long)

### Content Errors
- "Content is required" (empty)
- "Content must be at least 10 characters" (too short)
- "Content must be less than 5000 characters" (too long)

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit form (when focused on input)
- **Escape**: Close form (when Cancel button focused)

## Best Practices

### When to Edit
- Fix typos or errors
- Update outdated information
- Clarify unclear content
- Add additional details

### When to Delete
- Announcement is no longer relevant
- Information is outdated and cannot be updated
- Duplicate announcement exists
- Announcement was created in error

### Tips
- ✅ Review changes before saving
- ✅ Use clear, concise language
- ✅ Check spelling and grammar
- ✅ Consider impact on students
- ❌ Don't delete announcements students may reference
- ❌ Don't make frequent edits (confusing for students)

## Timestamps

### Created At
- Set when announcement is first created
- Never changes
- Format: "Nov 25, 2024, 10:00 AM"

### Updated At
- Set when announcement is created
- Updates every time announcement is edited
- Format: "Nov 25, 2024, 3:45 PM"

### Display Logic
```typescript
// Only show "Last updated" if announcement was edited
if (announcement.updated_at !== announcement.created_at) {
  // Show: "Last updated: Nov 25, 2024, 3:45 PM"
}
```

## Permissions

### Who Can Edit/Delete
- ✅ Lecturers (created the announcement)
- ✅ Admins (any announcement)

### Who Cannot Edit/Delete
- ❌ Students
- ❌ Unauthenticated users

## Data Flow

### Edit Flow
```
User clicks Edit
  ↓
Form loads with data
  ↓
User modifies fields
  ↓
User clicks Update
  ↓
Validation runs
  ↓
API call (updateAnnouncement)
  ↓
Mock data updated
  ↓
UI state updated
  ↓
Success message shown
  ↓
Return to list view
```

### Delete Flow
```
User clicks Delete
  ↓
Confirmation dialog
  ↓
User confirms
  ↓
API call (deleteAnnouncement)
  ↓
Mock data updated
  ↓
UI state updated
  ↓
Success message shown
  ↓
Announcement removed from list
```

## Troubleshooting

### Edit button doesn't work
- Check user role (must be lecturer)
- Check browser console for errors
- Refresh page and try again

### Changes don't save
- Check validation errors (red text under fields)
- Ensure all required fields are filled
- Check network connection

### Delete confirmation doesn't appear
- Check browser settings (allow dialogs)
- Try different browser
- Check browser console for errors

### Success message doesn't appear
- Check if operation actually completed
- Look for error message instead
- Check browser console

## Related Documentation

- [Announcement Creation Form](./ANNOUNCEMENT_CREATION_FORM.md)
- [Announcement System Implementation](./DASHBOARD_ANNOUNCEMENTS_IMPLEMENTATION.md)
- [Admin Announcements Page](../src/app/admin/announcements/page.tsx)

## Phase 12 Notes

When connecting to Supabase:
- Update API functions to use real database
- Add RLS policies for lecturer-only access
- Consider soft delete vs hard delete
- Add audit logging for edits/deletions
- Clean up related notifications on delete

## Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Edit UI | ✅ Complete | Edit button on each card |
| Edit Form | ✅ Complete | Pre-fills with existing data |
| Edit API | ✅ Complete | Mock implementation ready |
| Delete UI | ✅ Complete | Delete button with confirmation |
| Delete API | ✅ Complete | Mock implementation ready |
| Validation | ✅ Complete | Same as create form |
| Error Handling | ✅ Complete | User-friendly messages |
| Loading States | ✅ Complete | Visual feedback during operations |
| Success Feedback | ✅ Complete | Auto-dismiss alerts |
| Timestamps | ✅ Complete | Shows last updated time |

**Status**: ✅ Fully Implemented and Operational
