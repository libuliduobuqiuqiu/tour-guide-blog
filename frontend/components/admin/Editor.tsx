'use client';

import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Maximize2, Minimize2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface QuillEditorInstance {
  root: HTMLElement;
  getLength: () => number;
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  setSelection: (index: number, length: number, source?: string) => void;
  focus: () => void;
  insertEmbed: (index: number, type: string, value: string, source?: string) => void;
  clipboard: {
    dangerouslyPasteHTML: (index: number, html: string, source?: string) => void;
  };
}

interface ReactQuillInstance {
  getEditor: () => QuillEditorInstance;
}

function looksLikeMarkdown(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  return [
    /^#{1,6}\s/m,
    /^\s*[-*+]\s/m,
    /^\s*\d+\.\s/m,
    /^\s*>\s/m,
    /```/,
    /\*\*[^*]+\*\*/,
    /_[^_]+_/,
    /`[^`]+`/,
    /\[[^\]]+\]\([^)]+\)/,
  ].some((pattern) => pattern.test(trimmed));
}

export default function Editor({ value, onChange }: EditorProps) {
  const quillRef = useRef<ReactQuillInstance | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toolbarId = useId().replace(/:/g, '');

  const modules = useMemo(() => ({
    toolbar: {
      container: `#${toolbarId}`,
      handlers: {
        image: () => {
          const editor = quillRef.current?.getEditor?.();
          if (!editor) return;

          const imageUrl = window.prompt('Enter image URL');
          if (!imageUrl) return;

          const trimmedUrl = imageUrl.trim();
          if (!trimmedUrl) return;

          editor.focus();
          const selection = editor.getSelection(true);
          const fallbackIndex = Math.max(0, editor.getLength() - 1);
          const index = selection?.index ?? fallbackIndex;
          editor.insertEmbed(index, 'image', trimmedUrl, 'user');
          editor.setSelection(index + 1, 0, 'silent');
        },
      },
    },
  }), [toolbarId]);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor?.();
    const root = editor?.root as HTMLElement | undefined;
    if (!editor || !root) return;

    const handlePaste = (event: ClipboardEvent) => {
      const clipboard = event.clipboardData;
      if (!clipboard) return;

      const html = clipboard.getData('text/html');
      const text = clipboard.getData('text/plain');
      if (html || !looksLikeMarkdown(text)) return;

      event.preventDefault();

      const selection = editor.getSelection(true);
      const index = selection ? selection.index : editor.getLength();
      const rendered = marked.parse(text);
      const sanitized = DOMPurify.sanitize(typeof rendered === 'string' ? rendered : '');

      editor.clipboard.dangerouslyPasteHTML(index, sanitized, 'user');
      const nextLength = editor.getLength();
      editor.setSelection(Math.min(nextLength, index + text.length), 0, 'silent');
    };

    root.addEventListener('paste', handlePaste);
    return () => root.removeEventListener('paste', handlePaste);
  }, []);

  const editorContent = (
    <div className={isFullscreen ? 'flex h-full flex-col rounded-[1.6rem] bg-white p-4 shadow-[0_32px_96px_-40px_rgba(15,23,42,0.82)] md:p-6' : 'bg-white'}>
      <div className="mb-3 px-1 text-xs font-medium text-slate-500">
        Paste Markdown directly and it will auto-convert to rich text.
      </div>
      <div className={`admin-quill-shell ${isFullscreen ? 'admin-quill-shell-fullscreen' : 'admin-quill-shell-default'}`}>
        <div id={toolbarId} className="admin-quill-toolbar ql-toolbar ql-snow">
          <span className="ql-formats">
            <select className="ql-header" defaultValue="">
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="">Body</option>
            </select>
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-bold" aria-label="Bold" />
            <button type="button" className="ql-italic" aria-label="Italic" />
            <button type="button" className="ql-underline" aria-label="Underline" />
            <button type="button" className="ql-strike" aria-label="Strike" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-list" value="ordered" aria-label="Ordered list" />
            <button type="button" className="ql-list" value="bullet" aria-label="Bullet list" />
            <button type="button" className="ql-blockquote" aria-label="Blockquote" />
            <button type="button" className="ql-code-block" aria-label="Code block" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-link" aria-label="Link" />
            <button type="button" className="ql-image" aria-label="Image" />
            <button type="button" className="ql-clean" aria-label="Clean formatting" />
          </span>
          <button
            type="button"
            onClick={() => setIsFullscreen((current) => !current)}
            className="admin-quill-fullscreen-button"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          className={`admin-quill ${isFullscreen ? 'admin-quill-fullscreen' : 'admin-quill-default'}`}
        />
      </div>
    </div>
  );

  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[180] bg-slate-950/55 p-4 md:p-6">
        {editorContent}
      </div>,
      document.body,
    );
  }

  return editorContent;
}
