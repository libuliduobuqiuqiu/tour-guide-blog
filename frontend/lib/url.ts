function normalizeRelativePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export function withPublicOrigin(path: string) {
  if (!path) return path;
  if (path.startsWith('http')) return path;
  return normalizeRelativePath(path);
}

export function withSocialImageProxy(path: string) {
  if (!path) return path;
  if (!path.startsWith('http')) return withPublicOrigin(path);

  const proxyPath = `/api/social/image?url=${encodeURIComponent(path)}`;
  return normalizeRelativePath(proxyPath);
}
