'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const authenticated = Boolean(token);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(authenticated);
    if (!authenticated && !pathname.includes('/admin/login')) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const login = (token: string) => {
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
    router.push('/admin');
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  return { isAuthenticated, login, logout };
}
