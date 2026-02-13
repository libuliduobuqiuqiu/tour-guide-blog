import Link from 'next/link';
import { fetchPosts } from '@/lib/api';

export default async function BlogPage() {
  let posts = [];
  try {
    posts = await fetchPosts();
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Travel Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {posts.length > 0 ? (
          posts.map((post: any) => (
            <article key={post.id} className="flex flex-col md:flex-row gap-6 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="w-full md:w-48 h-48 bg-gray-200 bg-cover bg-center flex-shrink-0" 
                style={{ backgroundImage: post.cover_image ? `url(${post.cover_image})` : 'none' }}
              >
                {!post.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">{post.category}</span>
                  <h2 className="text-2xl font-bold mt-2 mb-3">
                    <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 line-clamp-2 mb-4">{post.summary}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
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
            No blog posts yet. Stay tuned!
          </div>
        )}
      </div>
    </div>
  );
}
