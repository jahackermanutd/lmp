import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    console.log('[API Login] JWT token created');

    // Create response with token in cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        token
      },
      { status: 200 }
    );

    // Set cookie (not HTTP-only so js-cookie can read it)
    // Still secure with sameSite protection
    response.cookies.set('token', token, {
      httpOnly: false, // Allow JavaScript to read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log('[API Login] Cookie set, returning response');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server xatosi' },
      { status: 500 }
    );
  }
}
