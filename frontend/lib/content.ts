import { marked } from 'marked';

export function isHtmlContent(input: string) {
  return /<\/[a-z][\s\S]*?>/i.test(input);
}

export function normalizeRichTextHtml(html: string) {
  return (html || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/\u00ad/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/&#173;/gi, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/<wbr\s*\/?>/gi, '')
    .replace(/\sstyle\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\sstyle\s*=\s*[^\s>]+/gi, '')
    .replace(/\sclass\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\sclass\s*=\s*[^\s>]+/gi, '')
    .replace(/<\/?span[^>]*>/gi, '');
}

export function sanitizeHtmlContent(html: string) {
  return normalizeRichTextHtml(html)
    .replace(/&shy;/gi, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|meta|link|form|input|button|textarea|select)[^>]*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|meta|link|form|input|button|textarea|select)[^>]*?\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src)\s*=\s*(['"])\s*data:text\/html[\s\S]*?\2/gi, ' $1="#"');
}

export function renderRichContentHtml(content: string) {
  let rawHtml = content || '';
  if (!isHtmlContent(rawHtml)) {
    marked.setOptions({ breaks: false });
    rawHtml = marked.parse(rawHtml) as string;
  }
  return sanitizeHtmlContent(rawHtml);
}
