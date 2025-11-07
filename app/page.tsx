'use client';

import { useState, useEffect } from 'react';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from './context/AuthContext';
import Cookies from 'js-cookie';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const roleRoutes: Record<string, string> = {
        admin: '/admin',
        'office-manager': '/office-manager',
        seo: '/seo',
      };
      
      const redirectTo = roleRoutes[user.role] || '/admin';
      window.location.href = redirectTo;
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Clear any existing cookies before login
      Cookies.remove('token');
      
      await login(email, password);
      // Redirect will be handled by the login function in AuthContext
      // Don't set isLoading to false since we're redirecting away
    } catch (err: any) {
      setError(err.message || 'Kirish muvaffaqiyatsiz bo\'ldi');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#89CFF0] via-[#B0E0E6] to-[#E0F6FF] flex items-center justify-center p-4 font-primary">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
       

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 space-y-6 font-primary">
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-full p-4">
              <MdPerson size={32} className="text-gray-700" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 font-primary">Tizimga kirish</h1>
            <p className="text-gray-600 text-sm font-secondary">
              Elektron xatlar boshqaruvi tizimi
            </p>
          </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-primary">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Demo credentials info */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-xs">
                <p className="font-semibold mb-1">Demo hisoblar:</p>
                <p>Admin: admin@ebolt.uz / admin123</p>
                <p>Office: office@ebolt.uz / office123</p>
                <p>SEO: seo@ebolt.uz / seo123</p>
              </div>

              <div className="font-primary">
                <div className="relative flex items-center">
                  <MdEmail className="absolute left-3 text-gray-400 pointer-events-none z-10" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Elektron pochta"
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-primary"
                  />
                </div>
                {email && !email.includes('@') && (
                  <p className="text-red-500 text-sm mt-2 transition-all duration-300 ease-in-out">Elektron pochta misol@misol.uz ko'rinishida bo'lishi kerak</p>
                )}
              </div>

              <div className="relative font-primary flex items-center">
                <MdLock className="absolute left-3 text-gray-400 pointer-events-none z-10" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Maxfiy so'z"
                  className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 font-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors duration-300 focus:outline-none z-10 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <MdVisibility size={20} />
                  ) : (
                    <MdVisibilityOff size={20} />
                  )}
                </button>
              </div>

                <button
                type="submit"
                disabled={!email || !password || isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 font-primary cursor-pointer"
                >
                {isLoading ? 'Tekshirilmoqda...' : 'Kirish'}
                </button>
              </form>
            </div>
            </div>
          </div>
          );
        }
