const isBrowser = typeof window !== 'undefined';
const API_HOST = isBrowser
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:8080');
const API_BASE_URL = API_HOST
  ? (API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`)
  : '/api';

export async function fetchTours() {
  const res = await fetch(`${API_BASE_URL}/tours?with_content=false`);
  if (!res.ok) throw new Error('Failed to fetch tours');
  return res.json();
}

export async function fetchTour(id: string) {
  const res = await fetch(`${API_BASE_URL}/tours/${id}`);
  if (!res.ok) throw new Error('Failed to fetch tour');
  return res.json();
}

export async function fetchPosts(tag?: string) {
  const query = new URLSearchParams({ with_content: 'false' });
  if (tag) query.set('tag', tag);
  const url = `${API_BASE_URL}/posts?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function fetchPost(id: string) {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export async function fetchCarousels() {
  const res = await fetch(`${API_BASE_URL}/carousels?active=true`);
  if (!res.ok) throw new Error('Failed to fetch carousels');
  return res.json();
}

export async function fetchReviews() {
  const res = await fetch(`${API_BASE_URL}/reviews?active=true`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function fetchSocialFeed() {
  const res = await fetch(`${API_BASE_URL}/social/feed`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch social feed');
  return res.json();
}

export async function sendContactMessage(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchConfig(key: string) {
  const res = await fetch(`${API_BASE_URL}/config/${key}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}
