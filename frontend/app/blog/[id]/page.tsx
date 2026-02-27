import { fetchPost } from '@/lib/api';
import { notFound } from 'next/navigation';
import ContentRenderer from '@/components/ContentRenderer';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post;
  try {
    post = await fetchPost(String(id));
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return notFound();
  }

  const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const coverUrl = post.cover_image
    ? post.cover_image.startsWith('http')
      ? post.cover_image
      : `${HOST}${post.cover_image.startsWith('/') ? '' : '/'}${post.cover_image}`
    : '';

  return (
    <div className="py-12 md:py-16 bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <header className="mb-12 text-center fade-up">
        <span className="text-blue-700 font-semibold uppercase tracking-wider">{post.category}</span>
        <h1 className="text-4xl md:text-5xl font-semibold mt-4 mb-6 tracking-wide text-slate-900">{post.title}</h1>
        <div className="text-slate-500 flex items-center justify-center gap-4">
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          {post.tags && (
            <>
              <span>•</span>
              <div className="flex gap-2">
                {post.tags.split(',').map((tag: string) => (
                  <span key={tag} className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded text-xs">#{tag.trim()}</span>
                ))}
              </div>
            </>
          )}
        </div>
        </header>

        <div 
        className="w-full h-[400px] bg-gray-200 bg-cover bg-center rounded-2xl mb-12 elevated-card fade-up" 
        style={{ backgroundImage: post.cover_image ? `url(${coverUrl})` : 'none' }}
      >
        {!post.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
        </div>
      </div>

      <ContentRenderer content={post.content} />

      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <footer className="mt-16 pt-8 border-t border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-sky-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="font-semibold">{post.author || 'Anonymous'}</div>
              <div className="text-sm text-slate-500">Professional Tour Guide & Travel Blogger</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
