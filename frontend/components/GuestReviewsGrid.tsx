'use client';

import type { Review } from '@/lib/reviews';
import ReviewCards from '@/components/ReviewCards';

export default function GuestReviewsGrid({ items }: { items: Review[] }) {
  return <ReviewCards items={items} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />;
}
