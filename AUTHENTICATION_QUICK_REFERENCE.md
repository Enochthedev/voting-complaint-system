# Authentication Quick Reference

## ✅ Task 2.1 Complete: Email/Password Authentication

Email/password authentication is fully implemented and ready to use!

## 🚀 Quick Start

### 1. Verify Configuration
```bash
cd student-complaint-system
node scripts/configure-auth.js
```

### 2. Apply Database Fix (If Needed)
If you see "Database error saving new user" when testing:

```bash
node scripts/apply-auth-fix.js
```

Copy the SQL output and run it in **Supabase Dashboard > SQL Editor**

### 3. Test Authentication
```bash
node scripts/test-email-auth.js
```

### 4. Configure Supabase Dashboard

Go to your Supabase Dashboard:

**Authentication > Providers > Email**
- ✅ Enabled (default)
- ⚠️ **Disable "Confirm email"** for development

**Authentication > URL Configuration**
- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset-password`

## 📚 Documentation

- **Complete Setup Guide**: `docs/EMAIL_PASSWORD_AUTH_SETUP.md`
- **Configuration Guide**: `docs/AUTH_CONFIGURATION.md`
- **Quick Start Guide**: `docs/AUTH_QUICK_START.md`
- **Completion Summary**: `docs/TASK_2.1_EMAIL_AUTH_COMPLETION.md`

## 🔧 Available Functions

### Client-Side (`src/lib/auth.ts`)
```typescript
import { signUp, signIn, signOut, getCurrentUser, getUserRole } from '@/lib/auth';

// Sign up
const { user, error } = await signUp(email, password, fullName, role);

// Sign in
const { user, error } = await signIn(email, password);

// Sign out
await signOut();

// Get current user
const user = await getCurrentUser();

// Get user role
const role = await getUserRole(); // 'student' | 'lecturer' | 'admin'

// Check role
const isLecturer = await isLecturer();
```

### Server-Side (`src/lib/auth-server.ts`)
```typescript
import { requireAuthServer, requireRoleServer } from '@/lib/auth-server';

// Require authentication
const user = await requireAuthServer(); // Throws if not authenticated

// Require specific role
const lecturer = await requireRoleServer('lecturer'); // Throws if not lecturer
```

## 🎯 What's Implemented

- ✅ User sign up with email/password
- ✅ User sign in
- ✅ User sign out
- ✅ Password reset
- ✅ Password validation (8+ chars, uppercase, lowercase, number)
- ✅ Email validation
- ✅ Role-based access control (student, lecturer, admin)
- ✅ Session management with auto-refresh
- ✅ Server-side and client-side helpers
- ✅ Comprehensive testing scripts
- ✅ Complete documentation

## 🔐 User Roles

- **student** - Can submit and view own complaints
- **lecturer** - Can manage complaints, create votes/announcements
- **admin** - Full system access including escalation rules

## ⚠️ Troubleshooting

### "Database error saving new user"
→ Apply the trigger fix (see step 2 above)

### "Email not confirmed"
→ Disable email confirmation in Supabase Dashboard (for development)

### Session not persisting
→ Check that `NEXT_PUBLIC_APP_URL` is set correctly in `.env.local`

## 📋 Next Tasks

- **Task 2.2**: Implement Row Level Security Policies
- **Task 2.3**: Create Authentication Pages (login, register, password reset)

## 🧪 Testing Checklist

- [ ] Configuration verified (`node scripts/configure-auth.js`)
- [ ] Trigger fix applied (if needed)
- [ ] Authentication tests pass (`node scripts/test-email-auth.js`)
- [ ] Supabase Dashboard configured
- [ ] Manual sign up test successful
- [ ] Manual sign in test successful

## 💡 Tips

- Use `student` role for testing complaint submission
- Use `lecturer` role for testing complaint management
- Keep email confirmation disabled during development
- Enable email confirmation in production

---

**Status**: ✅ Ready to use  
**Next**: Implement authentication pages (Task 2.3)
