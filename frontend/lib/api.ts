const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_BASE_URL = API_HOST.endsWith('/api') ? API_HOST : `${API_HOST}/api`;

export async function fetchTours() {
  const res = await fetch(`${API_BASE_URL}/tours`);
  if (!res.ok) throw new Error('Failed to fetch tours');
  return res.json();
}

export async function fetchTour(id: string) {
  const res = await fetch(`${API_BASE_URL}/tours/${id}`);
  if (!res.ok) throw new Error('Failed to fetch tour');
  return res.json();
}

export async function fetchPosts(tag?: string) {
  const url = tag 
    ? `${API_BASE_URL}/posts?tag=${encodeURIComponent(tag)}`
    : `${API_BASE_URL}/posts`;
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

export async function sendContactMessage(data: any) {
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
