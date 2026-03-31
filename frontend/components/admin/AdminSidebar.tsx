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
  UserRound,
  Sparkles,
  Images,
  PanelLeftClose,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Tours', icon: Map, href: '/admin/tours' },
  { name: 'Blog', icon: BookOpen, href: '/admin/blog' },
  { name: 'Carousels', icon: Images, href: '/admin/carousels' },
  { name: 'Reviews', icon: MessageSquare, href: '/admin/reviews' },
  { name: 'Contacts', icon: MessageSquare, href: '/admin/contacts' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="admin-sidebar w-[88px] text-white md:w-[288px]">
      <div className="relative z-10 flex h-full flex-col">
        <div className="border-b border-white/10 px-4 py-5 md:px-6 md:py-6">
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/14 text-sky-200 ring-1 ring-sky-300/18">
              <UserRound size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-[0.08em] text-white">Janet Admin</h1>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-300">Content Control Room</p>
            </div>
          </div>
          <div className="flex justify-center md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/14 text-sky-200 ring-1 ring-sky-300/18">
              <PanelLeftClose size={20} />
            </div>
          </div>
          <p className="mt-4 hidden items-center gap-1 text-xs text-slate-300 md:flex">
            <Sparkles size={12} />
            Unified dashboard workspace
          </p>
        </div>

        <nav className="relative z-10 flex-1 space-y-2 px-3 py-4 md:px-4 md:py-5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                className={`admin-sidebar-link flex items-center justify-center gap-3 rounded-2xl px-4 py-3 text-slate-100 md:justify-start ${
                  isActive ? 'admin-sidebar-link-active' : ''
                }`}
              >
                <item.icon size={19} className="relative z-10 shrink-0" />
                <span className="relative z-10 hidden text-sm font-semibold tracking-[0.08em] md:inline">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 border-t border-white/10 p-3 md:p-4">
          <button
            type="button"
            onClick={logout}
            className="admin-sidebar-link flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-3 text-slate-100 md:justify-start"
          >
            <LogOut size={19} />
            <span className="hidden text-sm font-semibold tracking-[0.08em] md:inline">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
