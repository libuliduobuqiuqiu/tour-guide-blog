'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

export default function AdminModal({
  open,
  title,
  onClose,
  children,
  maxWidthClassName = 'max-w-3xl',
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="admin-modal-overlay fade-in px-4 py-8 md:px-8 md:py-10" onClick={onClose}>
      <div className={`mx-auto flex min-h-full w-full items-center ${maxWidthClassName}`}>
        <div className="admin-modal-card scale-in w-full" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 md:px-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">Detail editing panel with unified admin interactions.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-6 md:px-8 md:py-7">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
