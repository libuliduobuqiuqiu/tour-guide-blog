'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import AdminModal from '@/components/admin/AdminModal';
import AdminPagination from '@/components/admin/AdminPagination';
import ImageUpload from '@/components/admin/ImageUpload';
import { uploadAdminImage } from '@/lib/admin-upload';
import { withPublicOrigin } from '@/lib/url';
import { ArrowUpToLine, Edit2, ExternalLink, GripVertical, Images, LoaderCircle, Plus, Trash2 } from 'lucide-react';

interface Carousel {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

const DEFAULT_PAGE_SIZE = 10;

function reorderList<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function CarouselsAdmin() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [editing, setEditing] = useState<Carousel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  async function fetchCarousels() {
    try {
      const res = await api.get('/api/admin/carousels');
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.list)
            ? payload.list
            : [];
      setCarousels(list);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchCarousels();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(carousels.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [carousels.length, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(carousels.length / pageSize));
  const paginatedCarousels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return carousels.slice(start, start + pageSize);
  }, [carousels, currentPage, pageSize]);

  const closeEditor = () => {
    setEditing(null);
    setImageFile(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/admin/carousels/${id}`);
      fetchCarousels();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    try {
      let payload: Carousel = { ...editing };
      if (imageFile) {
        const uploadedUrl = await uploadAdminImage(imageFile);
        payload = { ...payload, image_url: uploadedUrl };
      }

      if (editing.id === 0) {
        await api.post('/api/admin/carousels', payload);
      } else {
        await api.put(`/api/admin/carousels/${editing.id}`, payload);
      }

      closeEditor();
      fetchCarousels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      alert(message);
    }
  };

  const persistOrder = async (items: Carousel[]) => {
    setIsSavingOrder(true);
    try {
      await api.post('/api/admin/carousels/reorder', { ids: items.map((item) => item.id) });
    } catch {
      alert('Failed to update carousel order');
      fetchCarousels();
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDrop = async (targetId: number) => {
    if (draggingId === null || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const fromIndex = carousels.findIndex((item) => item.id === draggingId);
    const toIndex = carousels.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null);
      return;
    }

    const next = reorderList(carousels, fromIndex, toIndex);
    setCarousels(next);
    setDraggingId(null);
    await persistOrder(next);
  };

  const handlePinToTop = async (id: number) => {
    const index = carousels.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const next = reorderList(carousels, index, 0);
    setCarousels(next);
    setCurrentPage(1);
    await persistOrder(next);
  };

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">Manage Carousels</h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep homepage hero slides in a clear priority order with the same interaction model as reviews.
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({
              id: 0,
              title: '',
              image_url: '',
              link_url: '',
              sort_order: carousels.length + 1,
              is_active: true,
            })
          }
          className="btn-primary inline-flex items-center gap-2 px-4 py-2"
        >
          <Plus size={18} />
          Add Carousel
        </button>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span>{carousels.length} carousels</span>
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
          {isSavingOrder ? 'Saving order...' : 'Drag hero slides or pin priority banners to the top'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paginatedCarousels.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggingId(item.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(item.id)}
            className={`admin-panel overflow-hidden p-5 transition ${draggingId === item.id ? 'scale-[0.99] opacity-60' : ''}`}
          >
            <div className="flex flex-col gap-5 lg:flex-row">
              <button type="button" className="cursor-grab self-start pt-1 text-slate-400 hover:text-slate-700" aria-label="Drag to reorder">
                <GripVertical size={20} />
              </button>

              <div className="relative h-44 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-100 lg:w-72">
                {item.image_url ? (
                  <img src={withPublicOrigin(item.image_url)} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                )}
                {!item.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/52 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                    Inactive
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">{item.title || 'Untitled carousel'}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {item.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Images size={14} />
                    Order {item.sort_order}
                  </span>
                  <span className="inline-flex items-center gap-2 break-all">
                    <ExternalLink size={14} />
                    {item.link_url || 'No link URL'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 lg:justify-end">
                <button onClick={() => handlePinToTop(item.id)} className="text-amber-600 hover:text-amber-800" title="Pin to top">
                  <ArrowUpToLine size={16} />
                </button>
                <button onClick={() => { setEditing(item); setImageFile(null); }} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {carousels.length === 0 && (
          <div className="admin-panel py-20 text-center text-slate-500">No carousels yet.</div>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />

      <AdminModal open={Boolean(editing)} title={editing?.id === 0 ? 'Add Carousel' : 'Edit Carousel'} onClose={closeEditor} maxWidthClassName="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={editing?.title || ''}
              onChange={(event) => setEditing({ ...editing!, title: event.target.value })}
              className="w-full px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Image</label>
            <ImageUpload value={editing?.image_url} file={imageFile} onFileChange={setImageFile} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Link URL</label>
            <input
              type="text"
              value={editing?.link_url || ''}
              onChange={(event) => setEditing({ ...editing!, link_url: event.target.value })}
              className="w-full px-4 py-3"
            />
          </div>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={editing?.is_active || false}
              onChange={(event) => setEditing({ ...editing!, is_active: event.target.checked })}
            />
            Active on homepage
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeEditor} className="btn-secondary px-5 py-2.5">
              Cancel
            </button>
            <button type="submit" className="btn-primary px-5 py-2.5">
              Save
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
