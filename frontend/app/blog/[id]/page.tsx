import { fetchPost } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ContentRenderer from '@/components/ContentRenderer';
import { withPublicOrigin } from '@/lib/url';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post;
  try {
    post = await fetchPost(String(id));
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return notFound();
  }

  const coverUrl = post.cover_image ? withPublicOrigin(post.cover_image) : '';
  const authorCard = (
    <footer className="pt-2">
      <div className="rounded-[1.6rem] border border-slate-200/90 bg-white/96 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.36)] backdrop-blur">
        <div className="mb-4 text-[15px] font-black uppercase tracking-[0.24em] text-blue-700 md:text-[17px]">Author</div>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-sky-700 text-xl font-semibold text-white">
            {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="font-semibold text-slate-950">{post.author || 'Anonymous'}</div>
            <div className="text-sm text-slate-500">Professional Tour Guide & Travel Blogger</div>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fc_48%,#eef3f9_100%)]">
      <div className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6 md:pt-8 lg:px-8">
        <div className="reveal-down relative overflow-hidden rounded-[2rem] border border-white/75 bg-slate-200 shadow-[0_34px_90px_-54px_rgba(15,23,42,0.52)]">
          <div className="relative aspect-[16/9] min-h-[280px] md:aspect-[2/1] md:min-h-[440px]">
            {post.cover_image ? (
              <Image
                src={coverUrl}
                alt={post.title}
                fill
                unoptimized
                priority
                className="object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0.28)_100%)]" />
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-14 max-w-[1200px] px-4 pt-0 md:-mt-16 md:px-6 lg:px-8">
        <header className="scale-in relative z-10 mb-12 rounded-[2rem] border border-white/70 bg-white/88 px-5 py-7 text-center shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur md:px-8 md:py-9">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {post.category && <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{post.category}</span>}
            <span>{formatDate(post.created_at)}</span>
          </div>
          <h1 className="mx-auto mb-5 max-w-4xl text-[clamp(1.45rem,1.05rem+1.5vw,2.62rem)] font-semibold tracking-[0.01em] text-slate-950 leading-[1.12]">
            {post.title}
          </h1>
          {post.tags && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {post.tags.split(',').map((tag: string) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </header>
      </div>

      <ContentRenderer content={post.content} tocTitle="On This Page" variant="tour" footer={authorCard} />
    </div>
  );
}
