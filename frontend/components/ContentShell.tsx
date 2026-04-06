'use client';

import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { sanitizeHtmlContent } from '@/lib/content';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ContentShell({
  html,
  toc,
  tocTitle = 'Contents',
  variant = 'blog',
  aside,
  footer,
}: {
  html: string;
  toc: TocItem[];
  tocTitle?: string;
  variant?: 'blog' | 'tour';
  aside?: ReactNode;
  footer?: ReactNode;
}) {
  const contentClassName = useMemo(
    () =>
      variant === 'tour'
        ? 'content article-content article-content-tour fade-up'
        : 'content article-content article-content-blog fade-up',
    [variant],
  );
  const safeHtml = useMemo(() => sanitizeHtmlContent(html), [html]);

  const articleFrameClassName =
    variant === 'tour'
      ? 'article-frame article-frame-tour'
      : 'article-frame article-frame-blog';
  const hasFloatingAside = (variant === 'tour' && Boolean(aside)) || (variant === 'blog' && toc.length > 0);
  const shellClassName =
    variant === 'tour'
      ? 'mx-auto max-w-[1280px] px-4 pb-16 md:px-6 lg:px-8'
      : hasFloatingAside
        ? 'mx-auto max-w-[1420px] px-4 pb-16 md:px-6 lg:px-8'
        : 'mx-auto max-w-[1180px] px-4 pb-16 md:px-6 lg:px-8';
  const articleStackClassName = variant === 'tour' ? 'space-y-20 md:space-y-24' : 'space-y-8';
  const layoutClassName = hasFloatingAside
    ? 'mx-auto flex max-w-fit gap-8 xl:gap-12'
    : 'relative flex gap-8 xl:gap-12';
  const articleClassName = variant === 'tour' ? 'min-w-0 w-[1280px] max-w-full' : 'min-w-0 w-[960px] max-w-full';

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <div className={shellClassName}>
      <div className={layoutClassName}>
        <article className={articleClassName}>
          <div className={articleStackClassName}>
            <div className={articleFrameClassName}>
              <div className={contentClassName} dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </div>
            {footer ? <div className="fade-up">{footer}</div> : null}
          </div>
        </article>

        {aside && variant === 'tour' && (
          <aside className="hidden xl:block w-[280px] shrink-0">
            <div className="sticky top-24 space-y-4">
              {aside}
            </div>
          </aside>
        )}

        {toc.length > 0 && (
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="sticky top-24 rounded-[1.6rem] border border-slate-200/90 bg-white/92 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.42)] backdrop-blur">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{tocTitle}</div>
              <nav className="space-y-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToId(item.id);
                    }}
                    className={`block rounded-xl px-3 py-1.5 text-[13px] leading-5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 ${
                      item.level > 1 ? 'pl-5 text-[12px]' : ''
                    } ${item.level > 2 ? 'pl-7 text-[12px] text-slate-500' : ''}`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
