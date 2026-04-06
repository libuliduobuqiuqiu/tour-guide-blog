'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { withPublicOrigin } from '@/lib/url';

interface ImageUploadProps {
  value?: string;
  file?: File | null;
  onFileChange: (file: File | null) => void;
  onClear?: () => void;
  stacked?: boolean;
  className?: string;
}

export default function ImageUpload({ value, file, onFileChange, onClear, stacked = false, className = '' }: ImageUploadProps) {
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
    return withPublicOrigin(value);
  }, [localPreviewUrl, value]);

  const label = file ? 'Change Image' : 'Select Image';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className={stacked ? 'flex flex-col gap-4' : 'flex items-center gap-4'}>
        {previewUrl && (
          <div className={`relative overflow-hidden rounded-lg border border-gray-200 ${stacked ? 'aspect-[4/3] w-full max-w-[240px]' : 'h-24 w-24'}`}>
            <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" />
          </div>
        )}
        <div className={stacked ? 'flex flex-wrap items-center gap-2' : 'flex items-center gap-2'}>
          <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Upload size={18} />
            <span>{label}</span>
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                onFileChange(selectedFile);
                e.target.value = '';
              }}
            />
          </label>
          {(file || (value && onClear)) && (
            <button
              type="button"
              onClick={() => {
                if (file) {
                  onFileChange(null);
                  return;
                }
                onClear?.();
              }}
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
