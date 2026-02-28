'use client';

import { useCallback, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function ContentShell({ html, toc }: { html: string; toc: TocItem[] }) {
  const [tocOpen, setTocOpen] = useState(true);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 pb-16">
      <div className="relative flex gap-8">
        {toc.length > 0 && (
          <div className="hidden lg:flex w-10 shrink-0">
            <div className="sticky top-24">
              <button
                type="button"
                onClick={() => setTocOpen((prev) => !prev)}
                className="rounded-full border border-blue-100 bg-white/80 px-2.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:text-blue-700"
                aria-label={tocOpen ? 'Hide table of contents' : 'Show table of contents'}
                title={tocOpen ? 'Hide目录' : 'Show目录'}
              >
                {tocOpen ? '‹' : '›'}
              </button>
            </div>
          </div>
        )}
        <article className="flex-1">
          <div
            className="content prose prose-lg md:prose-xl max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
        {toc.length > 0 && tocOpen && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-blue-100/80 bg-white/70 p-4 backdrop-blur">
              <div className="font-bold mb-3">目录</div>
              <nav className="space-y-2">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(item.id);
                    }}
                    className={`block text-sm hover:text-blue-600 ${item.level > 1 ? 'pl-3' : ''} ${item.level > 2 ? 'pl-6' : ''}`}
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
