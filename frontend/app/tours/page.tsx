import Link from 'next/link';
import { fetchTours } from '@/lib/api';

interface Tour {
  id: number;
  title: string;
  description: string;
  price: number;
  cover_image?: string;
}

export default async function ToursPage() {
  let tours: Tour[] = [];
  try {
    tours = await fetchTours();
  } catch (error) {
    console.error('Failed to fetch tours:', error);
  }
  const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="py-12 md:py-16 bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="max-w-[1400px] mx-auto px-3 md:px-4 lg:px-6">
        <header className="mb-10 fade-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-wide">Our Tours</h1>
          <p className="mt-3 text-slate-600 text-lg">Handpicked routes designed for deep local experience.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {tours.length > 0 ? (
          tours.map((tour) => (
            <article key={tour.id} className="elevated-card overflow-hidden fade-up min-h-[440px] flex flex-col">
              <div 
                className="h-56 bg-gray-200 bg-cover bg-center" 
                style={{ 
                  backgroundImage: tour.cover_image 
                    ? `url(${tour.cover_image.startsWith('http') ? tour.cover_image : `${HOST}${tour.cover_image.startsWith('/') ? '' : '/'}${tour.cover_image}`})` 
                    : "url('https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80')" 
                }}
              >
                {!tour.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold mb-2 text-slate-900 line-clamp-2">{tour.title}</h3>
                <p className="text-slate-600 mb-5 line-clamp-4">{tour.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-blue-700 font-semibold">${tour.price} / person</span>
                  <Link href={`/tours/${tour.id}`} className="btn-secondary px-4 py-2 text-sm">
                    Details
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-12">
            No tours found. Check back later!
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
