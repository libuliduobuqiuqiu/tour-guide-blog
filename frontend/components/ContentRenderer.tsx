import { marked } from 'marked';
import ContentShell from '@/components/ContentShell';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function isHtml(input: string) {
  return /<\/[a-z][\s\S]*?>/i.test(input);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export default function ContentRenderer({ content }: { content: string }) {
  let rawHtml = content || '';
  if (!isHtml(rawHtml)) {
    marked.setOptions({ breaks: true });
    rawHtml = marked.parse(rawHtml) as string;
  }

  const tocItems: TocItem[] = [];
  const headingRegex = /<h([1-4])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  const enhancedHtml = rawHtml.replace(headingRegex, (_match, levelStr, attrs, inner) => {
    const level = parseInt(levelStr, 10);
    const plainText = inner.replace(/<[^>]+>/g, '').trim();
    const id = slugify(plainText);
    tocItems.push({ id, text: plainText, level });
    const cls =
      level === 1
        ? 'border-b-4 border-blue-600 pb-2 mt-8 mb-4'
        : level === 2
        ? 'border-b-2 border-blue-500 pb-2 mt-6 mb-3'
        : level === 3
        ? 'border-b border-blue-400 pb-1 mt-4 mb-2'
        : 'mt-3 mb-2';
    const hasClass = /\bclass=/.test(attrs);
    const newAttrs = hasClass
      ? attrs.replace(/class=(['"])(.*?)\1/i, (_m: string, q: string, val: string) => `class=${q}${val} ${cls}${q}`)
      : `${attrs} class="${cls}"`;
    return `<h${level}${newAttrs} id="${id}">${inner}</h${level}>`;
  });

  return <ContentShell html={enhancedHtml} toc={tocItems} />;
}
