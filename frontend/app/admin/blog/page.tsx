'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Editor from '@/components/admin/Editor';
import ImageUpload from '@/components/admin/ImageUpload';
import { uploadAdminImage } from '@/lib/admin-upload';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  cover_image: string;
  created_at: string;
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({});
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload: Partial<Post> = { ...currentPost };
      if (coverImageFile) {
        const uploadedUrl = await uploadAdminImage(coverImageFile);
        payload = { ...payload, cover_image: uploadedUrl };
      }

      if (currentPost.id) {
        await api.put(`/admin/posts/${currentPost.id}`, payload);
      } else {
        await api.post('/admin/posts', payload);
      }
      setCoverImageFile(null);
      setIsEditing(false);
      fetchPosts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save post';
      console.error('Failed to save post', err);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-wide">Manage Blog Posts</h1>
        <button
          onClick={() => {
            setCurrentPost({ author: 'Janet' });
            setCoverImageFile(null);
            setIsEditing(true);
          }}
          className="flex items-center gap-2 btn-primary px-4 py-2"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      <div className="admin-panel overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Author</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{post.title}</td>
                <td className="px-6 py-4">{post.author}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => {
                      setCurrentPost(post);
                      setCoverImageFile(null);
                      setIsEditing(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
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
            <h2 className="text-xl font-bold">{currentPost.id ? 'Edit Post' : 'New Post'}</h2>
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
                  value={currentPost.title || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  required
                  value={currentPost.author || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <ImageUpload
                  value={currentPost.cover_image}
                  file={coverImageFile}
                  onFileChange={setCoverImageFile}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  rows={2}
                  value={currentPost.excerpt || ''}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Short summary of the post..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <Editor
                value={currentPost.content || ''}
                onChange={(val) => setCurrentPost({ ...currentPost, content: val })}
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
                {loading ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
