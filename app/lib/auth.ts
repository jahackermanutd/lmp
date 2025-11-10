import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

type UserPayload = {
  id: string;
  email: string;
  role: string;
  name: string;
};

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return secret;
}

export function createAccessToken(user: UserPayload) {
  return jwt.sign(
    { ...user, type: 'access' },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

export function createRefreshToken(user: UserPayload & { tokenVersion?: number }) {
  return jwt.sign(
    { ...user, type: 'refresh', tokenVersion: user.tokenVersion ?? 0 },
    getJwtSecret(),
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

export function verifyToken<T extends object = UserPayload & { type: string }>(token: string) {
  return jwt.verify(token, getJwtSecret()) as T;
}

export function attachAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/refresh',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
