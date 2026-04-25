import { fetchTour } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ContentRenderer from '@/components/ContentRenderer';
import TourRouteTimeline from '@/components/TourRouteTimeline';
import TourAvailabilityButton from '@/components/TourAvailabilityButton';
import { splitPolicyLines } from '@/lib/tour-settings';
import { withPublicOrigin } from '@/lib/url';

interface TourRoutePoint {
  title: string;
  content: string;
  image: string;
}

function renderInfoPanel(highlights: string[], places: string[], cancellationPolicy: string) {
  const policyLines = splitPolicyLines(cancellationPolicy);
  const sections = [
    { title: 'Highlights', items: highlights },
    { title: 'Places to Visit', items: places },
    { title: 'Cancellation Policy', items: policyLines },
  ].filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="fade-up rounded-[1.7rem] border border-slate-200/90 bg-white/94 px-5 py-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.22)] backdrop-blur md:px-7 md:py-6">
      <div className="grid gap-5 md:gap-6 lg:grid-cols-3">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.title}
            className={`min-w-0 ${
              sectionIndex < sections.length - 1 ? 'lg:border-r lg:border-slate-200/80 lg:pr-6' : ''
            }`}
          >
            <div
              className={`mb-3 text-[13px] font-black uppercase tracking-[0.2em] md:text-[14px] ${
                section.title === 'Cancellation Policy' ? 'text-rose-700' : 'text-blue-700'
              }`}
            >
              {section.title}
            </div>
            <div className="space-y-1.5">
              {section.items.map((item, index) => (
                <div key={`${section.title}-${index}`} className="text-sm leading-6 text-slate-700 md:text-[15px] md:leading-6">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderBookingCard() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
      <div className="fade-up flex flex-col items-center justify-center gap-6 px-4 py-7 text-center md:gap-7 md:py-9">
        <p className="max-w-[42rem] text-[1.18rem] font-semibold leading-8 text-slate-800 md:text-[1.45rem] md:leading-[1.65]">
          Contact me to book the tour.
        </p>
        <Link
          href="/contact"
          className="btn-primary inline-flex px-8 py-3.5 text-[0.98rem] font-extrabold uppercase tracking-[0.14em] md:px-10 md:py-4 md:text-[1.12rem]"
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
  try {
    tour = await fetchTour(String(id));
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
  const currencySymbol = typeof tour.currency_symbol === 'string' ? tour.currency_symbol.trim() : '';
  const priceSuffix = typeof tour.price_suffix === 'string' ? tour.price_suffix.trim() : '';
  const minimumNotice = typeof tour.minimum_notice === 'string' ? tour.minimum_notice.trim() : '';
  const cancellationPolicy = typeof tour.cancellation_policy === 'string' ? tour.cancellation_policy.trim() : '';
  const infoPanel = renderInfoPanel(highlights, places, cancellationPolicy);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fb_52%,#e9f1f8_100%)]">
      <div className="mx-auto max-w-[1280px] px-4 pt-6 md:px-6 md:pt-8 lg:px-8">
        <div className="reveal-down relative overflow-hidden rounded-[2rem] border border-white/75 bg-gray-200 shadow-[0_34px_90px_-54px_rgba(15,23,42,0.52)]">
          <div className="relative aspect-[16/9] min-h-[280px] md:aspect-[2/1] md:min-h-[460px]">
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

      <div className="mx-auto -mt-40 max-w-[1200px] px-4 md:-mt-48 md:px-6 lg:px-8">
        <section className="scale-in relative z-10 rounded-[2rem] border border-white/75 bg-white/88 px-5 py-7 shadow-[0_32px_90px_-52px_rgba(15,23,42,0.52)] backdrop-blur md:px-8 md:py-9">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_max-content] lg:items-end">
            <div className="max-w-[42rem]">
              <h1 className="text-[clamp(1.45rem,1.05rem+1.55vw,2.72rem)] font-semibold tracking-[0.01em] text-slate-950 leading-[1.12]">
                {tour.title}
              </h1>
              {tour.description && (
                <p className="mt-4 max-w-3xl text-[clamp(0.9rem,0.8rem+0.34vw,1rem)] leading-[1.72] text-slate-600">
                  {tour.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start lg:items-end lg:min-w-[340px] xl:min-w-[380px]">
              <div className="text-[2.25rem] font-black leading-none text-slate-950 md:text-[2.9rem] xl:text-[3.4rem]">
                {currencySymbol}{tour.price}
                {priceSuffix && (
                  <span className="ml-2 text-sm font-semibold text-slate-500 md:text-base">{priceSuffix}</span>
                )}
              </div>
              {bookingNote && <div className="mt-3 text-sm font-normal text-slate-600 md:text-base">{bookingNote}</div>}
              {minimumNotice && (
                <div className="mt-2 text-sm font-bold text-red-600 md:text-base lg:whitespace-nowrap">{minimumNotice}</div>
              )}
              <TourAvailabilityButton availability={tour.availability} />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 text-slate-700">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium">Duration: {tour.duration}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium">Location: {tour.location}</span>
            {bookingTag && <span className="rounded-full border border-blue-200 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-950">{bookingTag}</span>}
          </div>
        </section>
      </div>

      {infoPanel ? (
        <div className="pt-6 md:pt-7">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">{infoPanel}</div>
        </div>
      ) : null}

      <div className="pt-6 md:pt-8">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8">
          {routePoints.length > 0 ? (
            <TourRouteTimeline routePoints={routePoints} />
          ) : (
            <ContentRenderer content={tour.content || ''} toc={false} variant="tour" />
          )}
        </div>
      </div>

      <div className="pb-16 pt-4 md:pb-20 md:pt-6">{renderBookingCard()}</div>
    </div>
  );
}
