import { marked } from 'marked';

export function isHtmlContent(input: string) {
  return /<\/[a-z][\s\S]*?>/i.test(input);
}

export function sanitizeHtmlContent(html: string) {
  return html
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
    marked.setOptions({ breaks: true });
    rawHtml = marked.parse(rawHtml) as string;
  }
  return sanitizeHtmlContent(rawHtml);
}
