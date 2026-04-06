'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

const DESKTOP_BREAKPOINT = 1280;
const ASIDE_WIDTH = 280;
const ASIDE_GAP = 32;
const ASIDE_TOP = 96;

export default function TourContentWithAside({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);
  const [desktopStyle, setDesktopStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    if (!aside) return;

    const updateDesktopStyle = () => {
      const container = containerRef.current;
      const asideEl = asideRef.current;
      if (!container || !asideEl || window.innerWidth < DESKTOP_BREAKPOINT) {
        setDesktopStyle(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerTop = window.scrollY + containerRect.top;
      const containerBottom = window.scrollY + containerRect.bottom;
      const asideHeight = asideEl.offsetHeight;
      const fixedLeft = containerRect.right + ASIDE_GAP;
      const absoluteLeft = container.clientWidth + ASIDE_GAP;
      const stickyStart = window.scrollY + ASIDE_TOP;
      const maxTop = Math.max(0, container.offsetHeight - asideHeight);

      if (stickyStart <= containerTop) {
        setDesktopStyle({
          position: 'absolute',
          top: 0,
          left: absoluteLeft,
          width: ASIDE_WIDTH,
        });
        return;
      }

      if (stickyStart + asideHeight >= containerBottom) {
        setDesktopStyle({
          position: 'absolute',
          top: maxTop,
          left: absoluteLeft,
          width: ASIDE_WIDTH,
        });
        return;
      }

      setDesktopStyle({
        position: 'fixed',
        top: ASIDE_TOP,
        left: fixedLeft,
        width: ASIDE_WIDTH,
      });
    };

    updateDesktopStyle();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateDesktopStyle()) : null;
    if (resizeObserver) {
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      if (asideRef.current) {
        resizeObserver.observe(asideRef.current);
      }
    }

    window.addEventListener('scroll', updateDesktopStyle, { passive: true });
    window.addEventListener('resize', updateDesktopStyle);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', updateDesktopStyle);
      window.removeEventListener('resize', updateDesktopStyle);
    };
  }, [aside]);

  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="w-full min-w-0">{children}</div>
        {aside ? (
          <aside
            ref={asideRef}
            className="hidden xl:block"
            style={desktopStyle || { position: 'absolute', top: 0, left: `calc(100% + ${ASIDE_GAP}px)`, width: ASIDE_WIDTH }}
          >
            <div className="space-y-4">{aside}</div>
          </aside>
        ) : null}
      </div>

      {aside ? (
        <div className="mx-auto mt-6 max-w-[1280px] px-4 xl:hidden md:px-6 lg:px-8">
          <div className="space-y-4">{aside}</div>
        </div>
      ) : null}
    </>
  );
}
