 'use client';
 
 import { useMemo, useCallback } from 'react';
 import DOMPurify from 'dompurify';
 import { marked } from 'marked';
 
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
   const { html, toc } = useMemo(() => {
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
 
     const sanitized = DOMPurify.sanitize(enhancedHtml, { USE_PROFILES: { html: true } });
     return { html: sanitized, toc: tocItems };
   }, [content]);
 
   const scrollToId = useCallback((id: string) => {
     const el = document.getElementById(id);
     if (!el) return;
     const rect = el.getBoundingClientRect();
     const top = rect.top + window.scrollY - 80;
     window.scrollTo({ top, behavior: 'smooth' });
   }, []);
 
   return (
     <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <article className="md:col-span-3 bg-white rounded-2xl shadow p-6 md:p-8">
           <div
             className="content prose prose-lg max-w-none text-gray-800"
             dangerouslySetInnerHTML={{ __html: html }}
           />
         </article>
         {toc.length > 0 && (
           <aside className="md:col-span-1">
             <div className="sticky top-8 bg-white rounded-2xl shadow p-4">
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
       <style jsx>{`
         .content img {
           max-width: 100%;
           height: auto;
           border-radius: 0.5rem;
         }
         .content pre {
           overflow-x: auto;
           padding: 1rem;
           background: #0f172a;
           color: #e2e8f0;
           border-radius: 0.5rem;
         }
         .content code {
           white-space: pre-wrap;
           word-break: break-word;
         }
         .content table {
           display: block;
           width: 100%;
           overflow-x: auto;
           border-collapse: collapse;
         }
         .content blockquote {
           border-left: 4px solid #60a5fa;
           padding-left: 1rem;
           color: #475569;
           background: #f8fafc;
         }
         .content hr {
           border: none;
           border-top: 1px solid #e5e7eb;
           margin: 2rem 0;
         }
         .content h1,
         .content h2,
         .content h3,
         .content h4 {
           scroll-margin-top: 100px;
         }
       `}</style>
     </div>
   );
 }
