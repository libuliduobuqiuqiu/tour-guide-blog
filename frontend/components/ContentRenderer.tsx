import type { ReactNode } from 'react';
import ContentShell from '@/components/ContentShell';
import { isHtmlContent, renderRichContentHtml } from '@/lib/content';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function getPlainHeadingText(inner: string) {
  return decodeHtmlEntities(
    inner
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#`>*_[\]~]/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

export default function ContentRenderer({
  content,
  toc = true,
  tocTitle = 'Contents',
  variant = 'blog',
  aside,
  footer,
}: {
  content: string;
  toc?: boolean;
  tocTitle?: string;
  variant?: 'blog' | 'tour';
  aside?: ReactNode;
  footer?: ReactNode;
}) {
  let rawHtml = content || '';
  if (!isHtmlContent(rawHtml)) {
    rawHtml = renderRichContentHtml(rawHtml);
  }

  const tocItems: TocItem[] = [];
  const headingRegex = /<h([1-4])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  const enhancedHtml = rawHtml.replace(headingRegex, (_match, levelStr, attrs, inner) => {
    const level = parseInt(levelStr, 10);
    const plainText = getPlainHeadingText(inner);
    const id = slugify(plainText);

    if (plainText) {
      tocItems.push({ id, text: plainText, level });
    }

    const cls = `article-heading article-heading-${level}`;
    const hasClass = /\bclass=/.test(attrs);
    const newAttrs = hasClass
      ? attrs.replace(/class=(['"])(.*?)\1/i, (_m: string, q: string, val: string) => `class=${q}${val} ${cls}${q}`)
      : `${attrs} class="${cls}"`;
    return `<h${level}${newAttrs} id="${id}">${inner}</h${level}>`;
  });

  return <ContentShell html={enhancedHtml} toc={toc ? tocItems : []} tocTitle={tocTitle} variant={variant} aside={aside} footer={footer} />;
}
