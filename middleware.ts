import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin': ['admin'],
  '/office-manager': ['office-manager'],
  '/seo': ['seo'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Checking path:', pathname);

  // Check if the current path is a protected route
  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    // Not a protected route, allow access
    console.log('[Middleware] Not a protected route, allowing');
    return NextResponse.next();
  }

  console.log('[Middleware] Protected route detected:', matchedRoute);

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // No token, redirect to login
    console.log('[Middleware] No token found, redirecting to /');
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log('[Middleware] Token found, verifying...');

  try {
    // Verify and decode token using jose (Edge Runtime compatible)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    console.log('[Middleware] Token verified, user role:', payload.role);

    // Check if user has the required role
    const requiredRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
    if (!requiredRoles.includes(payload.role as string)) {
      // User doesn't have the required role, redirect to login
      console.log('[Middleware] Role mismatch. Required:', requiredRoles, 'Got:', payload.role);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // User is authenticated and has the required role
    console.log('[Middleware] Access granted');
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Auth error:', error);
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/admin/:path*', '/office-manager/:path*', '/seo/:path*'],
};
