'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2, Edit2, Star, Wand2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { uploadAdminImage } from '@/lib/admin-upload';

interface Review {
  id: number;
  username: string;
  country: string;
  review_date: string | null;
  tour_route: string;
  host: string;
  content: string;
  avatar: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
}

const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function toDateInput(dateValue: string | null | undefined) {
  if (!dateValue) return '';
  return dateValue.slice(0, 10);
}

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState<Review | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function fetchReviews() {
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, []);

  const handleGenerate = async () => {
    try {
      await api.post('/admin/reviews/generate');
      fetchReviews();
      alert('Reviews generated!');
    } catch {
      alert('Failed to generate reviews');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      let payload: Review = {
        ...editing,
        review_date: editing.review_date || null,
      };

      if (avatarFile) {
        const uploadedUrl = await uploadAdminImage(avatarFile);
        payload = { ...payload, avatar: uploadedUrl };
      }

      if (editing.id === 0) {
        await api.post('/admin/reviews', payload);
      } else {
        await api.put(`/admin/reviews/${editing.id}`, payload);
      }

      setAvatarFile(null);
      setEditing(null);
      setIsCreating(false);
      fetchReviews();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      alert(message);
    }
  };

  const startCreate = () => {
    setEditing({
      id: 0,
      username: '',
      country: '',
      review_date: null,
      tour_route: '',
      host: 'Janet',
      content: '',
      avatar: '',
      rating: 5,
      sort_order: 0,
      is_active: true,
    });
    setAvatarFile(null);
    setIsCreating(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Reviews</h1>
        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Wand2 size={20} />
            Generate Initial
          </button>
          <button
            onClick={startCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Review
          </button>
        </div>
      </div>

      {(editing || isCreating) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-8 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editing?.id === 0 ? 'Add Review' : 'Edit Review'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={editing?.username || ''}
                    onChange={e => setEditing({ ...editing!, username: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={editing?.country || ''}
                    onChange={e => setEditing({ ...editing!, country: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Review Date</label>
                  <input
                    type="date"
                    value={toDateInput(editing?.review_date)}
                    onChange={e => setEditing({ ...editing!, review_date: e.target.value || null })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Host Guide</label>
                  <input
                    type="text"
                    value={editing?.host || ''}
                    onChange={e => setEditing({ ...editing!, host: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tour Route</label>
                <input
                  type="text"
                  value={editing?.tour_route || ''}
                  onChange={e => setEditing({ ...editing!, tour_route: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Avatar</label>
                <ImageUpload
                  value={editing?.avatar}
                  file={avatarFile}
                  onFileChange={setAvatarFile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  rows={4}
                  value={editing?.content || ''}
                  onChange={e => setEditing({ ...editing!, content: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <select
                    value={editing?.rating}
                    onChange={e => setEditing({ ...editing!, rating: parseInt(e.target.value, 10) })}
                    className="w-full border rounded p-2"
                  >
                    {[1, 2, 3, 4, 5].map(r => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editing?.sort_order}
                    onChange={e => setEditing({ ...editing!, sort_order: Number.parseInt(e.target.value, 10) || 0 })}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing?.is_active}
                  onChange={e => setEditing({ ...editing!, is_active: e.target.checked })}
                />
                <label>Active</label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setIsCreating(false);
                    setAvatarFile(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                  {item.avatar ? (
                    <img src={`${HOST}${item.avatar}`} alt={item.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">No</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{item.username}</h3>
                  <div className="text-xs text-gray-500">{item.country || 'Unknown country'}</div>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < item.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing({ ...item, review_date: toDateInput(item.review_date) || null });
                    setAvatarFile(null);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-2">Route: {item.tour_route || 'N/A'}</p>
            <p className="text-gray-600 text-sm mb-2">Host: {item.host || 'N/A'}</p>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">&quot;{item.content}&quot;</p>

            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{item.review_date ? item.review_date.slice(0, 10) : 'No date'}</span>
              <span>{item.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
