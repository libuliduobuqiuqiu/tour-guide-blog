import { fetchTour } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ContentRenderer from '@/components/ContentRenderer';
import { withPublicOrigin } from '@/lib/url';

function renderInfoCard(title: string, items: string[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="fade-up rounded-[1.6rem] border border-slate-200/90 bg-white/96 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.36)] backdrop-blur">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</div>
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="text-sm leading-7 text-slate-700">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let tour;
  try {
    tour = await fetchTour(String(id));
  } catch (error) {
    console.error('Failed to fetch tour:', error);
    return notFound();
  }

  const highlights = Array.isArray(tour.highlights) ? tour.highlights.filter(Boolean) : [];
  const places = Array.isArray(tour.places) ? tour.places.filter(Boolean) : [];
  const asideCards = (
    <>
      {renderInfoCard('Highlights', highlights)}
      {renderInfoCard('Places to Visit', places)}
    </>
  );
  const bookingCard = (
    <div className="rounded-[1.55rem] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,254,0.96))] px-6 py-4 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.34)] md:px-7 md:py-5">
      <div className="max-w-[40rem]">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Booking</div>
        <h3 className="mb-2 text-[1.45rem] font-semibold leading-tight text-slate-950 md:text-[1.55rem]">Interested in this tour?</h3>
        <p className="mb-3.5 text-[0.98rem] leading-6 text-slate-600">Contact me to book your adventure or customize your itinerary.</p>
      </div>
      <Link href="/contact" className="btn-primary inline-flex px-5 py-2.5 text-sm">
        Book Now
      </Link>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fb_52%,#e9f1f8_100%)]">
      <div className="mx-auto max-w-[1420px] px-4 pt-6 md:px-6 md:pt-8 lg:px-8">
        <div className="reveal-down relative overflow-hidden rounded-[2rem] border border-white/75 bg-gray-200 shadow-[0_34px_90px_-54px_rgba(15,23,42,0.52)]">
          <div className="relative aspect-[16/9] min-h-[300px] md:aspect-[2/1] md:min-h-[520px]">
            {tour.cover_image ? (
              <Image
                src={withPublicOrigin(tour.cover_image || '')}
                alt={tour.title}
                fill
                unoptimized
                className="absolute inset-0 object-cover object-center"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.34)_100%)]" />
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-[1280px] px-4 md:px-6 lg:px-8">
        <section className="scale-in relative z-10 rounded-[2rem] border border-white/75 bg-white/88 px-6 py-8 shadow-[0_32px_90px_-52px_rgba(15,23,42,0.52)] backdrop-blur md:px-10 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Curated Tour</div>
              <h1 className="text-4xl font-semibold tracking-[0.01em] text-slate-950 md:text-5xl md:leading-[1.08]">{tour.title}</h1>
              {tour.description && <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{tour.description}</p>}
            </div>
            <div className="rounded-[1.5rem] bg-slate-950 px-6 py-5 text-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.65)]">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-300">From</div>
              <div className="mt-1 text-3xl font-semibold">
                ${tour.price} <span className="text-sm font-normal text-slate-300">/ person</span>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 text-slate-700">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium">Duration: {tour.duration}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium">Location: {tour.location}</span>
          </div>
        </section>
      </div>

      <div className="pt-10">
        <ContentRenderer
          content={tour.content || ''}
          toc={false}
          variant="tour"
          aside={highlights.length > 0 || places.length > 0 ? asideCards : undefined}
          footer={bookingCard}
        />
      </div>
    </div>
  );
}
