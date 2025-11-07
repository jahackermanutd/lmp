'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Image,
  GitBranch,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/letters', label: 'Xatlar', icon: FileText },
  { href: '/admin/letterhead', label: 'Dizayn', icon: Image },
  { href: '/admin/workflow', label: 'Ish jarayoni', icon: GitBranch },
  { href: '/admin/reports', label: 'Hisobotlar', icon: BarChart3 },
  { href: '/admin/settings', label: 'Sozlamalar', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [pathname, isMobile, onMobileClose]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-gray-900 text-white transition-all duration-300 flex flex-col z-50',
          // Mobile styles
          'fixed lg:sticky top-0 h-screen',
          isMobile && !mobileOpen && '-translate-x-full',
          isMobile && mobileOpen && 'translate-x-0',
          // Desktop styles
          !isMobile && 'translate-x-0',
          collapsed && !isMobile ? 'w-20' : 'w-64'
        )}
      >
        {/* Mobile Close Button */}
        {isMobile && mobileOpen && (
          <button
            onClick={onMobileClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        )}

        {/* Logo */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold">XBS Admin</h1>
              <p className="text-xs text-gray-400">Xat Boshqaruv Tizimi</p>
            </div>
          )}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
            <p>© 2025 Xat Boshqaruv Tizimi</p>
            <p className="mt-1">Versiya 1.0.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
