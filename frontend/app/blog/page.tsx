import Link from 'next/link';
import { fetchPosts } from '@/lib/api';

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  let posts = [];
  try {
    posts = await fetchPosts(tag);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
  const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        {tag ? `Travel Blog - Tag: ${tag}` : 'Travel Blog'}
      </h1>
      {tag && (
        <div className="text-center mb-8">
          <Link href="/blog" className="text-blue-600 hover:underline">
            View All Posts
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {posts.length > 0 ? (
          posts.map((post: any) => (
            <article key={post.id} className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="w-full md:w-48 h-48 bg-gray-200 bg-cover bg-center flex-shrink-0" 
                style={{ 
                  backgroundImage: post.cover_image 
                    ? `url(${post.cover_image.startsWith('http') ? post.cover_image : `${HOST}${post.cover_image.startsWith('/') ? '' : '/'}${post.cover_image}`})` 
                    : 'none' 
                }}
              >
                {!post.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
              </div>
              <div className="p-6 flex flex-col justify-between w-full">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">{post.category}</span>
                    <span className="text-xs text-gray-500">{post.author}</span>
                  </div>
                  <h2 className="text-2xl font-bold mt-2 mb-3">
                    <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 line-clamp-2 mb-4">{post.summary}</p>
                  
                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.split(',').map((t: string) => (
                        <Link 
                          key={t} 
                          href={`/blog?tag=${t.trim()}`} 
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          {t.trim()}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <Link href={`/blog/${post.id}`} className="font-semibold text-blue-600 hover:underline">
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-2 text-center text-gray-500 py-12">
            No blog posts found{tag ? ` for tag "${tag}"` : ''}.
          </div>
        )}
      </div>
    </div>
  );
}
