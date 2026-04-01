'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: AdminPaginationProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 text-sm text-slate-500 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.45)] md:flex-row md:items-center md:justify-between">
      <p>
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="btn-secondary inline-flex items-center gap-2 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="btn-secondary inline-flex items-center gap-2 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
