import Link from 'next/link';
import { fetchPosts } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  summary: string;
  cover_image?: string;
  author?: string;
  category?: string;
  tags?: string;
  created_at: string;
}

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  let posts: Post[] = [];
  try {
    posts = await fetchPosts(tag);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }
  const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="py-12 md:py-16 bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="max-w-[1400px] mx-auto px-3 md:px-4 lg:px-6">
        <header className="mb-10 fade-up">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-wide text-slate-900">
            {tag ? `Travel Blog - Tag: ${tag}` : 'Travel Blog'}
          </h1>
          <p className="mt-3 text-slate-600 text-lg">
            Stories, local tips, and practical guides to help you explore each destination with confidence.
          </p>
          {tag && (
            <div className="mt-5">
              <Link href="/blog" className="btn-secondary px-4 py-2 text-sm inline-flex">
                View All Posts
              </Link>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="elevated-card overflow-hidden fade-up min-h-[460px] flex flex-col">
              <div
                className="w-full h-56 bg-gray-200 bg-cover bg-center"
                style={{
                  backgroundImage: post.cover_image
                    ? `url(${post.cover_image.startsWith('http') ? post.cover_image : `${HOST}${post.cover_image.startsWith('/') ? '' : '/'}${post.cover_image}`})`
                    : "url('https://images.unsplash.com/photo-1495435229349-e86db7bfa013?auto=format&fit=crop&w=900&q=80')",
                }}
              >
                {!post.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-blue-700 font-semibold uppercase tracking-wider">{post.category}</span>
                    <span className="text-xs text-slate-500">{post.author}</span>
                  </div>
                  <h2 className="text-2xl font-semibold mt-2 mb-3 text-slate-900">
                    <Link href={`/blog/${post.id}`} className="hover:text-blue-700 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-slate-600 line-clamp-3 mb-4">{post.summary}</p>

                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.split(',').map((t: string) => (
                        <Link
                          key={t}
                          href={`/blog?tag=${t.trim()}`}
                          className="text-xs bg-blue-50 border border-blue-100 px-2 py-1 rounded-full text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          {t.trim()}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500 mt-auto pt-2">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <Link href={`/blog/${post.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-12">
            No blog posts found{tag ? ` for tag "${tag}"` : ''}.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
