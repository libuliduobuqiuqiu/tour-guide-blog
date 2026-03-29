import { fetchReviews } from '@/lib/api';
import GuestReviewsGrid from '@/components/GuestReviewsGrid';
import type { Review } from '@/lib/reviews';

export default async function GuestReviewsPage() {
  let reviews: Review[] = [];

  try {
    reviews = await fetchReviews();
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
  }

  return (
    <div className="py-12 md:py-16 bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="max-w-[1400px] mx-auto px-3 md:px-4 lg:px-6">
        <header className="mb-10 fade-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-wide">Guest Reviews</h1>
          <p className="mt-3 text-slate-600 text-lg">
            Read detailed feedback from travelers about the pace, service quality, and overall experience.
          </p>
        </header>

        <GuestReviewsGrid items={reviews} />
      </div>
    </div>
  );
}
