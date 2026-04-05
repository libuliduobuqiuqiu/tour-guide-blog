'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import AdminModal from '@/components/admin/AdminModal';
import AdminPagination from '@/components/admin/AdminPagination';
import ImageUpload from '@/components/admin/ImageUpload';
import TourAvailabilityEditor from '@/components/admin/TourAvailabilityEditor';
import { uploadAdminImage } from '@/lib/admin-upload';
import type { TourAvailabilitySlot } from '@/lib/tour-availability';
import { withPublicOrigin } from '@/lib/url';
import { ArrowUpToLine, Edit2, GripVertical, LoaderCircle, MapPinned, Plus, Trash2 } from 'lucide-react';

const LazyEditor = dynamic(() => import('@/components/admin/Editor'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />,
});

interface Tour {
  id: number;
  title: string;
  description: string;
  content: string;
  highlights: string[];
  places: string[];
  booking_tag_1: string;
  booking_note: string;
  max_bookings: number;
  availability: TourAvailabilitySlot[];
  price: number;
  duration: string;
  location: string;
  cover_image: string;
  sort_order: number;
  created_at?: string;
}

const DEFAULT_PAGE_SIZE = 10;

function reorderList<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function listToTextarea(items?: string[]) {
  return Array.isArray(items) ? items.join('\n') : '';
}

