'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import { ArrowUpToLine, Edit2, GripVertical, LoaderCircle, Plus, Star, Trash2, Wand2, X } from 'lucide-react';
import { uploadAdminImage } from '@/lib/admin-upload';
import { COUNTRIES } from '@/lib/countries';
import { getReviewInitial } from '@/lib/reviews';
import { withPublicOrigin } from '@/lib/url';
import AdminModal from '@/components/admin/AdminModal';
import AdminPagination from '@/components/admin/AdminPagination';

interface Review {
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
}

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

const MAX_REVIEW_PHOTOS = 3;

function toDateInput(dateValue: string | null | undefined) {
  if (!dateValue) return '';
  return dateValue.slice(0, 10);
}

function reorderList<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState<Review | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function fetchReviews() {
    try {
      const res = await api.get('/api/admin/reviews');
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.list)
            ? payload.list
            : [];
      setReviews(list);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, pageSize, reviews.length]);

  const currentPhotos = useMemo(() => editing?.photos || [], [editing]);
  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return reviews.slice(start, start + pageSize);
  }, [currentPage, pageSize, reviews]);

  const resetEditor = () => {
    setEditing(null);
    setIsCreating(false);
    setSelectedPhotos((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  };

  const handleGenerate = async () => {
    try {
      await api.post('/api/admin/reviews/generate');
      fetchReviews();
      alert('Reviews generated!');
    } catch {
      alert('Failed to generate reviews');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/admin/reviews/${id}`);
      fetchReviews();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleSelectPhotos = (fileList: FileList | null) => {
    if (!fileList || !editing) return;

    const incoming = Array.from(fileList);
    if (currentPhotos.length + selectedPhotos.length + incoming.length > MAX_REVIEW_PHOTOS) {
      alert(`You can upload up to ${MAX_REVIEW_PHOTOS} photos.`);
      return;
    }

    setSelectedPhotos((current) => [
      ...current,
      ...incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const handleRemoveExistingPhoto = (index: number) => {
    if (!editing) return;
    const nextPhotos = [...(editing.photos || [])];
    nextPhotos.splice(index, 1);
    setEditing({ ...editing, photos: nextPhotos });
  };

  const handleRemoveSelectedPhoto = (index: number) => {
    setSelectedPhotos((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      const uploadedPhotos = [...(editing.photos || [])];
      for (const item of selectedPhotos) {
        const url = await uploadAdminImage(item.file);
        uploadedPhotos.push(url);
      }

      const payload: Review = {
        ...editing,
        avatar: '',
        host: editing.host || '',
        tour_route: editing.tour_route || '',
        review_date: editing.review_date || null,
        photos: uploadedPhotos,
      };

      if (editing.id === 0) {
        await api.post('/api/admin/reviews', payload);
      } else {
        await api.put(`/api/admin/reviews/${editing.id}`, payload);
      }

      resetEditor();
      fetchReviews();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      alert(message);
    }
  };

  const persistOrder = async (items: Review[]) => {
    setIsSavingOrder(true);
    try {
      await api.post('/api/admin/reviews/reorder', { ids: items.map((item) => item.id) });
    } catch {
      alert('Failed to update review order');
      fetchReviews();
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDrop = async (targetId: number) => {
    if (draggingId === null || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const fromIndex = reviews.findIndex((item) => item.id === draggingId);
    const toIndex = reviews.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null);
      return;
    }

    const next = reorderList(reviews, fromIndex, toIndex);
    setReviews(next);
    setDraggingId(null);
    await persistOrder(next);
  };

  const handlePinToTop = async (id: number) => {
    const index = reviews.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const next = reorderList(reviews, index, 0);
    setReviews(next);
    setCurrentPage(1);
    await persistOrder(next);
  };

  const startCreate = () => {
    setEditing({
      id: 0,
      username: '',
      country: '',
      review_date: new Date().toISOString().slice(0, 10),
      tour_route: '',
      host: '',
      content: '',
      avatar: '',
      photos: [],
      rating: 5,
      sort_order: reviews.length + 1,
      is_active: false,
    });
    setSelectedPhotos([]);
    setIsCreating(true);
  };

  const startEdit = (item: Review) => {
    setEditing({
      ...item,
      review_date: toDateInput(item.review_date) || null,
      photos: item.photos || [],
    });
    setSelectedPhotos([]);
    setIsCreating(false);
  };

  return (
    <div className="fade-up relative">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">Manage Reviews</h1>
          <p className="mt-2 text-sm text-slate-500">
            Drag cards to change display order. Pending reviews stay hidden until approved.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleGenerate} className="btn-secondary px-4 py-2 flex items-center gap-2">
            <Wand2 size={20} />
            Generate Initial
          </button>
          <button onClick={startCreate} className="btn-primary px-4 py-2 flex items-center gap-2">
            <Plus size={20} />
            Add Review
          </button>
        </div>
      </div>

      <AdminModal open={Boolean(editing || isCreating)} title={editing?.id === 0 ? 'Add Review' : 'Edit Review'} onClose={resetEditor} maxWidthClassName="max-w-3xl">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Username</label>
                  <input
                    type="text"
                    required
                    value={editing?.username || ''}
                    onChange={(e) => setEditing({ ...editing!, username: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Country</label>
                  <select
                    required
                    value={editing?.country || ''}
                    onChange={(e) => setEditing({ ...editing!, country: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Review Date</label>
                  <input
                    type="date"
                    value={toDateInput(editing?.review_date)}
                    onChange={(e) => setEditing({ ...editing!, review_date: e.target.value || null })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Rating</label>
                  <select
                    value={editing?.rating}
                    onChange={(e) => setEditing({ ...editing!, rating: parseInt(e.target.value, 10) })}
                    className="w-full border rounded p-2"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} Stars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Content</label>
                <textarea
                  rows={5}
                  value={editing?.content || ''}
                  onChange={(e) => setEditing({ ...editing!, content: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Photos</label>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    <Plus size={16} />
                    <span>Add Photos</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      multiple
                      onChange={(e) => {
                        handleSelectPhotos(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <p className="mt-2 text-xs text-slate-500">Up to 3 photos per review.</p>

                  {(currentPhotos.length > 0 || selectedPhotos.length > 0) && (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                      {currentPhotos.map((photo, index) => (
                        <div key={`${photo}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img src={withPublicOrigin(photo)} alt="" className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingPhoto(index)}
                            className="absolute right-2 top-2 rounded-full bg-slate-950/65 p-1 text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {selectedPhotos.map((photo, index) => (
                        <div key={`${photo.file.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img src={photo.previewUrl} alt="" className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveSelectedPhoto(index)}
                            className="absolute right-2 top-2 rounded-full bg-slate-950/65 p-1 text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={editing?.is_active || false}
                  onChange={(e) => setEditing({ ...editing!, is_active: e.target.checked })}
                />
                Approved and visible on the site
              </label>

              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={resetEditor} className="px-4 py-2 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 btn-primary">
                  Save
                </button>
              </div>
            </form>
      </AdminModal>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between text-sm text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span>{reviews.length} reviews</span>
          <label className="inline-flex items-center gap-2">
            <span>Per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(parseInt(event.target.value, 10));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5"
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
          {isSavingOrder ? 'Saving order...' : 'Drag to reorder or pin to top'}
        </span>
      </div>

      <div className="space-y-4">
        {paginatedReviews.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggingId(item.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(item.id)}
            className={`admin-panel p-5 transition ${draggingId === item.id ? 'opacity-60' : ''}`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 items-start gap-4">
                <button
                  type="button"
                  className="mt-1 cursor-grab text-slate-400 hover:text-slate-700"
                  aria-label="Drag to reorder"
                >
                  <GripVertical size={20} />
                </button>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-sm font-semibold text-white">
                  {getReviewInitial(item.username)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{item.username}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.is_active ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {item.country || 'Unknown country'} · {item.review_date ? item.review_date.slice(0, 10) : 'No date'}
                  </div>
                  <div className="mt-2 flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < item.rating ? 'fill-current' : ''} />
                    ))}
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-slate-600">&quot;{item.content}&quot;</p>

                  {item.photos?.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {item.photos.map((photo, index) => (
                        <div key={`${item.id}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img src={withPublicOrigin(photo)} alt="" className="h-20 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePinToTop(item.id)}
                  className="text-amber-600 hover:text-amber-800"
                  title="Pin to top"
                >
                  <ArrowUpToLine size={16} />
                </button>
                <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </div>
  );
}
