'use client';

import { useAuth } from '../context/AuthContext';

export default function Page() {
  const { user, loading, logout } = useAuth();

  // Show loading while user data is being fetched
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO Panel</h1>
              <p className="text-gray-600 mt-2">Xush kelibsiz, {user.name}</p>
              <p className="text-sm text-gray-500">Role: {user.role}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Chiqish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Jami sahifalar</h2>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">SEO ko'rsatkichlari</h2>
            <p className="text-3xl font-bold text-green-600">100%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
