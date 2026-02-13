import Link from 'next/link';
import { fetchTours, fetchCarousels, fetchReviews } from '@/lib/api';
import HeroCarousel from '@/components/HeroCarousel';
import ReviewsCarousel from '@/components/ReviewsCarousel';

export default async function Home() {
  let tours = [];
  let carousels = [];
  let reviews = [];
  let settings = {
    home_hero_title: 'Professional Tour Guide in Chongqing & Chengdu',
    home_hero_subtitle: 'Discover the hidden gems of Southwest China with Janet.'
  };

  try {
    const [toursData, carouselsData, reviewsData, settingsRes] = await Promise.all([
      fetchTours(),
      fetchCarousels().catch(() => []),
      fetchReviews().catch(() => []),
      fetch('http://localhost:8080/api/config/site_settings', { next: { revalidate: 60 } }).then(res => res.json()).catch(() => null)
    ]);
    tours = toursData.slice(0, 3);
    if (carouselsData) carousels = carouselsData;
    if (reviewsData) reviews = reviewsData;
    if (settingsRes) {
      settings = JSON.parse(settingsRes);
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <HeroCarousel 
        items={carousels} 
        defaultSettings={{
          title: settings.home_hero_title,
          subtitle: settings.home_hero_subtitle
        }} 
      />

      {/* Featured Tours */}
      <section className="max-w-7xl mx-auto py-20 px-4 w-full">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Tours</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tours.length > 0 ? (
            tours.map((tour: any) => (
              <div key={tour.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div 
                  className="h-48 bg-gray-200 bg-cover bg-center" 
                  style={{ backgroundImage: tour.cover_image ? `url(${tour.cover_image})` : 'none' }}
                >
                  {!tour.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">${tour.price} / person</span>
                    <Link href={`/tours/${tour.id}`} className="text-blue-600 hover:underline">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">
              No tours available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Me?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Local Expert</h3>
              <p className="text-gray-600">Born and raised in Chongqing, I know every corner of this city and the best spots for authentic experiences.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Flexible Itinerary</h3>
              <p className="text-gray-600">Customized tour plans based on your interests and pace. No rush, just pure enjoyment.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-4">Personalized Service</h3>
              <p className="text-gray-600">I treat every guest like a friend, ensuring you have a comfortable and memorable trip.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsCarousel items={reviews} />

      {/* Contact CTA */}
    </div>
  );
}
