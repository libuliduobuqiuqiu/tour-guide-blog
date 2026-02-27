'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { uploadAdminImage } from '@/lib/admin-upload';

interface Carousel {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
}

export default function CarouselsAdmin() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [editing, setEditing] = useState<Carousel | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function fetchCarousels() {
    try {
      const res = await api.get('/admin/carousels');
      setCarousels(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCarousels();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/carousels/${id}`);
      fetchCarousels();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      let payload: Carousel = { ...editing };
      if (imageFile) {
        const uploadedUrl = await uploadAdminImage(imageFile);
        payload = { ...payload, image_url: uploadedUrl };
      }

      if (editing.id === 0) {
        await api.post('/admin/carousels', payload);
      } else {
        await api.put(`/admin/carousels/${editing.id}`, payload);
      }
      setImageFile(null);
      setEditing(null);
      setIsCreating(false);
      fetchCarousels();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      alert(message);
    }
  };

  const startCreate = () => {
    setEditing({
      id: 0,
      title: '',
      image_url: '',
      link_url: '',
      sort_order: 0,
      is_active: true
    });
    setImageFile(null);
    setIsCreating(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-wide">Manage Carousels</h1>
        <button
          onClick={startCreate}
          className="btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Carousel
        </button>
      </div>

      {(editing || isCreating) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="admin-panel p-8 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-6">{editing?.id === 0 ? 'Add Carousel' : 'Edit Carousel'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editing?.title}
                  onChange={e => setEditing({ ...editing!, title: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <ImageUpload
                  value={editing?.image_url}
                  file={imageFile}
                  onFileChange={setImageFile}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link URL</label>
                <input
                  type="text"
                  value={editing?.link_url}
                  onChange={e => setEditing({ ...editing!, link_url: e.target.value })}
                  className="w-full border rounded p-2"
                />
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
                  onClick={() => { setEditing(null); setIsCreating(false); setImageFile(null); }}
                  className="px-4 py-2 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carousels.map(item => (
          <div key={item.id} className="admin-panel overflow-hidden group">
            <div className="h-48 bg-gray-200 relative">
              {item.image_url ? (
                <img src={`http://localhost:8080${item.image_url}`} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
              )}
              {!item.is_active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                  Inactive
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">{item.title}</h3>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Order: {item.sort_order}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(item); setImageFile(null); }}
                    className="p-2 hover:bg-gray-100 rounded-full text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-gray-100 rounded-full text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
