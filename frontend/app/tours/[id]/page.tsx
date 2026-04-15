import { fetchConfig, fetchTour } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ContentRenderer from '@/components/ContentRenderer';
import TourContentWithAside from '@/components/TourContentWithAside';
import TourRouteTimeline from '@/components/TourRouteTimeline';
import TourAvailabilityButton from '@/components/TourAvailabilityButton';
import { defaultTourDisplaySettings, normalizeTourDisplaySettings, splitPolicyLines } from '@/lib/tour-settings';
import { withPublicOrigin } from '@/lib/url';

interface TourRoutePoint {
  title: string;
  content: string;
  image: string;
}

function renderInfoCard(title: string, items: string[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="fade-up rounded-[1.6rem] border border-slate-200/90 bg-white/96 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.36)] backdrop-blur">
      <div className="mb-4 text-[15px] font-black uppercase tracking-[0.24em] text-blue-700 md:text-[17px]">{title}</div>
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

function renderPolicyCard(title: string, content: string) {
  const lines = splitPolicyLines(content);
  if (lines.length === 0) {
    return null;
  }

  return (
    <section className="fade-up rounded-[1.6rem] border border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,244,246,0.98)_0%,rgba(255,236,239,0.98)_100%)] p-5 shadow-[0_24px_60px_-42px_rgba(159,18,57,0.28)] backdrop-blur">
      <div className="mb-4 text-[15px] font-black uppercase tracking-[0.24em] text-rose-700 md:text-[17px]">{title}</div>
      <div className="space-y-2.5">
        {lines.map((item, index) => (
          <div key={`${title}-${index}`} className="text-sm leading-7 text-rose-950/85">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function renderBookingCard() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
      <div className="fade-up flex flex-col items-center justify-center gap-6 px-4 py-7 text-center md:gap-7 md:py-9">
        <p className="max-w-[42rem] text-[1.35rem] font-semibold leading-9 text-slate-800 md:text-[1.8rem] md:leading-[1.7]">
          Contact me to book the tour.
        </p>
        <Link
          href="/contact"
          className="btn-primary inline-flex px-10 py-4 text-[1.05rem] font-extrabold uppercase tracking-[0.14em] md:px-12 md:py-5 md:text-[1.3rem]"
        >
          BOOK NOW
        </Link>
      </div>
    </section>
  );
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let tour;
  let tourSettings = defaultTourDisplaySettings;
  try {
    const [tourData, settingsRes] = await Promise.all([
      fetchTour(String(id)),
      fetchConfig('site_settings').catch(() => null),
    ]);
    tour = tourData;
    if (settingsRes) {
      tourSettings = normalizeTourDisplaySettings(settingsRes);
    }
  } catch (error) {
    console.error('Failed to fetch tour:', error);
    return notFound();
  }

  const routePoints = Array.isArray(tour.route_points)
    ? tour.route_points.filter((point: TourRoutePoint) => point && (point.title || point.content || point.image))
    : [];
  const highlights = Array.isArray(tour.highlights) ? tour.highlights.filter(Boolean) : [];
  const places = Array.isArray(tour.places) ? tour.places.filter(Boolean) : [];
  const bookingTag = typeof tour.booking_tag === 'string' ? tour.booking_tag.trim() : '';
  const bookingNote = typeof tour.booking_note === 'string' ? tour.booking_note.trim() : '';
  const cancellationPolicy = tourSettings.tour_cancellation_policy.trim();
  const asideCards = (
    <>
      {renderInfoCard('Highlights', highlights)}
      {renderInfoCard('Places to Visit', places)}
      {renderPolicyCard('Cancellation Policy', cancellationPolicy)}
    </>
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
              <h1 className="text-4xl font-semibold tracking-[0.01em] text-slate-950 md:text-5xl md:leading-[1.08]">{tour.title}</h1>
              {tour.description && <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{tour.description}</p>}
            </div>
            <div className="flex flex-col items-start lg:items-end">
              <div className="text-[2.8rem] font-black leading-none text-slate-950 md:text-[3.5rem]">
                ${tour.price}
                {tourSettings.tour_price_suffix && (
                  <span className="ml-2 text-base font-semibold text-slate-500 md:text-lg">{tourSettings.tour_price_suffix}</span>
                )}
              </div>
              {bookingNote && <div className="mt-3 text-base font-normal text-slate-600 md:text-lg">{bookingNote}</div>}
              {tourSettings.tour_minimum_notice && (
                <div className="mt-2 text-base font-bold text-red-600 md:text-lg">{tourSettings.tour_minimum_notice}</div>
              )}
              <TourAvailabilityButton availability={tour.availability} maxBookings={tour.max_bookings ?? 0} />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 text-slate-700">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium">Duration: {tour.duration}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium">Location: {tour.location}</span>
            {bookingTag && <span className="rounded-full border border-blue-200 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-950">{bookingTag}</span>}
          </div>
        </section>
      </div>

      <div className="pt-10">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8">
          <TourContentWithAside aside={highlights.length > 0 || places.length > 0 || Boolean(cancellationPolicy) ? asideCards : undefined}>
              {routePoints.length > 0 ? (
                <TourRouteTimeline routePoints={routePoints} />
              ) : (
                <ContentRenderer
                  content={tour.content || ''}
                  toc={false}
                  variant="tour"
                />
              )}
          </TourContentWithAside>
        </div>
      </div>

      <div className="pb-16 pt-4 md:pb-20 md:pt-6">{renderBookingCard()}</div>
    </div>
  );
}
