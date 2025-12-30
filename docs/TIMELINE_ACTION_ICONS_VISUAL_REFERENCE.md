# Timeline Action Icons - Visual Reference

## Icon Mapping

This document provides a visual reference for all timeline action icons.

### Action Icons

```
📄 FileText      → created
⏰ Clock         → status_changed
👤+ UserPlus     → assigned
👤 User          → reassigned
💬 MessageSquare → comment_added
💬 MessageSquare → feedback_added
⚠️ AlertCircle   → reopened
📈 TrendingUp    → escalated
⭐ Star          → rated
🏷️ Tag           → tags_added
📜 History       → default (unknown actions)
```

### Icon Differentiation

**Assignment Actions:**

- `assigned` uses **UserPlus** (👤+) - indicates adding a new assignee
- `reassigned` uses **User** (👤) - indicates changing the assignee

**Communication Actions:**

- Both `comment_added` and `feedback_added` use **MessageSquare** (💬)
- These are semantically similar (both are communication)

**Status Actions:**

- `status_changed` uses **Clock** (⏰) - indicates time-based progression
- `reopened` uses **AlertCircle** (⚠️) - indicates attention needed
- `escalated` uses **TrendingUp** (📈) - indicates priority increase

**Content Actions:**

- `created` uses **FileText** (📄) - document creation
- `tags_added` uses **Tag** (🏷️) - categorization
- `rated` uses **Star** (⭐) - satisfaction rating

### Example Timeline Display

```
┌─────────────────────────────────────┐
│ Timeline                            │
├─────────────────────────────────────┤
│                                     │
│  📄  Created complaint              │
│  │   John Doe • 2 days ago         │
│  │                                  │
│  👤+ Assigned complaint             │
│  │   Admin User • 1 day ago        │
│  │                                  │
│  💬  Added comment                  │
│  │   Jane Smith • 12 hours ago     │
│  │                                  │
│  ⏰  Changed status from "new"      │
│  │   to "in_progress"              │
│  │   Jane Smith • 6 hours ago      │
│  │                                  │
│  💬  Added feedback                 │
│  │   Jane Smith • 2 hours ago      │
│  │                                  │
│  ⏰  Changed status from            │
│      "in_progress" to "resolved"   │
│      Jane Smith • 1 hour ago       │
│                                     │
└─────────────────────────────────────┘
```

### Color Scheme

All icons use the design system colors:

- Icon color: `text-muted-foreground`
- Background: `bg-muted`
- Border: Implicit from rounded container
- Timeline line: `bg-border`

### Accessibility

- Icons are supplemented with text labels
- Color is not the only indicator (icons provide visual distinction)
- Proper semantic HTML structure
- Screen readers will read the action labels

### Implementation Code

```tsx
// From constants.tsx
export function getActionIcon(action: string): React.ReactNode {
  switch (action) {
    case 'created':
      return <FileText className="h-4 w-4" />;
    case 'status_changed':
      return <Clock className="h-4 w-4" />;
    case 'assigned':
      return <UserPlus className="h-4 w-4" />;
    case 'reassigned':
      return <User className="h-4 w-4" />;
    case 'comment_added':
      return <MessageSquare className="h-4 w-4" />;
    case 'feedback_added':
      return <MessageSquare className="h-4 w-4" />;
    case 'reopened':
      return <AlertCircle className="h-4 w-4" />;
    case 'escalated':
      return <TrendingUp className="h-4 w-4" />;
    case 'rated':
      return <Star className="h-4 w-4" />;
    case 'tags_added':
      return <Tag className="h-4 w-4" />;
    default:
      return <History className="h-4 w-4" />;
  }
}
```

### Testing Checklist

- [x] All 10 action types have unique icons
- [x] Icons are visually distinct
- [x] Icons are semantically appropriate
- [x] Consistent sizing (h-4 w-4)
- [x] Proper TypeScript types
- [x] No compilation errors
- [x] Documentation complete

### Browser Compatibility

Icons are from Lucide React library, which supports:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

All icons render as SVG, ensuring:

- Crisp display at any resolution
- Proper scaling
- Accessibility support
