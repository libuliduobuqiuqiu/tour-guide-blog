import { fetchPost } from '@/lib/api';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post;
  try {
    post = await fetchPost(String(id));
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
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
        style={{ backgroundImage: post.cover_image ? `url(${post.cover_image})` : 'none' }}
      >
        {!post.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
      </div>

      <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap">
        {post.content}
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">J</div>
          <div>
            <div className="font-bold">Janet</div>
            <div className="text-sm text-gray-500">Professional Tour Guide & Travel Blogger</div>
          </div>
        </div>
      </footer>
    </article>
  );
}
