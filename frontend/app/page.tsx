import Link from 'next/link';
import { fetchTours, fetchConfig, fetchReviews, fetchSocialFeed } from '@/lib/api';
import HeroCarousel from '@/components/HeroCarousel';
import Reveal from '@/components/Reveal';
import ReviewCards from '@/components/ReviewCards';
import SocialShowcase from '@/components/SocialShowcase';
import { withPublicOrigin } from '@/lib/url';
import type { Review } from '@/lib/reviews';
import type { SocialFeed } from '@/lib/social';

interface Tour {
  id: number;
  title: string;
  description: string;
  cover_image?: string;
  price: number;
}

function normalizeSocialFeed(value: Partial<SocialFeed> | null | undefined): SocialFeed {
  return {
    instagram: Array.isArray(value?.instagram) ? value.instagram : [],
    tiktok: Array.isArray(value?.tiktok) ? value.tiktok : [],
  };
}

export default async function Home() {
  let tours: Tour[] = [];
  let reviews: Review[] = [];
  let socialFeed: SocialFeed = { instagram: [], tiktok: [] };
  let settings = {
    home_hero_title: 'Professional Tour Guide in Guangzhou',
    home_hero_subtitle: 'Explore the Pearl River and vibrant Cantonese culture.',
    home_static_image: '',
    home_featured_review_ids: [] as number[],
  };

  try {
    const [toursData, settingsRes, reviewsData, socialFeedData] = await Promise.all([
      fetchTours(),
      fetchConfig('site_settings').catch(() => null),
      fetchReviews().catch(() => []),
      fetchSocialFeed().catch(() => ({ instagram: [], tiktok: [] })),
    ]);
    tours = toursData.slice(0, 3);
    reviews = reviewsData;
    socialFeed = normalizeSocialFeed(socialFeedData);
    if (settingsRes) settings = { ...settings, ...settingsRes };
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }

  const selectedReviewIds = Array.isArray(settings.home_featured_review_ids)
    ? Array.from(
        new Set(
          settings.home_featured_review_ids
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)
        )
      )
    : [];

  const activeReviews = reviews.filter((review) => review.is_active !== false);

  const selectedReviews = selectedReviewIds
    .map((id) => activeReviews.find((review) => review.id === id))
    .filter((review): review is Review => Boolean(review));

  const homeReviews = [
    ...selectedReviews,
    ...activeReviews.filter((review) => !selectedReviewIds.includes(review.id)),
  ].slice(0, 4);

  const sectionShellClass = 'mx-auto max-w-[1520px] px-4 md:px-6 lg:px-8';

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <HeroCarousel
        defaultSettings={{
          title: settings.home_hero_title,
          subtitle: settings.home_hero_subtitle,
          image: settings.home_static_image
        }}
      />

      {/* Featured Tours */}
      <section className="w-full bg-[linear-gradient(180deg,rgba(247,251,255,0.86)_0%,rgba(237,244,255,0.88)_100%)]">
        <div className={`${sectionShellClass} py-24`}>
          <Reveal as="div" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-wide">Featured Tours</h2>
            <p className="text-slate-600">Curated routes with local insights and premium service.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.length > 0 ? (
              tours.map((tour, index) => (
                <Reveal
                  key={tour.id}
                  className="elevated-card overflow-hidden"
                  delay={index * 140}
                >
                  <div
                    className="h-52 bg-gray-200 bg-cover bg-center"
                    style={{
                      backgroundImage: tour.cover_image
                        ? `url(${withPublicOrigin(tour.cover_image)})`
                        : "url('https://images.unsplash.com/photo-1535598745644-bc791f07d6a5?auto=format&fit=crop&w=1200&q=80')"
                    }}
                  >
                    {!tour.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">{tour.title}</h3>
                    <p className="text-slate-600 mb-4 line-clamp-2">{tour.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-semibold">${tour.price} / person</span>
                      <Link href={`/tours/${tour.id}`} className="btn-secondary px-3 py-1.5 text-sm">
                        Know More →
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500">
                No tours available at the moment.
              </div>
            )}
          </div>
          <Reveal as="div" className="flex justify-center mt-10" delay={200}>
            <Link href="/tours" className="btn-primary px-6 py-3">
              View All Tours →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)]">
        <div className={`${sectionShellClass} py-24`}>
          <Reveal as="div" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-wide">Why Choose Me?</h2>
            <p className="text-slate-600">
              From planning to on-the-ground support, every detail is curated to give you an effortless, memorable journey.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal className="elevated-card p-8 flex items-start gap-5" delay={60}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Local Insider, Deeper Access</h3>
                <p className="text-slate-600">
                  I grew up here and stay current with the city’s hidden lanes, best viewpoints, and real local food spots.
                </p>
              </div>
            </Reveal>
            <Reveal className="elevated-card p-8 flex items-start gap-5" delay={200}>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Smart, Flexible Itineraries</h3>
                <p className="text-slate-600">
                  Routes are built around your pace and interests, with real-time adjustments to weather, crowds, and energy.
                </p>
              </div>
            </Reveal>
            <Reveal className="elevated-card p-8 flex items-start gap-5" delay={340}>
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Service That Feels Personal</h3>
                <p className="text-slate-600">
                  Clear communication, thoughtful details, and a calm, friendly pace so you feel cared for at every step.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="w-full bg-[linear-gradient(180deg,rgba(247,251,255,0.88)_0%,rgba(236,244,255,0.92)_100%)]">
        <div className={`${sectionShellClass} py-24`}>
          <Reveal as="div" className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4 tracking-wide">Reviews</h2>
            <p className="text-slate-600">
              Stories from guests who explored the city with a flexible pace, local insight, and tailored support.
            </p>
          </Reveal>

          <ReviewCards items={homeReviews} columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-4" />

          {homeReviews.length > 0 && (
            <Reveal as="div" className="flex justify-center mt-10" delay={200}>
              <Link href="/reviews" className="btn-primary px-6 py-3">
                View All Reviews →
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* Latest Blog */}
      <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)]">
        <div className={`${sectionShellClass} py-24`}>
          <Reveal as="div" delay={60}>
            <SocialShowcase
              instagramItems={socialFeed.instagram}
              tiktokItems={socialFeed.tiktok}
            />
          </Reveal>
        </div>
      </section>

      {/* Contact CTA */}
    </div>
  );
}
