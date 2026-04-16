'use client';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { HOME_HERO_IMAGE_OBJECT_POSITION } from '@/lib/hero-image';
import { withPublicOrigin } from '@/lib/url';

interface HeroCarouselProps {
  defaultSettings: {
    title: string;
    subtitle: string;
    image?: string;
  };
}

export default function HeroCarousel({ defaultSettings }: HeroCarouselProps) {
  const normalizeImageUrl = (url: string) => {
    if (!url) return '';
    return withPublicOrigin(url);
  };

  const heroImage = defaultSettings.image
    ? normalizeImageUrl(defaultSettings.image)
    : 'https://images.unsplash.com/photo-1535598745644-bc791f07d6a5?auto=format&fit=crop&w=1800&q=80';

  return (
    <section
      className="w-full relative overflow-hidden"
    >
      <div
        className="relative w-full aspect-[4/5] min-h-[540px] sm:aspect-[5/4] sm:min-h-[620px] md:aspect-[1920/720] md:min-h-0"
      >
        {heroImage && (
          <Image
            src={heroImage}
            alt={defaultSettings.title}
            fill
            unoptimized
            className="absolute inset-0 object-cover"
            style={{ objectPosition: HOME_HERO_IMAGE_OBJECT_POSITION }}
            priority
          />
        )}

        <div className="absolute inset-0 z-20 flex items-end justify-center px-4 pb-12 pt-24 sm:px-6 sm:pb-16 md:items-center md:px-8 md:pb-0 md:pt-0">
          <div className="text-center text-white max-w-4xl">
            <Reveal as="h1" className="text-[clamp(2rem,7vw,3rem)] md:text-5xl 2xl:text-6xl font-bold mb-4 leading-[1.08] drop-shadow-lg">
              {defaultSettings.title}
            </Reveal>
            <Reveal
              as="p"
              className="mx-auto mb-7 max-w-[20rem] text-[0.98rem] leading-7 drop-shadow-md sm:max-w-[24rem] sm:text-lg md:mb-8 md:max-w-2xl md:text-xl 2xl:text-2xl"
              delay={160}
            >
              {defaultSettings.subtitle}
            </Reveal>
            <Reveal as="div" delay={300}>
              <Link
                href="/tours"
                className="inline-block rounded-full bg-blue-600 px-6 py-3 text-base font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 sm:px-8 sm:py-3.5 sm:text-lg"
              >
                Explore
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
