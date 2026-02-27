'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Editor from '@/components/admin/Editor';
import ImageUpload from '@/components/admin/ImageUpload';
import { uploadAdminImage } from '@/lib/admin-upload';

interface Tour {
  id: number;
  title: string;
  description: string;
  content: string;
  price: number;
  duration: string;
  location: string;
  cover_image: string;
}

export default function ToursAdmin() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTour, setCurrentTour] = useState<Partial<Tour>>({});
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await api.get('/api/tours');
      setTours(res.data);
    } catch (err) {
      console.error('Failed to fetch tours');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload: Partial<Tour> = { ...currentTour };
      if (coverImageFile) {
        const uploadedUrl = await uploadAdminImage(coverImageFile);
        payload = { ...payload, cover_image: uploadedUrl };
      }

      if (currentTour.id) {
        await api.put(`/admin/tours/${currentTour.id}`, payload);
      } else {
        await api.post('/admin/tours', payload);
      }
      setCoverImageFile(null);
      setIsEditing(false);
      fetchTours();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save tour';
      console.error('Failed to save tour', err);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    try {
      await api.delete(`/admin/tours/${id}`);
      fetchTours();
    } catch (err) {
      console.error('Failed to delete tour');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-wide">Manage Tours</h1>
        <button
          onClick={() => {
            setCurrentTour({});
            setCoverImageFile(null);
            setIsEditing(true);
          }}
          className="flex items-center gap-2 btn-primary px-4 py-2"
        >
          <Plus size={20} />
          New Tour
        </button>
      </div>

      <div className="admin-panel overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Location</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Price</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tours.map((tour) => (
              <tr key={tour.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{tour.title}</td>
                <td className="px-6 py-4">{tour.location}</td>
                <td className="px-6 py-4">${tour.price}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => {
                      setCurrentTour(tour);
                      setCoverImageFile(null);
                      setIsEditing(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(tour.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="mt-8 admin-panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{currentTour.id ? 'Edit Tour' : 'New Tour'}</h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={currentTour.title || ''}
                  onChange={(e) => setCurrentTour({ ...currentTour, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={currentTour.location || ''}
                  onChange={(e) => setCurrentTour({ ...currentTour, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  required
                  value={currentTour.price || ''}
                  onChange={(e) => setCurrentTour({ ...currentTour, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  required
                  value={currentTour.duration || ''}
                  onChange={(e) => setCurrentTour({ ...currentTour, duration: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <ImageUpload
                  value={currentTour.cover_image}
                  file={coverImageFile}
                  onFileChange={setCoverImageFile}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={currentTour.description || ''}
                  onChange={(e) => setCurrentTour({ ...currentTour, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Itinerary / Content</label>
              <Editor
                value={currentTour.content || ''}
                onChange={(val) => setCurrentTour({ ...currentTour, content: val })}
              />
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Tour'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
