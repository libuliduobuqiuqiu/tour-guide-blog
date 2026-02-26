'use client';

import { useEffect, useMemo } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  file?: File | null;
  onFileChange: (file: File | null) => void;
  className?: string;
}

export default function ImageUpload({ value, file, onFileChange, className = '' }: ImageUploadProps) {
  const localPreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewUrl = useMemo(() => {
    if (localPreviewUrl) return localPreviewUrl;
    if (!value) return '';
    if (value.startsWith('http')) return value;
    const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${host}${value.startsWith('/') ? '' : '/'}${value}`;
  }, [localPreviewUrl, value]);

  const label = file ? 'Change Image' : 'Select Image';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-4">
        {previewUrl && (
          <div className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Upload size={18} />
            <span>{label}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                onFileChange(selectedFile);
                e.target.value = '';
              }}
            />
          </label>
          {file && (
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-1"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>
      {file && <p className="text-xs text-gray-500">Selected: {file.name}</p>}
    </div>
  );
}
