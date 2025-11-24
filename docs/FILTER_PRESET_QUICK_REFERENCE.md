# Filter Preset - Quick Reference Guide

## What is Filter Preset?

Filter Preset allows you to save your frequently used filter combinations and quickly apply them later. This saves time and ensures consistency when filtering complaints.

## How to Use

### Saving a Preset

1. **Apply Filters**
   - Go to the Complaints page
   - Use the Filter Panel to select your desired filters:
     - Status (New, Opened, In Progress, etc.)
     - Category (Academic, Facilities, etc.)
     - Priority (Low, Medium, High, Critical)
     - Date Range
     - Tags
     - Assigned Lecturer
     - Sort options

2. **Save the Preset**
   - Scroll to the bottom of the Filter Panel
   - Click the "Save Filter Preset" button
   - Enter a descriptive name (e.g., "High Priority Academic")
   - Click "Save" or press Enter

3. **Confirmation**
   - Your preset will appear in the "Saved Presets" panel below the filters
   - The preset is automatically saved to your browser

### Loading a Preset

1. **Find Your Preset**
   - Look in the "Saved Presets" panel below the Filter Panel
   - All your saved presets are listed there

2. **Apply the Preset**
   - Click on the preset name
   - All filters will update to match the preset
   - The complaint list will refresh automatically
   - The active preset will be highlighted with a checkmark (✓)

3. **Result**
   - Page resets to page 1
   - Any active search is cleared
   - Filters match exactly what you saved

### Deleting a Preset

1. **Locate the Preset**
   - Find the preset you want to delete in the "Saved Presets" panel

2. **Delete**
   - Click the trash icon (🗑) next to the preset name
   - The preset is immediately removed
   - No confirmation dialog (deletion is instant)

3. **Note**
   - Deletion is permanent
   - Your current filters remain unchanged
   - If you delete the active preset, the checkmark disappears

## Tips & Tricks

### Naming Presets

**Good Names:**
- "High Priority Academic" - Descriptive and specific
- "My Urgent Issues" - Personal and clear
- "Facilities - Last 7 Days" - Includes timeframe
- "Unassigned Critical" - Indicates status and priority

**Avoid:**
- "Preset 1" - Not descriptive
- "Test" - Unclear purpose
- "asdf" - Meaningless

### Common Preset Examples

**For Students:**
- "My Open Complaints" - Status: New, Opened, In Progress
- "My Urgent Issues" - Priority: High, Critical
- "Recent Submissions" - Date: Last 30 days, Sort: Created Date (Desc)

**For Lecturers:**
- "Daily Review" - Status: New, Priority: High
- "Assigned to Me" - Assigned To: [Your Name]
- "Facilities Issues" - Category: Facilities, Status: New, Opened
- "This Week" - Date: Last 7 days
- "Needs Attention" - Status: New, Opened, Priority: High, Critical

**For Admins:**
- "Critical Alerts" - Priority: Critical, Status: New, Opened
- "Escalated Complaints" - Escalation Level > 0
- "Resolved This Month" - Status: Resolved, Date: This month
- "Harassment Cases" - Category: Harassment

### Keyboard Shortcuts

When saving a preset:
- **Enter** - Save the preset
- **Escape** - Cancel and close input

### Limitations

- Presets are stored in your browser (not synced across devices)
- Each browser has its own set of presets
- Clearing browser data will delete presets
- No limit on number of presets (within browser storage limits)

## Troubleshooting

### "Save Filter Preset" Button is Disabled

**Cause:** No filters are currently active

**Solution:** Apply at least one filter before saving

### Preset Disappeared After Refresh

**Cause:** Browser data was cleared or localStorage is disabled

**Solution:** 
- Check browser settings for localStorage
- Ensure you're not in private/incognito mode
- Re-create the preset

### Preset Not Loading

**Cause:** Corrupted data or browser issue

**Solution:**
- Try refreshing the page
- Delete and re-create the preset
- Check browser console for errors

### Can't Delete Preset

**Cause:** Browser storage issue

**Solution:**
- Refresh the page and try again
- Clear browser cache
- Check browser console for errors

## Technical Details

### What Gets Saved?

Every aspect of your filter configuration:
- All selected statuses
- All selected categories
- All selected priorities
- Date range (from and to)
- All selected tags
- Assigned lecturer selection
- Sort field
- Sort order (ascending/descending)

### Where is it Stored?

- **Location:** Browser's localStorage
- **Key:** `complaint-filter-presets`
- **Format:** JSON array of preset objects
- **Persistence:** Survives page refreshes and browser restarts

### Data Structure

```json
{
  "id": "preset-1732123456789",
  "name": "High Priority Academic",
  "filters": {
    "status": ["new", "opened"],
    "category": ["academic"],
    "priority": ["high"],
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "tags": ["urgent"],
    "assignedTo": "lecturer-1",
    "sortBy": "created_at",
    "sortOrder": "desc"
  },
  "createdAt": "2024-11-20T10:30:00.000Z"
}
```

## Best Practices

### Organization

1. **Use Descriptive Names**
   - Make it easy to identify the preset's purpose
   - Include key filter criteria in the name

2. **Create Role-Specific Presets**
   - Students: Focus on personal complaints
   - Lecturers: Focus on workload and priorities
   - Admins: Focus on system-wide monitoring

3. **Regular Cleanup**
   - Delete presets you no longer use
   - Update preset names if purpose changes

### Workflow Integration

1. **Morning Routine**
   - Create "Daily Review" preset
   - Load it each morning for consistent workflow

2. **Weekly Reports**
   - Create "This Week" preset
   - Use for weekly status updates

3. **Emergency Response**
   - Create "Critical Alerts" preset
   - Quick access to urgent issues

## FAQ

**Q: Can I share presets with other users?**
A: Not currently. Presets are stored locally in your browser.

**Q: How many presets can I save?**
A: No hard limit, but browser localStorage has size limits (typically 5-10MB).

**Q: Do presets sync across devices?**
A: No, presets are stored per browser and don't sync.

**Q: Can I export/import presets?**
A: Not currently. This is a potential future enhancement.

**Q: What happens if I clear my browser data?**
A: All presets will be deleted. You'll need to recreate them.

**Q: Can I edit a saved preset?**
A: Not directly. Load the preset, modify filters, then save as a new preset.

**Q: Do presets include search queries?**
A: No, only filter settings are saved. Search is separate.

## Related Features

- **Filter Panel** - Main filtering interface
- **Active Filter Chips** - Visual display of active filters
- **Search Bar** - Text-based complaint search
- **Sort Options** - Included in preset configuration

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Try refreshing the page
4. Contact system administrator

---

**Last Updated:** November 20, 2024
**Feature Version:** 1.0
**Task:** 4.2.9 - Add "Save Filter Preset" functionality
