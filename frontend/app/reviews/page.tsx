import { fetchReviews } from '@/lib/api';
import ReviewsPageClient from '@/components/ReviewsPageClient';
import type { Review } from '@/lib/reviews';

export default async function GuestReviewsPage() {
  let reviews: Review[] = [];

  try {
    reviews = await fetchReviews();
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
  }

  return <ReviewsPageClient reviews={reviews} />;
}
