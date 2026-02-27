'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Settings,
  MessageSquare,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Tours', icon: Map, href: '/admin/tours' },
  { name: 'Blog', icon: BookOpen, href: '/admin/blog' },
  { name: 'Carousels', icon: BookOpen, href: '/admin/carousels' },
  { name: 'Reviews', icon: MessageSquare, href: '/admin/reviews' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
  { name: 'Contacts', icon: MessageSquare, href: '/admin/contacts' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-20 md:w-64 text-white flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 shadow-2xl">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-semibold tracking-wide items-center gap-2 hidden md:flex">
          <User className="text-sky-400" />
          Janet Admin
        </h1>
        <p className="text-xs text-slate-400 mt-2 items-center gap-1 hidden md:flex">
          <Sparkles size={12} />
          Dashboard Workspace
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium hidden md:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-white/10 hover:text-white rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium hidden md:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}
