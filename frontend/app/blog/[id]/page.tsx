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
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <header className="mb-12 text-center">
        <span className="text-blue-600 font-semibold uppercase tracking-wider">{post.category}</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">{post.title}</h1>
        <div className="text-gray-500 flex items-center justify-center gap-4">
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <div className="flex gap-2">
            {post.tags.split(',').map((tag: string) => (
              <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">#{tag.trim()}</span>
            ))}
          </div>
        </div>
        </header>

        <div 
        className="w-full h-[400px] bg-gray-200 bg-cover bg-center rounded-2xl mb-12" 
        style={{ backgroundImage: post.cover_image ? `url(${coverUrl})` : 'none' }}
      >
        {!post.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
        </div>
      </div>

      <ContentRenderer content={post.content} />

      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <footer className="mt-16 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">J</div>
            <div>
              <div className="font-bold">Janet</div>
              <div className="text-sm text-gray-500">Professional Tour Guide & Travel Blogger</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
