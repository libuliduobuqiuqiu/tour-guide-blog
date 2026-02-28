import { fetchTour } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
    <div className="bg-[linear-gradient(180deg,#f7fbff_0%,#edf5ff_100%)] min-h-[calc(100vh-64px)]">
      <div className="w-full h-[320px] md:h-[380px] bg-gray-200 relative overflow-hidden reveal-down">
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
    
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 pt-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-wide text-slate-900">{tour.title}</h1>
          <div className="mt-4 md:mt-0 text-2xl font-semibold text-blue-700">
            ${tour.price} <span className="text-sm text-gray-500 font-normal">/ person</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 text-slate-600">
          <span className="flex items-center rounded-full bg-white border border-blue-100 px-4 py-2">⏱️ {tour.duration}</span>
          <span className="flex items-center rounded-full bg-white border border-blue-100 px-4 py-2">📍 {tour.location}</span>
        </div>
      </div>

      <ContentRenderer content={tour.content || ''} />

      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 mt-12">
        <div className="elevated-card p-8 text-center fade-up">
          <h3 className="text-2xl font-semibold mb-4">Interested in this tour?</h3>
          <p className="mb-6 text-slate-600">Contact me to book your adventure or customize your itinerary.</p>
          <Link href="/contact" className="btn-primary inline-flex px-8 py-3 text-lg">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
