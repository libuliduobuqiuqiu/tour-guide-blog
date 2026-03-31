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
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
