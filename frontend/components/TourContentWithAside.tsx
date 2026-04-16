'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

const DESKTOP_BREAKPOINT = 1536;
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
  const [canFloatAside, setCanFloatAside] = useState(false);

  useEffect(() => {
    if (!aside) return;

    const updateDesktopStyle = () => {
      const container = containerRef.current;
      const asideEl = asideRef.current;
      const compactAside = window.innerWidth < 1700;
      const asideWidth = compactAside ? 228 : ASIDE_WIDTH;
      const asideGap = compactAside ? 16 : ASIDE_GAP;
      if (!container || !asideEl || window.innerWidth < DESKTOP_BREAKPOINT) {
        setCanFloatAside(false);
        setDesktopStyle(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const availableRightSpace = window.innerWidth - containerRect.right - asideGap;
      if (availableRightSpace < asideWidth) {
        setCanFloatAside(false);
        setDesktopStyle(null);
        return;
      }

      setCanFloatAside(true);
      const containerTop = window.scrollY + containerRect.top;
      const containerBottom = window.scrollY + containerRect.bottom;
      const asideHeight = asideEl.offsetHeight;
      const fixedLeft = containerRect.right + asideGap;
      const absoluteLeft = container.clientWidth + asideGap;
      const stickyStart = window.scrollY + ASIDE_TOP;
      const maxTop = Math.max(0, container.offsetHeight - asideHeight);

      if (stickyStart <= containerTop) {
        setDesktopStyle({
          position: 'absolute',
          top: 0,
          left: absoluteLeft,
          width: asideWidth,
        });
        return;
      }

      if (stickyStart + asideHeight >= containerBottom) {
        setDesktopStyle({
          position: 'absolute',
          top: maxTop,
          left: absoluteLeft,
          width: asideWidth,
        });
        return;
      }

      setDesktopStyle({
        position: 'fixed',
        top: ASIDE_TOP,
        left: fixedLeft,
        width: asideWidth,
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
            className="hidden 2xl:block"
            style={
              canFloatAside
                ? desktopStyle || { position: 'absolute', top: 0, left: `calc(100% + ${ASIDE_GAP}px)`, width: ASIDE_WIDTH }
                : {
                    position: 'absolute',
                    top: 0,
                    left: `calc(100% + ${ASIDE_GAP}px)`,
                    width: ASIDE_WIDTH,
                    visibility: 'hidden',
                    pointerEvents: 'none',
                  }
            }
          >
            <div className="space-y-4">{aside}</div>
          </aside>
        ) : null}
      </div>

      {aside && !canFloatAside ? (
        <div className="mx-auto mt-6 max-w-[1200px] px-4 md:px-6 lg:px-8">
          <div className="space-y-4">{aside}</div>
        </div>
      ) : null}
    </>
  );
}
