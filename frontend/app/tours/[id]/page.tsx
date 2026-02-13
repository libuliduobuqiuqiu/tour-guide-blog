import { fetchTour } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ContentRenderer from '@/components/ContentRenderer';

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let tour;
  try {
    tour = await fetchTour(String(id));
  } catch (error) {
    console.error('Failed to fetch tour:', error);
    return notFound();
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <div className="w-full h-96 bg-gray-200 rounded-2xl mb-8 relative overflow-hidden">
        {tour.cover_image ? (
          <Image
            src={(tour.cover_image || '').startsWith('http') ? tour.cover_image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${tour.cover_image.startsWith('/') ? '' : '/'}${tour.cover_image}`}
            alt={tour.title}
            fill
            unoptimized
            className="absolute inset-0 object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
        </div>
      
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <h1 className="text-4xl font-bold">{tour.title}</h1>
        <div className="mt-4 md:mt-0 text-2xl font-bold text-blue-600">
          ${tour.price} <span className="text-sm text-gray-500 font-normal">/ person</span>
        </div>
        </div>

        <div className="flex gap-4 mb-8 text-gray-600">
        <span className="flex items-center">⏱️ {tour.duration}</span>
        <span className="flex items-center">📍 {tour.location}</span>
        </div>
      </div>

      <ContentRenderer content={tour.content || ''} />

      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 mt-12 p-8 bg-blue-50 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">Interested in this tour?</h3>
        <p className="mb-6 text-gray-600">Contact me to book your adventure or customize your itinerary.</p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all">
          Book Now
        </button>
      </div>
    </div>
  );
}
