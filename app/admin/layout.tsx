'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent scroll on body when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const handleMobileClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 w-full overflow-hidden">
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={handleMobileClose} 
      />
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
        <Topbar onMenuClick={toggleMenu} mobileMenuOpen={mobileMenuOpen} />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
