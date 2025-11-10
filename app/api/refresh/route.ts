import { NextRequest, NextResponse } from 'next/server';
import { attachAuthCookies, createAccessToken, createRefreshToken, verifyToken } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });
    }

    const payload = verifyToken<{
      id: string;
      email: string;
      role: string;
      name: string;
      type: string;
    }>(refreshToken);

    if (payload.type !== 'refresh') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
    }

    const user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    const response = NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );

    attachAuthCookies(response, newAccessToken, newRefreshToken);
    return response;
  } catch (error) {
    console.error('[API Refresh] Error refreshing token:', error);
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
