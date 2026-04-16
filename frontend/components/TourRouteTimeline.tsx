'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderRichContentHtml } from '@/lib/content';
import { withPublicOrigin } from '@/lib/url';

interface TourRoutePoint {
  title: string;
  content: string;
  image: string;
}

export default function TourRouteTimeline({ routePoints }: { routePoints: TourRoutePoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [lineMetrics, setLineMetrics] = useState<{ left: number; top: number; height: number } | null>(null);

  const items = useMemo(
    () =>
      routePoints.map((point, index) => ({
        ...point,
        title: point.title.trim() || `Stop ${index + 1}`,
        contentHtml: renderRichContentHtml(point.content || ''),
      })),
    [routePoints],
  );

  useEffect(() => {
    const updateLineMetrics = () => {
      const container = containerRef.current;
      const markers = markerRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!container || markers.length < 2) {
        setLineMetrics(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const firstRect = markers[0].getBoundingClientRect();
      const lastRect = markers[markers.length - 1].getBoundingClientRect();

      const left = firstRect.left - containerRect.left + firstRect.width / 2;
      const top = firstRect.top - containerRect.top + firstRect.height / 2;
      const bottom = lastRect.top - containerRect.top + lastRect.height / 2;

      setLineMetrics({
        left,
        top,
        height: Math.max(0, bottom - top),
      });
    };

    updateLineMetrics();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateLineMetrics()) : null;
    if (resizeObserver) {
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      markerRefs.current.forEach((marker) => {
        if (marker) resizeObserver.observe(marker);
      });
    }

    window.addEventListener('resize', updateLineMetrics);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateLineMetrics);
    };
  }, [items]);

  return (
    <div ref={containerRef} className="relative article-frame article-frame-tour fade-up">
      {lineMetrics && (
        <div
          className="absolute hidden w-px bg-slate-950 md:block"
          style={{
            left: `${lineMetrics.left}px`,
            top: `${lineMetrics.top}px`,
            height: `${lineMetrics.height}px`,
          }}
        />
      )}

      <div className="relative space-y-8 md:space-y-12">
        {items.map((point, index) => (
          <section key={`${point.title}-${index}`} className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="md:pr-1">
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-[0_22px_50px_-42px_rgba(15,23,42,0.42)]">
                <div className="relative aspect-[4/3]">
                  {point.image ? (
                    <Image
                      src={withPublicOrigin(point.image)}
                      alt={point.title}
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">No stop image</div>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 md:pl-8">
              <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 md:gap-5">
                <div className="relative flex justify-center">
                  <div
                    ref={(node) => {
                      markerRefs.current[index] = node;
                    }}
                    className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-950 bg-slate-950 text-sm font-bold text-white shadow-[0_12px_26px_-20px_rgba(15,23,42,0.72)]"
                  >
                    {index + 1}
                  </div>
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-[0.01em] text-slate-950 md:text-2xl lg:text-[1.75rem] md:leading-[1.2]">{point.title}</h2>
                  <div className="mt-4 min-w-0 max-w-full">
                    <div className="content article-content article-content-tour tour-route-content" dangerouslySetInnerHTML={{ __html: point.contentHtml }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
