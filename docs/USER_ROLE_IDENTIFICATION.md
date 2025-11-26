# User Role Identification Guide

## How to Access User Role

The `useAuth` hook provides the current user's role. Here's how to use it:

```typescript
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  // Access user role
  const role = user.role; // 'student' | 'lecturer' | 'admin'
  
  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Name: {user.full_name}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

## Role-Based Rendering

### Show/Hide Content Based on Role

```typescript
export function ComplaintActions() {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Students can only view */}
      {user?.role === 'student' && (
        <Button>View Details</Button>
      )}
      
      {/* Lecturers can assign and comment */}
      {user?.role === 'lecturer' && (
        <>
          <Button>Assign</Button>
          <Button>Add Comment</Button>
        </>
      )}
      
      {/* Admins can do everything */}
      {user?.role === 'admin' && (
        <>
          <Button>Assign</Button>
          <Button>Change Status</Button>
          <Button>Delete</Button>
        </>
      )}
    </div>
  );
}
```

### Multiple Roles

```typescript
// Check if user is lecturer OR admin
{(user?.role === 'lecturer' || user?.role === 'admin') && (
  <Button>Manage Complaint</Button>
)}

// Or use an array
{['lecturer', 'admin'].includes(user?.role || '') && (
  <Button>Manage Complaint</Button>
)}
```

## Role-Based Navigation

```typescript
export function Sidebar() {
  const { user } = useAuth();
  
  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Complaints', href: '/complaints' },
    ];
    
    if (user?.role === 'lecturer') {
      return [
        ...baseItems,
        { label: 'Assigned to Me', href: '/complaints/assigned' },
        { label: 'All Complaints', href: '/complaints/all' },
      ];
    }
    
    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { label: 'All Complaints', href: '/complaints/all' },
        { label: 'Analytics', href: '/analytics' },
        { label: 'Admin Panel', href: '/admin' },
      ];
    }
    
    return baseItems; // Student
  };
  
  return (
    <nav>
      {getNavItems().map(item => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

## Role-Based Page Protection

```typescript
// In a page component
export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);
  
  if (isLoading) return <div>Loading...</div>;
  if (user?.role !== 'admin') return null;
  
  return <div>Admin Content</div>;
}
```

## Available Roles

- **student**: Can submit complaints, view their own complaints, add comments
- **lecturer**: Can view all complaints, assign complaints, change status, add comments
- **admin**: Full access to all features including analytics, user management, system settings

## Test Users

From the database:
- `student@test.com` - Role: student
- `lecturer@test.com` - Role: lecturer  
- `admin@test.com` - Role: admin

All passwords: `password123`
