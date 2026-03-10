export const PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_API_URL || '';

export function withPublicOrigin(path: string) {
  if (!path) return path;
  if (path.startsWith('http')) return path;
  if (!PUBLIC_ORIGIN) return path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}
