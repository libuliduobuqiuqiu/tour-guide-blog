'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ value, onChange, className = '' }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Assuming the backend returns { url: "/uploads/..." }
      // We need to prepend the backend URL if it's relative, but typically
      // the frontend proxy or base URL handles it.
      // However, for display, if it's a relative path, we might need to be careful.
      // Based on previous code, images seem to be referenced as strings.
      // Let's assume the backend returns a usable relative path like /uploads/xyz.jpg
      // And we need to make sure the frontend can serve it or proxy it.
      // Since we added r.Static("/uploads", ...), http://localhost:8080/uploads/... works.
      // If frontend is on 3000, we need to use the full URL or proxy.
      // Let's stick to storing the relative path and prepending API_URL if needed for display,
      // OR store the full URL.
      // Given the config.go example: "/images/jackson.jpg", it seems relative paths are used.
      // But Next.js Image component or img tag needs to know the domain if it's on backend.
      
      // Let's store the full URL if we can, or just the relative path and handle it in display.
      // For now, let's just pass what the backend returns.
      onChange(res.data.url);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-4">
        {value && (
          <div className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
            <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')}${value}`} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Upload size={18} />
          <span>{loading ? 'Uploading...' : 'Upload Image'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={loading} />
        </label>
      </div>
    </div>
  );
}