function textareaToList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ToursAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const [tours, setTours] = useState<Tour[]>([]);
  const [editing, setEditing] = useState<Partial<Tour> | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchTours = async () => {
    try {
      const res = await api.get('/api/admin/tours?with_content=false');
      setTours(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch tours', err);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const consumeNewAction = useCallback(() => {
    if (searchParams.get('action') !== 'new') return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('action');
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (action === 'new' && !editing) {
      setEditing({
        title: '',
        description: '',
        content: '',
        highlights: [],
        places: [],
        booking_tag_1: '',
        booking_note: '',
        max_bookings: 0,
        availability: [],
        price: 0,
        duration: '',
        location: '',
        cover_image: '',
        sort_order: tours.length + 1,
      });
      setCoverImageFile(null);
      consumeNewAction();
    }
  }, [action, consumeNewAction, editing, tours.length]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(tours.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, pageSize, tours.length]);

  const totalPages = Math.max(1, Math.ceil(tours.length / pageSize));
  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tours.slice(start, start + pageSize);
  }, [currentPage, pageSize, tours]);

  const closeEditor = () => {
    setEditing(null);
    setCoverImageFile(null);
    consumeNewAction();
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await api.get(`/api/tours/${id}`);
      setEditing(res.data);
      setCoverImageFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tour details';
      alert(message);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    setLoading(true);
    try {
      const maxBookings = Math.max(0, editing.max_bookings ?? 0);
      let payload: Partial<Tour> = {
        ...editing,
        max_bookings: maxBookings,
        availability: Array.isArray(editing.availability)
          ? editing.availability.map((slot) => ({
              ...slot,
              booked_count: maxBookings > 0 ? Math.min(Math.max(0, slot.booked_count ?? 0), maxBookings) : Math.max(0, slot.booked_count ?? 0),
              is_open: slot.is_open !== false,
            }))
          : [],
      };
      if (coverImageFile) {
        const uploadedUrl = await uploadAdminImage(coverImageFile);
        payload = { ...payload, cover_image: uploadedUrl };
      }

      if (editing.id) {
        await api.put(`/api/admin/tours/${editing.id}`, payload);
      } else {
        await api.post('/api/admin/tours', payload);
      }

      closeEditor();
      fetchTours();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save tour';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    try {
      await api.delete(`/api/admin/tours/${id}`);
      fetchTours();
    } catch {
      alert('Failed to delete tour');
    }
  };

  const persistOrder = async (items: Tour[]) => {
    setIsSavingOrder(true);
    try {
      await api.post('/api/admin/tours/reorder', { ids: items.map((item) => item.id) });
    } catch {
      alert('Failed to update tour order');
      fetchTours();
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDrop = async (targetId: number) => {
    if (draggingId === null || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const fromIndex = tours.findIndex((item) => item.id === draggingId);
    const toIndex = tours.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null);
      return;
    }

    const next = reorderList(tours, fromIndex, toIndex);
    setTours(next);
    setDraggingId(null);
    await persistOrder(next);
  };

  const handlePinToTop = async (id: number) => {
    const index = tours.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const next = reorderList(tours, index, 0);
    setTours(next);
    setCurrentPage(1);
    await persistOrder(next);
  };

  return (
    <div className="fade-up flex min-h-full flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">Manage Tours</h1>
          <p className="mt-2 text-sm text-slate-500">
            Use the same card flow as reviews to manage itinerary priority and edit details quickly.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({
              title: '',
              description: '',
              content: '',
              highlights: [],
              places: [],
              booking_tag_1: '',
              booking_note: '',
              max_bookings: 0,
              availability: [],
              price: 0,
              duration: '',
              location: '',
              cover_image: '',
              sort_order: tours.length + 1,
            });
            setCoverImageFile(null);
          }}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2"
        >
          <Plus size={18} />
          New Tour
        </button>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span>{tours.length} tours</span>
          <label className="inline-flex items-center gap-2">
            <span>Per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number.parseInt(event.target.value, 10));
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <span className="inline-flex items-center gap-2">
          {isSavingOrder && <LoaderCircle size={16} className="animate-spin" />}
          {isSavingOrder ? 'Saving order...' : 'Drag cards or pin important tours to the top'}
        </span>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 gap-4">
        {paginatedTours.map((tour) => (
          <div
            key={tour.id}
            draggable
            onDragStart={() => setDraggingId(tour.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(tour.id)}
            className={`admin-panel overflow-hidden p-5 transition ${draggingId === tour.id ? 'scale-[0.99] opacity-60' : ''}`}
          >
            <div className="flex flex-col gap-5 lg:flex-row">
              <button type="button" className="cursor-grab self-start pt-1 text-slate-400 hover:text-slate-700" aria-label="Drag to reorder">
                <GripVertical size={20} />
              </button>

              <div className="h-44 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-100 lg:w-72">
                {tour.cover_image ? (
                  <img src={withPublicOrigin(tour.cover_image)} alt={tour.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">No cover image</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">{tour.title}</h3>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    #{tour.id}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <MapPinned size={14} />
                    {tour.location || 'No location'}
                  </span>
                  <span>{tour.duration || 'No duration'}</span>
                  <span>${tour.price || 0}</span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
                  {tour.description || 'No description yet.'}
                </p>
              </div>

              <div className="flex gap-2 lg:justify-end">
                <button onClick={() => handlePinToTop(tour.id)} className="text-amber-600 hover:text-amber-800" title="Pin to top">
                  <ArrowUpToLine size={16} />
                </button>
                <button onClick={() => handleEdit(tour.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(tour.id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {tours.length === 0 && (
          <div className="admin-panel py-20 text-center text-slate-500">No tours yet.</div>
        )}
        </div>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />

      <AdminModal open={Boolean(editing)} title={editing?.id ? 'Edit Tour' : 'Create Tour'} onClose={closeEditor} maxWidthClassName="max-w-5xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                required
                value={editing?.title || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, title: event.target.value }))}
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
              <input
                type="text"
                required
                value={editing?.location || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, location: event.target.value }))}
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Duration</label>
              <input
                type="text"
                required
                value={editing?.duration || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, duration: event.target.value }))}
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={editing?.price ?? 0}
                onChange={(event) => setEditing((current) => ({ ...current!, price: Number.parseFloat(event.target.value) || 0 }))}
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price Tag 1</label>
              <input
                type="text"
                value={editing?.booking_tag_1 || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, booking_tag_1: event.target.value }))}
                placeholder="0/6 Booked · Max 8"
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Booking Note</label>
              <input
                type="text"
                value={editing?.booking_note || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, booking_note: event.target.value }))}
                placeholder="Group of 6–8 people"
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Max Bookings</label>
              <input
                type="number"
                min="0"
                value={editing?.max_bookings ?? 0}
                onChange={(event) => setEditing((current) => ({ ...current!, max_bookings: Number.parseInt(event.target.value, 10) || 0 }))}
                placeholder="8"
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Cover Image</label>
              <ImageUpload value={editing?.cover_image} file={coverImageFile} onFileChange={setCoverImageFile} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={3}
                value={editing?.description || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, description: event.target.value }))}
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Highlights</label>
              <textarea
                rows={5}
                value={listToTextarea(editing?.highlights)}
                onChange={(event) => setEditing((current) => ({ ...current!, highlights: textareaToList(event.target.value) }))}
                placeholder="One highlight per line"
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Places to visit</label>
              <textarea
                rows={5}
                value={listToTextarea(editing?.places)}
                onChange={(event) => setEditing((current) => ({ ...current!, places: textareaToList(event.target.value) }))}
                placeholder="One place per line"
                className="w-full px-4 py-3"
              />
            </div>
            <div className="md:col-span-2">
              <TourAvailabilityEditor
                value={editing?.availability || []}
                maxBookings={editing?.max_bookings ?? 0}
                onChange={(value) => setEditing((current) => ({ ...current!, availability: value }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Itinerary / Content</label>
            <p className="mb-3 text-xs font-medium text-slate-500">
              Paste Markdown directly here and it will auto-convert to rich text.
            </p>
            <LazyEditor value={editing?.content || ''} onChange={(value) => setEditing((current) => ({ ...current!, content: value }))} />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeEditor} className="btn-secondary px-5 py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Tour'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
