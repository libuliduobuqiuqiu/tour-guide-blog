'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import AdminModal from '@/components/admin/AdminModal';
import { withPublicOrigin } from '@/lib/url';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleAlert,
  Images,
  Mail,
  Map,
  MessageSquare,
  Settings,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';

interface DashboardStats {
  tours: number;
  posts: number;
  contacts: number;
}

interface ReviewLite {
  id: number;
  username: string;
  country: string;
  review_date: string | null;
  tour_route: string;
  host: string;
  content: string;
  avatar: string;
  photos: string[];
  rating: number;
  sort_order: number;
  is_active: boolean;
  show_on_dashboard: boolean;
  created_at: string;
  updated_at: string;
}

interface ContactLite {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  show_on_dashboard: boolean;
  created_at: string;
}

interface CarouselLite {
  id: number;
  title: string;
  is_active: boolean;
}

const DASHBOARD_QUEUE_MAX_HEIGHT = 'max-h-[20.5rem]';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
}

function toDateInput(value: string | null | undefined) {
  if (!value) return '';
  return value.slice(0, 10);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ tours: 0, posts: 0, contacts: 0 });
  const [reviews, setReviews] = useState<ReviewLite[]>([]);
  const [contacts, setContacts] = useState<ContactLite[]>([]);
  const [carousels, setCarousels] = useState<CarouselLite[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactLite | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewLite | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingReviews = useMemo(
    () => reviews.filter((item) => !item.is_active && item.show_on_dashboard),
    [reviews],
  );
  const activeCarousels = useMemo(() => carousels.filter((item) => item.is_active), [carousels]);
  const latestContacts = useMemo(
    () => contacts.filter((item) => item.show_on_dashboard),
    [contacts],
  );

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

  const handleHideContactFromDashboard = async (id: number) => {
    try {
      await api.patch(`/api/admin/contacts/${id}/dashboard-visibility`, { show_on_dashboard: false });
      setContacts((current) => current.map((item) => (item.id === id ? { ...item, show_on_dashboard: false } : item)));
      setSelectedContact((current) => (current?.id === id ? null : current));
    } catch (error) {
      console.error('Failed to hide contact from dashboard', error);
    }
  };

  const handleHideReviewFromDashboard = async (id: number) => {
    try {
      await api.patch(`/api/admin/reviews/${id}/dashboard-visibility`, { show_on_dashboard: false });
      setReviews((current) => current.map((item) => (item.id === id ? { ...item, show_on_dashboard: false } : item)));
      setEditingReview((current) => (current?.id === id ? null : current));
    } catch (error) {
      console.error('Failed to hide review from dashboard', error);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await api.delete(`/api/admin/contacts/${id}`);
      setContacts((current) => current.filter((item) => item.id !== id));
      setStats((current) => ({ ...current, contacts: Math.max(0, current.contacts - 1) }));
      setSelectedContact((current) => (current?.id === id ? null : current));
    } catch (error) {
      console.error('Failed to delete contact', error);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/api/admin/reviews/${id}`);
      setReviews((current) => current.filter((item) => item.id !== id));
      setEditingReview((current) => (current?.id === id ? null : current));
    } catch (error) {
      console.error('Failed to delete review', error);
    }
  };

  const handleSaveReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingReview) return;

    setIsSavingReview(true);
    try {
      await api.put(`/api/admin/reviews/${editingReview.id}`, editingReview);
      setReviews((current) => current.map((item) => (item.id === editingReview.id ? editingReview : item)));
      setEditingReview(null);
    } catch (error) {
      console.error('Failed to save review', error);
      alert('Failed to save review');
    } finally {
      setIsSavingReview(false);
    }
  };

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
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Latest contacts</h2>
                <p className="mt-2 text-sm text-slate-500">Recent inquiries worth following up on quickly.</p>
              </div>
              <Link href="/admin/contacts" prefetch={false} className="text-sm font-semibold text-blue-700">
                View all
              </Link>
            </div>

            <div className={`mt-5 space-y-3 overflow-y-auto pr-1 ${DASHBOARD_QUEUE_MAX_HEIGHT}`}>
              {latestContacts.length > 0 ? (
                latestContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedContact(contact);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="block w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{contact.name}</div>
                        <div className="mt-2 text-sm text-slate-600">{contact.subject || 'No subject'}</div>
                        <div className="mt-2 text-xs text-slate-400">{formatDate(contact.created_at)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleHideContactFromDashboard(contact.id);
                        }}
                        className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-slate-300 hover:text-slate-700"
                        aria-label={`Hide contact ${contact.id} from dashboard`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1rem] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No contact messages waiting on the dashboard.
                </div>
              )}
            </div>
          </div>

          <div className="admin-panel p-6 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Pending review queue</h2>
                <p className="mt-2 text-sm text-slate-500">Testimonials waiting for moderation or polishing.</p>
              </div>
              <Link href="/admin/reviews" prefetch={false} className="text-sm font-semibold text-blue-700">
                View all
              </Link>
            </div>

            <div className={`mt-5 space-y-3 overflow-y-auto pr-1 ${DASHBOARD_QUEUE_MAX_HEIGHT}`}>
              {pendingReviews.length > 0 ? (
                pendingReviews.map((review) => (
                  <div
                    key={review.id}
                    onClick={() => setEditingReview({ ...review, review_date: toDateInput(review.review_date) || null })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setEditingReview({ ...review, review_date: toDateInput(review.review_date) || null });
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="block w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-slate-900">{review.username}</div>
                          <div className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                            Pending
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {review.country || 'Unknown country'} · {review.review_date ? review.review_date.slice(0, 10) : 'No date'}
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{review.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleHideReviewFromDashboard(review.id);
                        }}
                        className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-slate-300 hover:text-slate-700"
                        aria-label={`Hide review ${review.id} from dashboard`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1rem] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No pending reviews.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <AdminModal open={Boolean(selectedContact)} title="Contact detail" onClose={() => setSelectedContact(null)} maxWidthClassName="max-w-2xl">
        {selectedContact && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Name</div>
                <div className="mt-1 text-base font-medium text-slate-900">{selectedContact.name}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</div>
                <div className="mt-1 break-all text-base font-medium text-slate-900">{selectedContact.email}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Subject</div>
              <div className="mt-1 text-base font-medium text-slate-900">{selectedContact.subject || 'No subject'}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Message</div>
              <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{selectedContact.message}</div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar size={14} />
              <span>{formatDate(selectedContact.created_at)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleHideContactFromDashboard(selectedContact.id)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Hide From Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleDeleteContact(selectedContact.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal open={Boolean(editingReview)} title="Edit review" onClose={() => setEditingReview(null)} maxWidthClassName="max-w-3xl">
        {editingReview && (
          <form onSubmit={handleSaveReview} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  value={editingReview.username}
                  onChange={(event) => setEditingReview({ ...editingReview, username: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
                <input
                  type="text"
                  value={editingReview.country || ''}
                  onChange={(event) => setEditingReview({ ...editingReview, country: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Review Date</label>
                <input
                  type="date"
                  value={toDateInput(editingReview.review_date)}
                  onChange={(event) => setEditingReview({ ...editingReview, review_date: event.target.value || null })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Rating</label>
                <select
                  value={editingReview.rating}
                  onChange={(event) => setEditingReview({ ...editingReview, rating: Number(event.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Stars
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tour Route</label>
                <input
                  type="text"
                  value={editingReview.tour_route || ''}
                  onChange={(event) => setEditingReview({ ...editingReview, tour_route: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Host</label>
                <input
                  type="text"
                  value={editingReview.host || ''}
                  onChange={(event) => setEditingReview({ ...editingReview, host: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Content</label>
              <textarea
                rows={6}
                value={editingReview.content}
                onChange={(event) => setEditingReview({ ...editingReview, content: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-3 py-3"
              />
            </div>

            {editingReview.photos?.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">Photos</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {editingReview.photos.map((photo, index) => (
                    <div key={`${photo}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={withPublicOrigin(photo)} alt="" className="h-28 w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-5">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={editingReview.is_active}
                  onChange={(event) => setEditingReview({ ...editingReview, is_active: event.target.checked })}
                />
                Approved and visible on the site
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={editingReview.show_on_dashboard}
                  onChange={(event) => setEditingReview({ ...editingReview, show_on_dashboard: event.target.checked })}
                />
                Show on dashboard
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleHideReviewFromDashboard(editingReview.id)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Hide From Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteReview(editingReview.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
              <button type="submit" disabled={isSavingReview} className="btn-primary px-5 py-2.5 disabled:opacity-60">
                {isSavingReview ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
