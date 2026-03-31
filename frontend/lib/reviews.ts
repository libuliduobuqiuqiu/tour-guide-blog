export interface Review {
  id: number;
  username: string;
  country: string;
  review_date: string | null;
  tour_route: string;
  host: string;
  content: string;
  avatar: string;
  photos: string[];
  rating: number;
  sort_order?: number;
  is_active?: boolean;
}

export function formatReviewMonth(dateValue: string | null | undefined) {
  if (!dateValue) return 'N/A';
  const trimmed = dateValue.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})/);
  if (match) return `${match[1]}.${match[2]}`;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
}

export function getReviewInitial(name: string | null | undefined) {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'G';
}
