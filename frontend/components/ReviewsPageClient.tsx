'use client';

import { useState } from 'react';
import GuestReviewsGrid from '@/components/GuestReviewsGrid';
import ReviewSubmissionModal from '@/components/ReviewSubmissionModal';
import type { Review } from '@/lib/reviews';

export default function ReviewsPageClient({ reviews }: { reviews: Review[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="py-12 md:py-16 bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="max-w-[1400px] mx-auto px-3 md:px-4 lg:px-6">
        <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between fade-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-wide">Reviews</h1>
            <p className="mt-3 text-slate-600 text-lg">
              Read detailed feedback from our travelers.
            </p>
          </div>

          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary px-5 py-3">
            Add Review
          </button>
        </header>

        <GuestReviewsGrid items={reviews} />
      </div>

      {modalOpen && <ReviewSubmissionModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
