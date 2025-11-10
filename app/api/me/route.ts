import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('[API /me] Request received');
    // Get token from cookie
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      console.log('[API /me] No token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API /me] Token found, verifying...');
    // Verify token
    const decoded = verifyToken<{
      id: string;
      email: string;
      role: string;
      name: string;
      type: string;
    }>(token);

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    console.log('[API /me] Token verified, user:', decoded.email);
    // Return user data
    return NextResponse.json(
      {
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /me] Auth verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
