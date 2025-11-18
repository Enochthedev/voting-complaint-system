# Frontend Libraries

This project uses modern UI libraries for a polished user experience:

## Installed Libraries

### UI Components & Styling
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui utilities** - Component utilities (cn helper)
- **Radix UI** - Headless UI primitives for accessibility
- **Lucide React** - Beautiful icon library
- **class-variance-authority (CVA)** - Type-safe component variants
- **clsx & tailwind-merge** - Conditional className utilities

### Avatar Generation
- **DiceBear** - Avatar generation library
  - `@dicebear/core` - Core library
  - `@dicebear/collection` - Avatar style collections

## Usage Examples

### Avatar with DiceBear
```tsx
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';

const avatar = createAvatar(initials, {
  seed: 'John Doe',
  // customize options
});

const svg = avatar.toString();
```

### shadcn-style Components
```tsx
import { cn } from '@/lib/utils';

export function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md bg-primary text-white",
        className
      )}
      {...props}
    />
  );
}
```

### Icons with Lucide
```tsx
import { User, Bell, Settings } from 'lucide-react';

<User className="w-5 h-5" />
<Bell className="w-5 h-5" />
<Settings className="w-5 h-5" />
```

## Next Steps

1. Create UI components in `src/components/ui/`
2. Use DiceBear for user avatars
3. Implement shadcn-style component patterns
4. Add Lucide icons throughout the app
