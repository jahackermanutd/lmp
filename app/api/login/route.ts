import { NextRequest, NextResponse } from 'next/server';
import { attachAuthCookies, createAccessToken, createRefreshToken } from '@/app/lib/auth';

// Mock user database
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@ebolt.uz',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'office@ebolt.uz',
    password: 'office123',
    role: 'office-manager',
    name: 'Office Manager'
  },
  {
    id: '3',
    email: 'seo@ebolt.uz',
    password: 'seo123',
    role: 'seo',
    name: 'SEO Specialist'
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('[API Login] Request received');
    const { email, password } = await request.json();
    console.log('[API Login] Email:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email va parol talab qilinadi' },
        { status: 400 }
      );
    }

    // Find user in mock database
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      console.log('[API Login] User not found');
      return NextResponse.json(
        { error: 'Noto\'g\'ri email yoki parol' },
        { status: 401 }
      );
    }

    console.log('[API Login] User found:', user.email, 'Role:', user.role);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    console.log('[API Login] Tokens created');

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      },
      { status: 200 }
    );

    attachAuthCookies(response, accessToken, refreshToken);

    console.log('[API Login] Cookies set, returning response');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server xatosi' },
      { status: 500 }
    );
  }
}
