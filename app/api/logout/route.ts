import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/refresh',
    maxAge: 0,
  });

  return response;
}
