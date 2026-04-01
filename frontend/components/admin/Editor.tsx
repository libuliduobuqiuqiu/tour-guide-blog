'use client';

import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { uploadAdminImage } from '@/lib/admin-upload';
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const pendingInsertIndexRef = useRef<number | null>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const resizeStateRef = useRef<{ startX: number; startWidth: number; editorWidth: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImageBox, setSelectedImageBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const toolbarId = useId().replace(/:/g, '');
  const isUploading = uploadingCount > 0;

  const updateSelectedImageBox = useCallback(() => {
    const image = selectedImageRef.current;
    const shell = editorShellRef.current;
    if (!image || !shell) {
      setSelectedImageBox(null);
      return;
    }

    const imageRect = image.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    setSelectedImageBox({
      top: imageRect.top - shellRect.top + shell.scrollTop,
      left: imageRect.left - shellRect.left + shell.scrollLeft,
      width: imageRect.width,
      height: imageRect.height,
    });
  }, []);

  const clearSelectedImage = useCallback(() => {
    if (selectedImageRef.current) {
      selectedImageRef.current.classList.remove('admin-quill-image-selected');
    }
    selectedImageRef.current = null;
    resizeStateRef.current = null;
    setSelectedImageBox(null);
  }, []);

  const syncEditorHtml = useCallback(() => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;
    onChange(editor.root.innerHTML);
  }, [onChange]);

  const selectImage = useCallback((image: HTMLImageElement) => {
    if (selectedImageRef.current === image) {
      updateSelectedImageBox();
      return;
    }

    clearSelectedImage();
    selectedImageRef.current = image;
    image.classList.add('admin-quill-image-selected');
    updateSelectedImageBox();
  }, [clearSelectedImage, updateSelectedImageBox]);

  const insertImageAt = useCallback(async (file: File, preferredIndex?: number) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    setUploadError(null);
    setUploadingCount((count) => count + 1);

    try {
      const imageUrl = await uploadAdminImage(file);
      editor.focus();

      const selection = editor.getSelection(true);
      const fallbackIndex = Math.max(0, editor.getLength() - 1);
      const index = preferredIndex ?? selection?.index ?? fallbackIndex;

      editor.insertEmbed(index, 'image', imageUrl, 'user');
      editor.setSelection(index + 1, 0, 'silent');
      const insertedImage = editor.root.querySelector(`img[src="${CSS.escape(imageUrl)}"]`);
      if (insertedImage instanceof HTMLImageElement) {
        insertedImage.draggable = false;
        insertedImage.style.width = '100%';
        insertedImage.style.maxWidth = '100%';
        insertedImage.style.height = 'auto';
        selectImage(insertedImage);
      }
      syncEditorHtml();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image upload failed';
      setUploadError(message);
    } finally {
      setUploadingCount((count) => Math.max(0, count - 1));
    }
  }, [selectImage, syncEditorHtml]);

  const insertImages = useCallback(async (files: FileList | File[], preferredIndex?: number) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    let nextIndex = preferredIndex;
    for (const file of imageFiles) {
      await insertImageAt(file, nextIndex);
      if (typeof nextIndex === 'number') {
        nextIndex += 1;
      }
    }
  }, [insertImageAt]);

  const openImagePicker = useCallback(() => {
    setUploadError(null);
    const editor = quillRef.current?.getEditor?.();
    if (editor) {
      const selection = editor.getSelection(true);
      const fallbackIndex = Math.max(0, editor.getLength() - 1);
      pendingInsertIndexRef.current = selection?.index ?? fallbackIndex;
    } else {
      pendingInsertIndexRef.current = 0;
    }
    fileInputRef.current?.click();
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: `#${toolbarId}`,
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

      const imageFiles = Array.from(clipboard.files).filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        event.preventDefault();
        const selection = editor.getSelection(true);
        const fallbackIndex = Math.max(0, editor.getLength() - 1);
        const index = selection?.index ?? fallbackIndex;
        void insertImages(imageFiles, index);
        return;
      }

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
  }, [insertImages]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor?.();
    const root = editor?.root as HTMLElement | undefined;
    if (!editor || !root) return;

    const handleDragOver = (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;
      if (!Array.from(files).some((file) => file.type.startsWith('image/'))) return;

      event.preventDefault();
      event.dataTransfer!.dropEffect = 'copy';
    };

    const handleDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      event.preventDefault();

      const selection = editor.getSelection(true);
      const fallbackIndex = Math.max(0, editor.getLength() - 1);
      const index = selection?.index ?? fallbackIndex;
      void insertImages(imageFiles, index);
    };

    root.addEventListener('dragover', handleDragOver);
    root.addEventListener('drop', handleDrop);

    return () => {
      root.removeEventListener('dragover', handleDragOver);
      root.removeEventListener('drop', handleDrop);
    };
  }, [insertImages]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor?.();
    const root = editor?.root as HTMLElement | undefined;
    if (!editor || !root) return;

    const handleClick = (event: MouseEvent) => {
      if (event.target instanceof HTMLImageElement) {
        selectImage(event.target);
        return;
      }

      clearSelectedImage();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelectedImage();
      }
    };

    const handleDragStart = (event: DragEvent) => {
      if (event.target instanceof HTMLImageElement) {
        event.preventDefault();
      }
    };

    root.addEventListener('click', handleClick);
    root.addEventListener('keydown', handleKeyDown);
    root.addEventListener('dragstart', handleDragStart);

    return () => {
      root.removeEventListener('click', handleClick);
      root.removeEventListener('keydown', handleKeyDown);
      root.removeEventListener('dragstart', handleDragStart);
    };
  }, [clearSelectedImage, selectImage]);

  useEffect(() => {
    const editor = quillRef.current?.getEditor?.();
    const root = editor?.root as HTMLElement | undefined;
    const shell = editorShellRef.current;
    if (!root || !shell) return;

    const handleScroll = () => updateSelectedImageBox();
    const handleResize = () => updateSelectedImageBox();

    root.addEventListener('scroll', handleScroll);
    shell.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      root.removeEventListener('scroll', handleScroll);
      shell.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateSelectedImageBox]);

  useEffect(() => {
    if (!selectedImageRef.current) return;
    updateSelectedImageBox();
  }, [value, updateSelectedImageBox]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const shell = editorShellRef.current;
      if (!shell) return;
      if (shell.contains(event.target as Node)) return;
      clearSelectedImage();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [clearSelectedImage]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = resizeStateRef.current;
      const image = selectedImageRef.current;
      if (!resizeState || !image) return;

      event.preventDefault();
      const deltaX = event.clientX - resizeState.startX;
      const nextWidthPx = Math.min(resizeState.editorWidth, Math.max(120, resizeState.startWidth + deltaX));
      const nextWidthPercent = (nextWidthPx / resizeState.editorWidth) * 100;
      image.style.width = `${Math.min(100, Math.max(20, nextWidthPercent))}%`;
      image.style.maxWidth = '100%';
      image.style.height = 'auto';
      updateSelectedImageBox();
    };

    const handlePointerUp = () => {
      if (!resizeStateRef.current) return;
      resizeStateRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      syncEditorHtml();
      updateSelectedImageBox();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [syncEditorHtml, updateSelectedImageBox]);

  const editorContent = (
    <div className={isFullscreen ? 'flex h-full flex-col rounded-[1.6rem] bg-white p-4 shadow-[0_32px_96px_-40px_rgba(15,23,42,0.82)] md:p-6' : 'bg-white'}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) {
            const index = pendingInsertIndexRef.current ?? 0;
            pendingInsertIndexRef.current = null;
            void insertImages(files, index);
          } else {
            pendingInsertIndexRef.current = null;
          }
          event.target.value = '';
        }}
      />
      {(isUploading || uploadError) ? (
        <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {isUploading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Uploading image{uploadingCount > 1 ? 's' : ''}...
            </span>
          ) : null}
          {uploadError ? (
            <span className={isUploading ? 'ml-3 text-rose-600' : 'text-rose-600'}>
              {uploadError}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        ref={editorShellRef}
        className={`admin-quill-shell ${isFullscreen ? 'admin-quill-shell-fullscreen' : 'admin-quill-shell-default'}`}
      >
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
            <button type="button" onClick={openImagePicker} aria-label="Image" title="Upload image">
              <svg viewBox="0 0 18 18">
                <rect className="ql-stroke" height="10" width="12" x="3" y="4" />
                <circle className="ql-fill" cx="6" cy="7" r="1" />
                <polyline className="ql-even ql-fill" points="5 13 8 10 10 12 13 9 15 11 15 13 5 13" />
              </svg>
            </button>
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
        {selectedImageBox ? (
          <div
            className="admin-quill-image-overlay"
            style={{
              top: `${selectedImageBox.top}px`,
              left: `${selectedImageBox.left}px`,
              width: `${selectedImageBox.width}px`,
              height: `${selectedImageBox.height}px`,
            }}
          >
            <button
              type="button"
              aria-label="Resize image"
              title="Drag to resize"
              className="admin-quill-image-resize-handle"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const image = selectedImageRef.current;
                const editor = quillRef.current?.getEditor?.();
                if (!image || !editor) return;

                image.draggable = false;
                if (event.currentTarget.setPointerCapture) {
                  event.currentTarget.setPointerCapture(event.pointerId);
                }
                document.body.style.cursor = 'nwse-resize';
                document.body.style.userSelect = 'none';

                resizeStateRef.current = {
                  startX: event.clientX,
                  startWidth: image.getBoundingClientRect().width,
                  editorWidth: editor.root.clientWidth,
                };
              }}
            />
          </div>
        ) : null}
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
