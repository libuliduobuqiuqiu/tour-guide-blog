'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LoaderCircle, Star, Upload, X } from 'lucide-react';
import { submitReview, uploadReviewPhoto } from '@/lib/api';

const MAX_REVIEW_PHOTOS = 3;
const MAX_REVIEW_PHOTO_SIZE = 4 * 1024 * 1024;

type ReviewFormState = {
  username: string;
  country: string;
  content: string;
  rating: number;
  website: string;
};

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

const initialFormState: ReviewFormState = {
  username: '',
  country: '',
  content: '',
  rating: 5,
  website: '',
};

export default function ReviewSubmissionModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<ReviewFormState>(initialFormState);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const photosRef = useRef<SelectedPhoto[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const ratingStars = useMemo(() => Array.from({ length: 5 }), []);

  const updateField = <K extends keyof ReviewFormState>(key: K, value: ReviewFormState[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleAddPhotos = (fileList: FileList | null) => {
    if (!fileList) return;

    const incoming = Array.from(fileList);
    if (photos.length + incoming.length > MAX_REVIEW_PHOTOS) {
      setStatus('error');
      setMessage(`You can upload up to ${MAX_REVIEW_PHOTOS} photos.`);
      return;
    }

    const oversized = incoming.find((file) => file.size > MAX_REVIEW_PHOTO_SIZE);
    if (oversized) {
      setStatus('error');
      setMessage('Each photo must be 4MB or smaller.');
      return;
    }

    setStatus('idle');
    setMessage('');
    setPhotos((current) => [
      ...current,
      ...incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const uploadedPhotos: string[] = [];
      for (const item of photos) {
        const uploaded = await uploadReviewPhoto(item.file);
        uploadedPhotos.push(uploaded.url);
      }

      await submitReview({
        username: formData.username,
        country: formData.country,
        content: formData.content,
        rating: formData.rating,
        photos: uploadedPhotos,
        website: formData.website,
      });

      setStatus('success');
      setMessage('Review submitted. It will appear after approval.');
    } catch (error: unknown) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to submit review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.55)] md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-slate-900"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="pr-10">
          <h2 className="text-2xl font-semibold text-slate-900">Add Review</h2>
          <p className="mt-2 text-sm text-slate-600">
            Share your experience. Reviews are published after admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(event) => updateField('website', event.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Username</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.username}
                onChange={(event) => updateField('username', event.target.value)}
                className="w-full px-4 py-3"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Country</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.country}
                onChange={(event) => updateField('country', event.target.value)}
                className="w-full px-4 py-3"
                placeholder="Your country"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Content</label>
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={formData.content}
              onChange={(event) => updateField('content', event.target.value)}
              className="w-full px-4 py-3"
              placeholder="Tell other travelers what stood out."
            />
            <p className="mt-2 text-xs text-slate-500">{formData.content.length}/2000</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Rating</label>
            <div className="flex flex-wrap gap-2">
              {ratingStars.map((_, index) => {
                const value = index + 1;
                const selected = value <= formData.rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField('rating', value)}
                    className={`rounded-full border px-3 py-2 transition ${
                      selected
                        ? 'border-amber-300 bg-amber-50 text-amber-600'
                        : 'border-slate-200 bg-white text-slate-400'
                    }`}
                    aria-label={`${value} star`}
                  >
                    <Star size={18} className={selected ? 'fill-current' : ''} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Photos</label>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700">
                  <Upload size={16} />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    multiple
                    onChange={(event) => {
                      handleAddPhotos(event.target.files);
                      event.target.value = '';
                    }}
                  />
                </label>
                <p className="text-xs text-slate-500">Up to 3 photos, 4MB each.</p>
              </div>

              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((item, index) => (
                    <div key={`${item.file.name}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={item.previewUrl} alt={item.file.name} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-2 top-2 rounded-full bg-slate-950/65 p-1 text-white"
                        aria-label="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {message && (
            <p className={`text-sm font-medium ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
              {message}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary px-5 py-3">
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary inline-flex items-center gap-2 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'submitting' && <LoaderCircle size={16} className="animate-spin" />}
              <span>{status === 'submitting' ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>

        {status === 'success' && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-700">
            Your review is saved for moderation. You can close this window now.
          </div>
        )}
      </div>
    </div>
  );
}
