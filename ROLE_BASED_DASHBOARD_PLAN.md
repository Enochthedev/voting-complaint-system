# Role-Based Dashboard Implementation Plan

## Current Situation
- ✅ Sidebar navigation is role-aware
- ✅ Middleware protects routes by role
- ✅ Auth session now works correctly with cookies
- ❌ Dashboard shows same content for all roles

## What Each Role Should See

### Student Dashboard
**Focus**: Personal complaint management
- Stats: My complaints (total, pending, resolved)
- Recent complaints (my submissions)
- Draft complaints
- Announcements
- Quick actions: Submit complaint, use template, view drafts

### Lecturer Dashboard  
**Focus**: Complaint management and oversight
- Stats: All complaints, assigned to me, pending review, resolved today
- Assigned complaints (priority view)
- Recent complaints (all)
- Analytics preview (charts)
- Quick actions: Review complaints, create template, view analytics
- Announcements management

### Admin Dashboard
**Focus**: System overview and management
- Stats: Total users, total complaints, system health, active lecturers
- Recent activity (all complaints)
- User management preview
- System analytics
- Quick actions: Manage users, view analytics, create announcement
- Admin tools access

## Implementation Approach

### Option 1: Conditional Rendering (Recommended)
```typescript
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  const { user } = useAuth();
  
  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }
  
  if (user.role === 'lecturer') {
    return <LecturerDashboard user={user} />;
  }
  
  return <StudentDashboard user={user} />;
}
```

**Pros:**
- Single route `/dashboard`
- Easy to maintain
- Consistent URL structure
- Sidebar already points to `/dashboard`

**Cons:**
- Larger bundle size (loads all dashboard variants)

### Option 2: Separate Routes
```
/dashboard/student
/dashboard/lecturer
/dashboard/admin
```

**Pros:**
- Code splitting (smaller bundles)
- Clear separation

**Cons:**
- Need to update sidebar links
- Need to update middleware
- More complex routing logic

## Recommended: Option 1 with Component Extraction

### File Structure
```
src/app/dashboard/
├── page.tsx                    # Main router
├── components/
│   ├── student-dashboard.tsx   # Student view
│   ├── lecturer-dashboard.tsx  # Lecturer view
│   └── admin-dashboard.tsx     # Admin view
```

## Navigation Flow

1. User logs in → middleware verifies session
2. User clicks "Dashboard" in sidebar → `/dashboard`
3. Dashboard page checks `user.role`
4. Renders appropriate dashboard component
5. Each component shows role-specific:
   - Stats
   - Actions
   - Content
   - Quick links

## What Students Can't See
- User management
- System analytics (only their own stats)
- All complaints (only their own)
- Template management
- Assignment features

## What Lecturers Can See (Extra)
- All complaints
- Assignment features
- Analytics for all complaints
- Template management
- Announcement creation

## What Admins Can See (Extra)
- Everything lecturers see, plus:
- User management
- System-wide analytics
- All admin tools
- Escalation rules management

## Next Steps
1. Create three dashboard components
2. Update main dashboard page with conditional rendering
3. Create role-specific API endpoints for stats
4. Test each role's view
5. Ensure middleware protection works
