'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import AdminModal from '@/components/admin/AdminModal';
import AdminPagination from '@/components/admin/AdminPagination';
import ImageUpload from '@/components/admin/ImageUpload';
import { uploadAdminImage } from '@/lib/admin-upload';
import { withPublicOrigin } from '@/lib/url';
import { ArrowUpToLine, BookOpen, CalendarDays, Edit2, GripVertical, LoaderCircle, Plus, Trash2 } from 'lucide-react';

const LazyEditor = dynamic(() => import('@/components/admin/Editor'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />,
});

interface Post {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string;
  author: string;
  cover_image: string;
  created_at: string;
  sort_order: number;
}

const DEFAULT_PAGE_SIZE = 10;

function reorderList<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'No date';
  return date.toISOString().slice(0, 10);
}

export default function BlogAdmin() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/admin/posts?with_content=false');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'new' && !editing) {
      setEditing({
        title: '',
        content: '',
        summary: '',
        category: '',
        tags: '',
        author: 'Janet',
        cover_image: '',
        sort_order: posts.length + 1,
      });
      setCoverImageFile(null);
    }
  }, [editing, posts.length, searchParams]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, pageSize, posts.length]);

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return posts.slice(start, start + pageSize);
  }, [currentPage, pageSize, posts]);

  const closeEditor = () => {
    setEditing(null);
    setCoverImageFile(null);
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await api.get(`/api/posts/${id}`);
      setEditing(res.data);
      setCoverImageFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load post details';
      alert(message);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    setLoading(true);
    try {
      let payload: Partial<Post> = { ...editing };
      if (coverImageFile) {
        const uploadedUrl = await uploadAdminImage(coverImageFile);
        payload = { ...payload, cover_image: uploadedUrl };
      }

      if (editing.id) {
        await api.put(`/api/admin/posts/${editing.id}`, payload);
      } else {
        await api.post('/api/admin/posts', payload);
      }

      closeEditor();
      fetchPosts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save post';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/api/admin/posts/${id}`);
      fetchPosts();
    } catch {
      alert('Failed to delete post');
    }
  };

  const persistOrder = async (items: Post[]) => {
    setIsSavingOrder(true);
    try {
      await api.post('/api/admin/posts/reorder', { ids: items.map((item) => item.id) });
    } catch {
      alert('Failed to update blog order');
      fetchPosts();
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDrop = async (targetId: number) => {
    if (draggingId === null || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const fromIndex = posts.findIndex((item) => item.id === draggingId);
    const toIndex = posts.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null);
      return;
    }

    const next = reorderList(posts, fromIndex, toIndex);
    setPosts(next);
    setDraggingId(null);
    await persistOrder(next);
  };

  const handlePinToTop = async (id: number) => {
    const index = posts.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const next = reorderList(posts, index, 0);
    setPosts(next);
    setCurrentPage(1);
    await persistOrder(next);
  };

  return (
    <div className="fade-up space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">Manage Blog Posts</h1>
          <p className="mt-2 text-sm text-slate-500">
            Highlight priority stories, edit in-place, and keep publishing flow aligned with reviews and contacts.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({
              title: '',
              content: '',
              summary: '',
              category: '',
              tags: '',
              author: 'Janet',
              cover_image: '',
              sort_order: posts.length + 1,
            });
            setCoverImageFile(null);
          }}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      <div className="flex flex-col gap-3 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span>{posts.length} posts</span>
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
          {isSavingOrder ? 'Saving order...' : 'Drag cards or pin flagship articles to the top'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paginatedPosts.map((post) => (
          <div
            key={post.id}
            draggable
            onDragStart={() => setDraggingId(post.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(post.id)}
            className={`admin-panel overflow-hidden p-5 transition ${draggingId === post.id ? 'scale-[0.99] opacity-60' : ''}`}
          >
            <div className="flex flex-col gap-5 lg:flex-row">
              <button type="button" className="cursor-grab self-start pt-1 text-slate-400 hover:text-slate-700" aria-label="Drag to reorder">
                <GripVertical size={20} />
              </button>

              <div className="h-44 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-100 lg:w-72">
                {post.cover_image ? (
                  <img src={withPublicOrigin(post.cover_image)} alt={post.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">No cover image</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">{post.title}</h3>
                  {post.category && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen size={14} />
                    {post.author || 'Unknown author'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={14} />
                    {formatDate(post.created_at)}
                  </span>
                  <span>{post.tags || 'No tags'}</span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
                  {post.summary || 'No summary yet.'}
                </p>
              </div>

              <div className="flex gap-2 lg:justify-end">
                <button onClick={() => handlePinToTop(post.id)} className="text-amber-600 hover:text-amber-800" title="Pin to top">
                  <ArrowUpToLine size={16} />
                </button>
                <button onClick={() => handleEdit(post.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="admin-panel py-20 text-center text-slate-500">No blog posts yet.</div>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />

      <AdminModal open={Boolean(editing)} title={editing?.id ? 'Edit Post' : 'Create Post'} onClose={closeEditor} maxWidthClassName="max-w-5xl">
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
              <label className="mb-2 block text-sm font-medium text-slate-700">Author</label>
              <input
                type="text"
                required
                value={editing?.author || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, author: event.target.value }))}
                className="w-full px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Cover Image</label>
              <ImageUpload value={editing?.cover_image} file={coverImageFile} onFileChange={setCoverImageFile} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                value={editing?.category || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, category: event.target.value }))}
                className="w-full px-4 py-3"
                placeholder="Food, Travel, Culture"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Tags</label>
              <input
                type="text"
                value={editing?.tags || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, tags: event.target.value }))}
                className="w-full px-4 py-3"
                placeholder="food, local, tips"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Summary</label>
              <textarea
                rows={3}
                value={editing?.summary || ''}
                onChange={(event) => setEditing((current) => ({ ...current!, summary: event.target.value }))}
                className="w-full px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Content</label>
            <LazyEditor value={editing?.content || ''} onChange={(value) => setEditing((current) => ({ ...current!, content: value }))} />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeEditor} className="btn-secondary px-5 py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
