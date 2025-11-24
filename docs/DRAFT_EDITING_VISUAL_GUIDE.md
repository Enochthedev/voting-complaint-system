# Draft Editing - Visual Guide

## User Journey: Editing a Draft Complaint

### Step 1: View Drafts List
```
┌─────────────────────────────────────────────────────────────┐
│  Draft Complaints                                           │
│  Continue working on your saved drafts...                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ WiFi connectivity issues in library                   │ │
│  │ [Facilities] [Medium] #wifi-issues #library          │ │
│  │ 🕐 Last edited 2 hours ago                           │ │
│  │                                    [Continue] [🗑️]    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Unclear grading criteria for assignment              │ │
│  │ [Academic] [Low] #grading #assignment                │ │
│  │ 🕐 Last edited 1 day ago                             │ │
│  │                                    [Continue] [🗑️]    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Click "Continue" Button
**Action**: User clicks "Continue" on first draft
**Navigation**: `/complaints/new?draft=draft-1`

### Step 3: Loading State
```
┌─────────────────────────────────────────────────────────────┐
│  Edit Draft Complaint                                       │
│  Continue editing your draft complaint...                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      ⟳ Loading draft...                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Form Populated with Draft Data
```
┌─────────────────────────────────────────────────────────────┐
│  Edit Draft Complaint                                       │
│  Continue editing your draft complaint. You can save your   │
│  changes or submit the complaint.                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ☐ Submit anonymously                                       │
│                                                             │
│  Title *                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WiFi connectivity issues in library                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                      38/200  │
│                                                             │
│  Category *                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Facilities                                    ▼     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Priority Level *                                           │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │ Low  │ │Medium│ │ High │ │Critic│                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│            ^^^^^^                                           │
│           (selected)                                        │
│                                                             │
│  Description *                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ The WiFi in the library keeps disconnecting every  │   │
│  │ few minutes. This makes it very difficult to       │   │
│  │ complete online assignments and research.          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Tags (Optional)                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Type to search tags...                              │   │
│  └─────────────────────────────────────────────────────┘   │
│  [wifi-issues ×] [library ×]                               │
│                                                             │
│  File Attachments (Optional)                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Drag and drop files here or click to browse       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                [Cancel] [Save as Draft] [Submit Complaint]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 5a: User Modifies and Saves as Draft
**User Actions**:
- Changes priority from "Medium" to "High"
- Adds tag "urgent"
- Clicks "Save as Draft"

**Result**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Draft Saved                                              │
│  Your draft has been updated successfully!                  │
└─────────────────────────────────────────────────────────────┘
```
**Navigation**: Redirects to `/complaints/drafts`

### Step 5b: User Completes and Submits
**User Actions**:
- Ensures all required fields are filled
- Clicks "Submit Complaint"

**Result**:
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Complaint Submitted                                      │
│  Your complaint has been submitted and will be reviewed by  │
│  our team.                                                  │
└─────────────────────────────────────────────────────────────┘
```
**Navigation**: Redirects to `/dashboard`

## Technical Flow Diagram

```
┌─────────────────┐
│  Drafts Page    │
│  /drafts        │
└────────┬────────┘
         │
         │ Click "Continue"
         │
         ▼
┌─────────────────────────────────────────┐
│  New Complaint Page                     │
│  /complaints/new?draft=draft-1          │
├─────────────────────────────────────────┤
│  1. Parse URL params                    │
│  2. Extract draftId                     │
│  3. Set loading state                   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Load Draft Data                        │
├─────────────────────────────────────────┤
│  • Fetch from mockDrafts[draftId]      │
│  • (Phase 12: Supabase query)          │
│  • Set initialData state               │
│  • Clear loading state                 │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Render ComplaintForm                   │
├─────────────────────────────────────────┤
│  • Pass initialData prop               │
│  • Pass isEditing={true}               │
│  • Form populates with draft data      │
└────────┬────────────────────────────────┘
         │
         │ User edits form
         │
         ▼
┌─────────────────────────────────────────┐
│  User Action                            │
└────┬────────────────────────────────┬───┘
     │                                │
     │ Save as Draft                  │ Submit
     │                                │
     ▼                                ▼
