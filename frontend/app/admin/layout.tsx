'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useAuth
  }

  return (
    <div className="admin-shell flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="max-w-6xl mx-auto fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
