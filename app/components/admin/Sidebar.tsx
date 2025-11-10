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

  // Close mobile menu on route change
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [pathname, onMobileClose]);

  return (
    <>
      {/* Mobile Overlay - Always render on mobile when open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-gray-900 text-white transition-all duration-300 flex flex-col',
          // Mobile styles - fixed positioning
          'fixed inset-y-0 left-0 z-50 lg:sticky lg:inset-auto lg:top-0',
          'min-h-screen lg:h-auto lg:min-h-full lg:self-stretch',
          // Transform for mobile slide animation - always respond to mobileOpen prop
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Width management
          collapsed ? 'w-20' : 'w-64',
          // Prevent text selection during transition
          'select-none lg:select-auto'
        )}
        aria-label="Navigation sidebar"
      >
        {/* Mobile Close Button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors lg:hidden z-10"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}

        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-gray-800 flex items-center justify-between">
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">XBS Admin</h1>
              <p className="text-xs text-gray-400 truncate">Xat Boshqaruv Tizimi</p>
            </div>
          )}
          {/* Hide collapse button on mobile */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0 items-center justify-center"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto" role="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors',
                  'touch-manipulation', // Better touch targets on mobile
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 sm:p-4 border-t border-gray-800 text-xs text-gray-400">
            <p className="truncate">© 2025 Xat Boshqaruv Tizimi</p>
            <p className="mt-1 truncate">Versiya 1.0.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
