'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Map, BookOpen, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    tours: 0,
    posts: 0,
    contacts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats({
          tours: Number(res.data?.tours || 0),
          posts: Number(res.data?.posts || 0),
          contacts: Number(res.data?.contacts || 0)
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { name: 'Tours', value: stats.tours, icon: Map, color: 'bg-blue-600', href: '/admin/tours' },
    { name: 'Blog Posts', value: stats.posts, icon: BookOpen, color: 'bg-sky-500', href: '/admin/blog' },
    { name: 'Contacts', value: stats.contacts, icon: MessageSquare, color: 'bg-amber-500', href: '/admin/contacts' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8 tracking-wide">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {cards.map((card) => (
          <Link key={card.name} href={card.href} prefetch={false} className="admin-panel p-6 flex items-center gap-6">
            <div className={`${card.color} p-4 rounded-lg text-white`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{card.name}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-panel p-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/tours?action=new" prefetch={false} className="btn-primary px-6 py-2">
            Publish New Tour
          </Link>
          <Link href="/admin/blog?action=new" prefetch={false} className="btn-primary px-6 py-2">
            Write Blog Post
          </Link>
          <Link href="/admin/settings" prefetch={false} className="btn-secondary px-6 py-2">
            Update Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
