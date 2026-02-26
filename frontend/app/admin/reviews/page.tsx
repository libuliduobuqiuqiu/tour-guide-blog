'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2, Edit2, Star, Wand2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { uploadAdminImage } from '@/lib/admin-upload';

interface Review {
  id: number;
  username: string;
  content: string;
  avatar: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
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
    } catch (err) {
      alert('Failed to generate reviews');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      let payload: Review = { ...editing };
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
      alert('Failed to save');
    }
  };

  const startCreate = () => {
    setEditing({
      id: 0,
      username: '',
      content: '',
      avatar: '',
      rating: 5,
      sort_order: 0,
      is_active: true
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">{editing?.id === 0 ? 'Add Review' : 'Edit Review'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={editing?.username}
                  onChange={e => setEditing({ ...editing!, username: e.target.value })}
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
                  rows={3}
                  value={editing?.content}
                  onChange={e => setEditing({ ...editing!, content: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <select
                  value={editing?.rating}
                  onChange={e => setEditing({ ...editing!, rating: parseInt(e.target.value) })}
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
                  onChange={e => setEditing({ ...editing!, sort_order: parseInt(e.target.value) })}
                  className="w-full border rounded p-2"
                />
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
                  onClick={() => { setEditing(null); setIsCreating(false); setAvatarFile(null); }}
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
                    <img src={`http://localhost:8080${item.avatar}`} alt={item.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xs">No</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{item.username}</h3>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < item.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(item); setAvatarFile(null); }}
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
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">&quot;{item.content}&quot;</p>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Order: {item.sort_order}</span>
              <span>{item.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
