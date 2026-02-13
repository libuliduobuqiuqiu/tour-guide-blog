import Link from 'next/link';
import { fetchTours } from '@/lib/api';

export default async function ToursPage() {
  let tours = [];
  try {
    tours = await fetchTours();
  } catch (error) {
    console.error('Failed to fetch tours:', error);
  }
  const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Tours</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tours.length > 0 ? (
          tours.map((tour: any) => (
            <div key={tour.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div 
                className="h-48 bg-gray-200 bg-cover bg-center" 
                style={{ 
                  backgroundImage: tour.cover_image 
                    ? `url(${tour.cover_image.startsWith('http') ? tour.cover_image : `${HOST}${tour.cover_image.startsWith('/') ? '' : '/'}${tour.cover_image}`})` 
                    : 'none' 
                }}
              >
                {!tour.cover_image && <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{tour.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">${tour.price} / person</span>
                  <Link href={`/tours/${tour.id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-12">
            No tours found. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
