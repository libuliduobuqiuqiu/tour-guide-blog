'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, X, ZoomIn } from 'lucide-react';
import type { Review } from '@/lib/reviews';
import { formatReviewMonth, getReviewInitial } from '@/lib/reviews';
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
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (selectedId === null) return null;
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  useEffect(() => {
    if (!selected && !zoomedPhoto) {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [selected, zoomedPhoto]);

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
                    {getReviewInitial(item.username)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-900">{item.username}</h3>
                    <p className="truncate text-sm text-slate-500">{item.country || 'Unknown country'}</p>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex gap-1 text-amber-500">
                  {renderStars(item.rating, 14)}
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                  {formatReviewMonth(item.review_date)}
                </p>
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
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 sm:p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="relative mx-auto my-4 flex min-h-[calc(100vh-1.5rem)] w-full max-w-5xl items-center sm:my-6 sm:min-h-[calc(100vh-2rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative max-h-[calc(100vh-1.5rem)] w-full overflow-y-auto overscroll-contain rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] shadow-[0_28px_90px_-34px_rgba(15,23,42,0.6)] sm:max-h-[calc(100vh-2rem)] sm:rounded-[2rem]">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="absolute right-4 top-4 z-20 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-500 transition-colors hover:text-slate-900 sm:right-5 sm:top-5"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className={selected.photos?.length ? 'grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]' : 'block'}>
                <div className={`bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_38%),linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-5 sm:p-7 md:p-10 ${selected.photos?.length ? 'border-b border-slate-200/80 lg:border-b-0 lg:border-r' : ''}`}>
                  <div className="mb-6 flex items-start justify-between gap-4 pr-10 sm:mb-8 sm:gap-6 sm:pr-12">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-sky-500 text-base font-semibold text-white sm:h-16 sm:w-16 sm:text-lg">
                        {getReviewInitial(selected.username)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{selected.username}</h3>
                        <p className="mt-1 text-sm text-slate-500 sm:mt-2 sm:text-base">{selected.country || 'Unknown country'}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2 sm:gap-3">
                      <div className="flex gap-1.5 text-amber-500">
                        {renderStars(selected.rating, 18)}
                      </div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:text-xs sm:tracking-[0.28em]">
                        {formatReviewMonth(selected.review_date)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/85 px-4 py-5 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.4)] sm:rounded-[1.6rem] sm:px-6 sm:py-7">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700/75 sm:mb-4 sm:text-xs sm:tracking-[0.26em]">
                      Guest Story
                    </p>
                    <div className="space-y-4 text-[0.96rem] leading-7 text-slate-700 sm:space-y-5 sm:text-[1.02rem] sm:leading-8">
                      {selected.content
                        .split(/\n+/)
                        .map((paragraph) => paragraph.trim())
                        .filter(Boolean)
                        .map((paragraph, index) => (
                          <p key={`${selected.id}-${index}`}>{paragraph}</p>
                        ))}
                    </div>
                  </div>
                </div>

                {selected.photos?.length ? (
                  <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] p-5 sm:p-7 md:p-10">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Photos</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Click any image to view it larger.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {selected.photos.map((photo, photoIndex) => (
                        <button
                          key={`${selected.id}-${photoIndex}`}
                          type="button"
                          onClick={() => setZoomedPhoto(withPublicOrigin(photo))}
                          className="group relative overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white text-left shadow-[0_18px_45px_-34px_rgba(15,23,42,0.45)] sm:rounded-[1.5rem]"
                        >
                          <img
                            src={withPublicOrigin(photo)}
                            alt={`${selected.username} review photo ${photoIndex + 1}`}
                            className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-56"
                          />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent px-4 py-4 text-white">
                            <span className="text-sm font-medium">Photo {photoIndex + 1}</span>
                            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-white/85">
                              <ZoomIn size={14} />
                              Expand
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/88 p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedPhoto(null)}
            className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 p-2 text-white"
            aria-label="Close enlarged image"
          >
            <X size={18} />
          </button>
          <img
            src={zoomedPhoto}
            alt="Enlarged review photo"
            className="max-h-[92vh] max-w-[92vw] object-contain"
          />
        </div>
      )}
    </>
  );
}