┌─────────────────┐          ┌─────────────────┐
│  Update Draft   │          │  Create         │
│  isDraft=true   │          │  Complaint      │
│                 │          │  isDraft=false  │
│  → /drafts      │          │  → /dashboard   │
└─────────────────┘          └─────────────────┘
```

## Code Flow

### 1. URL Detection
```typescript
const searchParams = useSearchParams();
const draftId = searchParams.get('draft'); // 'draft-1' or null
```

### 2. Draft Loading
```typescript
React.useEffect(() => {
  if (draftId) {
    // Load draft data
    const draftData = mockDrafts[draftId];
    if (draftData) {
      setInitialData(draftData);
    }
    setIsLoading(false);
  }
}, [draftId]);
```

### 3. Form Initialization
```typescript
<ComplaintForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  initialData={initialData}  // Pre-populated data
  isEditing={!!draftId}      // true when editing
/>
```

### 4. Submit Handler
```typescript
const handleSubmit = async (data, isDraft) => {
  if (draftId) {
    // Update existing draft
    console.log('Updating draft:', draftId);
  } else {
    // Create new draft/complaint
    console.log('Creating new:', data);
  }
  
  // Show appropriate success message
  const message = draftId && isDraft
    ? 'Your draft has been updated successfully!'
    : isDraft
    ? 'Your draft has been saved successfully!'
    : 'Your complaint has been submitted...';
};
```

## State Management

### Initial State (New Complaint)
```typescript
{
  title: '',
  description: '',
  category: '',
  priority: '',
  isAnonymous: false,
  tags: [],
  files: []
}
```

### Initial State (Editing Draft)
```typescript
{
  title: 'WiFi connectivity issues in library',
  description: '<p>The WiFi in the library keeps...</p>',
  category: 'facilities',
  priority: 'medium',
  isAnonymous: false,
  tags: ['wifi-issues', 'library'],
  files: []
}
```

## Validation Differences

### Saving as Draft (Update)
```typescript
// Lenient validation
if (isDraft) {
  // Only validate length if content exists
  if (title && title.length > 200) return false;
  if (description && getTextContent(description).length > 5000) return false;
  return true; // Allow partial completion
}
```

### Submitting Complaint
```typescript
// Strict validation
if (!isDraft) {
  if (!title.trim()) return false;
  if (!getTextContent(description).trim()) return false;
  if (!category) return false;
  if (!priority) return false;
  return true;
}
```

## Error Handling

### Draft Not Found
```
User clicks Continue on draft-999
→ Load attempt fails
→ Show error toast: "Draft not found"
→ Redirect to /complaints/new
```

### Network Error
```
User clicks Save as Draft
→ API call fails
→ Show error toast: "Failed to save draft. Please try again."
→ Stay on page, allow retry
```

### Validation Error
```
User clicks Submit with incomplete form
→ Validation fails
→ Show inline errors on fields
→ Scroll to first error
→ Stay on page
```

## Success Messages

| Scenario | Message |
|----------|---------|
| New draft created | "Your draft has been saved successfully!" |
| Existing draft updated | "Your draft has been updated successfully!" |
| Draft submitted as complaint | "Your complaint has been submitted and will be reviewed by our team." |

## Navigation Flow

```
/complaints/drafts
    ↓ (Click Continue)
/complaints/new?draft=draft-1
    ↓ (Save as Draft)
/complaints/drafts
    ↓ (Click Continue again)
/complaints/new?draft=draft-1
    ↓ (Submit Complaint)
/dashboard
```

## Key Features

✅ **URL-based draft identification** - Uses query parameter
✅ **Automatic data loading** - Fetches on mount
✅ **Form pre-population** - All fields filled from draft
✅ **Loading state** - Shows spinner while fetching
✅ **Error handling** - Graceful fallback for missing drafts
✅ **Contextual UI** - Different titles/descriptions for edit mode
✅ **Flexible validation** - Lenient for drafts, strict for submission
✅ **Smart navigation** - Returns to appropriate page after action
✅ **User feedback** - Clear success/error messages

## Mock Data Ready for Phase 12

Current implementation uses mock data that mirrors the database structure:

```typescript
const mockDrafts: Record<string, ComplaintFormData> = {
  'draft-1': { /* ... */ },
  'draft-2': { /* ... */ },
};
```

In Phase 12, replace with Supabase queries:

```typescript
// Load draft
const { data } = await supabase
  .from('complaints')
  .select('*')
  .eq('id', draftId)
  .eq('is_draft', true)
  .single();

// Update draft
await supabase
  .from('complaints')
  .update({ /* ... */ })
  .eq('id', draftId);
```

This ensures a smooth transition from mock to real data.
