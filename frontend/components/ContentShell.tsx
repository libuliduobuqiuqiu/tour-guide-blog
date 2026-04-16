'use client';

import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { sanitizeHtmlContent } from '@/lib/content';
import TourContentWithAside from '@/components/TourContentWithAside';

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
  const hasFloatingAside = variant === 'blog' && toc.length > 0;
  const shellClassName =
    variant === 'tour'
      ? 'mx-auto max-w-[1200px] px-4 pb-16 md:px-6 lg:px-8'
      : hasFloatingAside
        ? 'mx-auto max-w-[1320px] px-4 pb-16 md:px-6 lg:px-8'
        : 'mx-auto max-w-[1120px] px-4 pb-16 md:px-6 lg:px-8';
  const articleStackClassName = variant === 'tour' ? 'space-y-20 md:space-y-24' : 'space-y-8';
  const layoutClassName = hasFloatingAside
    ? 'mx-auto flex w-full items-start gap-7 xl:gap-10'
    : 'relative flex w-full gap-7 xl:gap-10';
  const articleClassName =
    variant === 'tour' ? 'min-w-0 w-full max-w-[1200px] mx-auto' : 'min-w-0 w-full max-w-[860px]';

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const tocCard =
    toc.length > 0 ? (
      <section
        className={
          variant === 'tour'
            ? 'fade-up rounded-[1.6rem] border border-slate-200/90 bg-white/96 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.36)] backdrop-blur'
            : 'rounded-[1.6rem] border border-slate-200/90 bg-white/92 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.42)] backdrop-blur'
        }
      >
        <div
          className={
            variant === 'tour'
              ? 'mb-4 text-[15px] font-black uppercase tracking-[0.24em] text-blue-700 md:text-[17px]'
              : 'mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500'
          }
        >
          {tocTitle}
        </div>
        <nav className={variant === 'tour' ? 'space-y-2.5' : 'space-y-1'}>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToId(item.id);
              }}
              className={
                variant === 'tour'
                  ? `block text-sm leading-7 text-slate-700 transition hover:text-blue-700 ${
                      item.level > 1 ? 'pl-3' : ''
                    } ${item.level > 2 ? 'pl-5 text-slate-600' : ''}`
                  : `block rounded-xl px-3 py-1.5 text-[13px] leading-5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 ${
                      item.level > 1 ? 'pl-5 text-[12px]' : ''
                    } ${item.level > 2 ? 'pl-7 text-[12px] text-slate-500' : ''}`
              }
            >
              {item.text}
            </a>
          ))}
        </nav>
      </section>
    ) : null;

  const articleNode = (
    <article className={articleClassName}>
      <div className={articleStackClassName}>
        <div className={articleFrameClassName}>
          <div className={contentClassName} dangerouslySetInnerHTML={{ __html: safeHtml }} />
        </div>
        {footer ? <div className="fade-up">{footer}</div> : null}
      </div>
    </article>
  );

  const tourAsideContent =
    variant === 'tour' && (aside || tocCard) ? (
      <>
        {aside}
        {tocCard}
      </>
    ) : null;

  return (
    <div className={shellClassName}>
      {tourAsideContent ? (
        <TourContentWithAside aside={tourAsideContent}>{articleNode}</TourContentWithAside>
      ) : (
        <div className={layoutClassName}>
          {articleNode}
          {tocCard && variant === 'blog' && (
            <aside className="hidden 2xl:block w-[320px] shrink-0">
              <div className="sticky top-24">{tocCard}</div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
