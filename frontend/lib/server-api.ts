const DEFAULT_INTERNAL_API_ORIGIN = 'http://127.0.0.1:8080';

function normalizeApiBase(origin: string) {
  return origin.endsWith('/api') ? origin : `${origin}/api`;
}

export function getServerApiBaseUrl() {
  const origin =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_INTERNAL_API_ORIGIN;

  return normalizeApiBase(origin);
}
