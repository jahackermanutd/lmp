# Authentication System Documentation

## Overview
This project implements a complete JWT-based authentication system with role-based access control (RBAC) for the Ebolt application.

## Features
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Office Manager, SEO)
- ✅ Protected routes with middleware
- ✅ Persistent sessions with HTTP-only cookies
- ✅ Client-side and server-side route protection
- ✅ Mock user database (ready for Supabase integration)

## Architecture

### Authentication Flow
1. User submits credentials via login form
2. `/api/login` verifies credentials against mock database
3. Server generates JWT token containing user data
4. Token is stored in HTTP-only cookie and returned to client
5. Client redirects user based on role
6. Middleware validates token on protected routes
7. Client-side auth context manages user state

### Mock Users
```
Admin:
  Email: admin@ebolt.uz
  Password: admin123
  Role: admin
  Redirects to: /admin

Office Manager:
  Email: office@ebolt.uz
  Password: office123
  Role: office-manager
  Redirects to: /office-manager

SEO Specialist:
  Email: seo@ebolt.uz
  Password: seo123
  Role: seo
  Redirects to: /seo
```

## File Structure

### API Routes
- `/app/api/login/route.ts` - Handles user authentication
- `/app/api/logout/route.ts` - Clears authentication cookies
- `/app/api/me/route.ts` - Verifies and returns current user data

### Client Components
- `/app/context/AuthContext.tsx` - React context for auth state management
- `/app/page.tsx` - Login page with authentication form
- `/app/admin/page.tsx` - Admin dashboard (protected)
- `/app/office-manager/page.tsx` - Office manager dashboard (protected)
- `/app/seo/page.tsx` - SEO dashboard (protected)

### Middleware
- `/middleware.ts` - Server-side route protection

### Configuration
- `/.env.local` - Environment variables (JWT_SECRET)

## Security Features

### Token Storage
- Tokens stored in HTTP-only cookies (prevents XSS attacks)
- SameSite=Lax cookie policy
- Secure flag in production
- 7-day token expiration

### Route Protection
**Server-side (Middleware)**
- Validates JWT token on every request to protected routes
- Checks user role matches required role for route
- Redirects unauthorized users to login page

**Client-side (React)**
- `useAuth` hook provides user state
- Protected pages check authentication status
- Role verification in `useEffect`
- Loading states during authentication checks

## Usage

### Using the Auth Context
```tsx
'use client';

import { useAuth } from './context/AuthContext';

export default function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting a Route
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'required-role')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return <div>Protected Content</div>;
}
```

## Environment Variables

Required in `.env.local`:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

**⚠️ Important**: Change the JWT_SECRET to a strong random string in production!

## Future Integration: Supabase

To connect to Supabase, update `/app/api/login/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Query Supabase
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Verify password (use bcrypt in production)
  // Generate JWT as before...
}
```

## Development

### Running the Application
```bash
pnpm install
pnpm dev
```

### Testing Authentication
1. Visit `http://localhost:3000`
2. Use demo credentials to login
3. Verify redirect to appropriate dashboard
4. Test logout functionality
5. Try accessing protected routes directly (should redirect to login)

## Dependencies
- `jsonwebtoken` - JWT creation and verification
- `@types/jsonwebtoken` - TypeScript types for jsonwebtoken
- `js-cookie` - Client-side cookie management
- `@types/js-cookie` - TypeScript types for js-cookie

## Security Best Practices
✅ JWT secret stored in environment variables
✅ HTTP-only cookies prevent XSS attacks
✅ Server-side and client-side validation
✅ Token expiration (7 days)
✅ Role-based access control
✅ Secure cookie flag in production
✅ SameSite cookie policy

## Notes
- Current implementation uses mock data
- Passwords are stored in plain text (for demo only)
- When integrating with Supabase, use proper password hashing (bcrypt/argon2)
- Consider implementing refresh tokens for better security
- Add password reset functionality as needed
