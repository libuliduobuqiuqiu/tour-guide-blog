'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Images,
  Mail,
  Map,
  MessageSquare,
  Settings,
  Sparkles,
  Star,
} from 'lucide-react';

interface DashboardStats {
  tours: number;
  posts: number;
  contacts: number;
}

interface ReviewLite {
  id: number;
  username: string;
  is_active: boolean;
  review_date: string | null;
}

interface ContactLite {
  id: number;
  name: string;
  subject: string;
  created_at: string;
}

interface CarouselLite {
  id: number;
  title: string;
  is_active: boolean;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ tours: 0, posts: 0, contacts: 0 });
  const [reviews, setReviews] = useState<ReviewLite[]>([]);
  const [contacts, setContacts] = useState<ContactLite[]>([]);
  const [carousels, setCarousels] = useState<CarouselLite[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, reviewsRes, contactsRes, carouselsRes] = await Promise.all([
          api.get('/api/admin/stats').catch(() => null),
          api.get('/api/admin/reviews').catch(() => null),
          api.get('/api/admin/contacts').catch(() => null),
          api.get('/api/admin/carousels').catch(() => null),
        ]);

        setStats({
          tours: Number(statsRes?.data?.tours || 0),
          posts: Number(statsRes?.data?.posts || 0),
          contacts: Number(statsRes?.data?.contacts || 0),
        });

        const reviewPayload = reviewsRes?.data;
        const reviewList = Array.isArray(reviewPayload)
          ? reviewPayload
          : Array.isArray(reviewPayload?.data)
            ? reviewPayload.data
            : [];
        setReviews(reviewList);

        const contactsPayload = contactsRes?.data;
        setContacts(Array.isArray(contactsPayload) ? contactsPayload : []);

        const carouselsPayload = carouselsRes?.data;
        const carouselList = Array.isArray(carouselsPayload)
          ? carouselsPayload
          : Array.isArray(carouselsPayload?.data)
            ? carouselsPayload.data
            : [];
        setCarousels(carouselList);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingReviews = useMemo(() => reviews.filter((item) => !item.is_active), [reviews]);
  const activeCarousels = useMemo(() => carousels.filter((item) => item.is_active), [carousels]);
  const latestContacts = useMemo(() => contacts.slice(0, 5), [contacts]);

  const cards = [
    { name: 'Tours', value: stats.tours, icon: Map, href: '/admin/tours', tone: 'from-blue-600 to-sky-500' },
    { name: 'Blog Posts', value: stats.posts, icon: BookOpen, href: '/admin/blog', tone: 'from-slate-800 to-slate-600' },
    { name: 'Contacts', value: stats.contacts, icon: Mail, href: '/admin/contacts', tone: 'from-amber-500 to-orange-500' },
    { name: 'Pending Reviews', value: pendingReviews.length, icon: MessageSquare, href: '/admin/reviews', tone: 'from-emerald-600 to-teal-500' },
  ];

  const managementSignals = [
    {
      label: 'Homepage hero readiness',
      value: `${activeCarousels.length}/${Math.max(carousels.length, 1)} active`,
      state: activeCarousels.length > 0 ? 'healthy' : 'attention',
      tip: activeCarousels.length > 0 ? 'Homepage hero is ready for display.' : 'Enable at least one carousel for the homepage hero.',
    },
    {
      label: 'Review moderation',
      value: `${pendingReviews.length} pending`,
      state: pendingReviews.length === 0 ? 'healthy' : 'attention',
      tip: pendingReviews.length === 0 ? 'No reviews waiting for approval.' : 'There are reviews waiting to be reviewed and published.',
    },
    {
      label: 'Content coverage',
      value: `${stats.tours + stats.posts} published items`,
      state: stats.tours + stats.posts >= 6 ? 'healthy' : 'attention',
      tip: stats.tours + stats.posts >= 6 ? 'Core content inventory looks stable.' : 'Consider adding more tours or stories to strengthen discovery pages.',
    },
  ];

  return (
    <div className="fade-up space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
            <Sparkles size={14} />
            Admin dashboard
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-wide text-slate-950">Operations overview</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            Centralize content publishing, review moderation, homepage curation, and message follow-up from one workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/tours?action=new" prefetch={false} className="btn-primary px-5 py-2.5">
            Publish New Tour
          </Link>
          <Link href="/admin/blog?action=new" prefetch={false} className="btn-secondary px-5 py-2.5">
            Write Blog Post
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.name} href={card.href} prefetch={false} className="admin-kpi-card group p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.name}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${card.tone} p-3 text-white shadow-lg`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition group-hover:text-slate-950">
              Open panel
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="admin-panel p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Management signals</h2>
              <p className="mt-2 text-sm text-slate-500">These signals help you judge whether the site is ready to present and respond.</p>
            </div>
            <Link href="/admin/settings" prefetch={false} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Settings size={16} />
              Settings
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {managementSignals.map((signal) => (
              <div key={signal.label} className="rounded-[1.1rem] border border-slate-200 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{signal.label}</div>
                    <div className="mt-1 text-sm text-slate-500">{signal.tip}</div>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${signal.state === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {signal.state === 'healthy' ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
                    {signal.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/admin/reviews" prefetch={false} className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <div className="inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <Star size={18} />
              </div>
              <div className="mt-4 text-base font-semibold text-slate-900">Review moderation</div>
              <p className="mt-2 text-sm text-slate-500">Approve, edit, and prioritize testimonials shown on the site.</p>
            </Link>
            <Link href="/admin/carousels" prefetch={false} className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <div className="inline-flex rounded-xl bg-blue-100 p-2 text-blue-700">
                <Images size={18} />
              </div>
              <div className="mt-4 text-base font-semibold text-slate-900">Homepage curation</div>
              <p className="mt-2 text-sm text-slate-500">Reorder hero content and ensure the primary banner stays aligned with campaigns.</p>
            </Link>
            <Link href="/admin/contacts" prefetch={false} className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white">
              <div className="inline-flex rounded-xl bg-amber-100 p-2 text-amber-700">
                <Mail size={18} />
              </div>
              <div className="mt-4 text-base font-semibold text-slate-900">Lead follow-up</div>
              <p className="mt-2 text-sm text-slate-500">Check incoming demand and clear messages that have already been handled.</p>
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <div className="admin-panel p-6 md:p-7">
            <h2 className="text-xl font-semibold text-slate-950">Latest contacts</h2>
            <p className="mt-2 text-sm text-slate-500">Recent inquiries worth following up on quickly.</p>
            <div className="mt-5 space-y-3">
              {latestContacts.length > 0 ? (
                latestContacts.map((contact) => (
                  <div key={contact.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">{contact.name}</div>
                      <div className="text-xs text-slate-400">#{contact.id}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{contact.subject || 'No subject'}</div>
                    <div className="mt-2 text-xs text-slate-400">{formatDate(contact.created_at)}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1rem] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No contact messages yet.
                </div>
              )}
            </div>
          </div>

          <div className="admin-panel p-6 md:p-7">
            <h2 className="text-xl font-semibold text-slate-950">Pending review queue</h2>
            <p className="mt-2 text-sm text-slate-500">Testimonials waiting for moderation or polishing.</p>
            <div className="mt-5 space-y-3">
              {pendingReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">{review.username}</div>
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                      Pending
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">{review.review_date ? review.review_date.slice(0, 10) : 'No date'}</div>
                </div>
              ))}
              {pendingReviews.length === 0 && (
                <div className="rounded-[1rem] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No pending reviews.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
