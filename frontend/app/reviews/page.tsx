import { fetchReviews } from '@/lib/api';
import GuestReviewsGrid from '@/components/GuestReviewsGrid';

interface Review {
  id: number;
  username: string;
  country: string;
  review_date: string;
  tour_route: string;
  host: string;
  content: string;
  avatar: string;
  rating: number;
}

export default async function GuestReviewsPage() {
  let reviews: Review[] = [];

  try {
    reviews = await fetchReviews();
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
  }

  return (
    <div className="py-12 md:py-16 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Guest Reviews</h1>
          <p className="mt-3 text-gray-600 text-lg">
            Read detailed feedback from travelers about routes, service quality, and host experience.
          </p>
        </header>

        <GuestReviewsGrid items={reviews} />
      </div>
    </div>
  );
}
