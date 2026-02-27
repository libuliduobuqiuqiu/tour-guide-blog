'use client';

import { useMemo, useState } from 'react';
import { X, Star } from 'lucide-react';

interface Review {
  id: number;
  username: string;
  country: string;
  review_date: string;
  tour_route: string;
  host: string;
  content: string;
  avatar: string;
  rating: number;
}

function toDisplayDate(dateValue: string) {
  if (!dateValue) return 'N/A';
  const trimmed = dateValue.trim();

  // Keep plain YYYY-MM-DD values stable across SSR/CSR to avoid hydration mismatch.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampTextStyle(lines: number) {
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    WebkitLineClamp: lines,
    overflow: 'hidden',
  };
}

export default function GuestReviewsGrid({ items }: { items: Review[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = useMemo(() => {
    if (selectedId === null) return null;
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
        No guest reviews available.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((item) => (
          <article key={item.id} className="elevated-card p-6 fade-up min-h-[320px] flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-white overflow-hidden shrink-0 flex items-center justify-center font-semibold">
                  {item.username?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.username}</h3>
                  <p className="text-xs text-gray-500 truncate">{item.country || 'Unknown country'}</p>
                </div>
              </div>

              <div className="flex text-amber-500 shrink-0">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={14} fill={idx < item.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p>Date: {toDisplayDate(item.review_date)}</p>
              <p style={clampTextStyle(1)}>Tour: {item.tour_route || 'N/A'}</p>
              <p style={clampTextStyle(1)}>Host: {item.host || 'N/A'}</p>
            </div>

            <p className="text-gray-700 text-sm leading-6" style={clampTextStyle(4)}>
              {item.content}
            </p>

            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-sm self-start mt-auto"
              onClick={() => setSelectedId(item.id)}
            >
              View details
            </button>
          </article>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selected.username}</h3>
                <p className="text-gray-500 mt-1">{selected.country || 'Unknown country'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-1 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex text-amber-500 mb-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} size={18} fill={idx < selected.rating ? 'currentColor' : 'none'} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-5">
              <p>Date: {toDisplayDate(selected.review_date)}</p>
              <p>Tour: {selected.tour_route || 'N/A'}</p>
              <p>Host: {selected.host || 'N/A'}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-gray-800 leading-7 whitespace-pre-wrap">
              {selected.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
