'use client';

import { useMemo, useState } from 'react';
import { Star, X } from 'lucide-react';
import type { Review } from '@/lib/reviews';
import { formatReviewMonth } from '@/lib/reviews';
import { withPublicOrigin } from '@/lib/url';

function renderStars(rating: number, size: number) {
  return Array.from({ length: 5 }).map((_, idx) => (
    <Star
      key={idx}
      size={size}
      className={idx < rating ? 'fill-current' : ''}
    />
  ));
}

export default function ReviewCards({
  items,
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}: {
  items: Review[];
  columns?: string;
}) {
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
      <div className={`grid ${columns} gap-7`}>
        {items.map((item, index) => (
          <article
            key={item.id}
            className="elevated-card fade-up group relative cursor-pointer overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,251,255,0.98)_68%,rgba(242,247,255,0.98)_100%)] p-7 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.38)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-30px_rgba(15,23,42,0.45)]"
            style={{ animationDelay: `${index * 120}ms` }}
            onClick={() => setSelectedId(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedId(item.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />

            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-base font-semibold text-white">
                    {item.avatar ? (
                      <img
                        src={withPublicOrigin(item.avatar)}
                        alt={item.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.username?.charAt(0)?.toUpperCase() || 'G'
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-900">{item.username}</h3>
                    <p className="truncate text-sm text-slate-500">{item.country || 'Unknown country'}</p>
                  </div>
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                  {formatReviewMonth(item.review_date)}
                </p>
              </div>

              <div className="flex shrink-0 gap-1 text-amber-500">
                {renderStars(item.rating, 14)}
              </div>
            </div>

            <p className="line-clamp-4 text-sm leading-7 text-slate-700">
              {item.content}
            </p>
          </article>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.55)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:text-slate-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mb-6 flex items-start justify-between gap-4 pr-12">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                  {formatReviewMonth(selected.review_date)}
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">{selected.username}</h3>
                <p className="mt-1 text-sm text-slate-500">{selected.country || 'Unknown country'}</p>
              </div>
              <div className="flex shrink-0 gap-1 text-amber-500">
                {renderStars(selected.rating, 18)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/90 p-5 text-base leading-8 text-slate-700 whitespace-pre-wrap">
              {selected.content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
