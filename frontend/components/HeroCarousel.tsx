'use client';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { HOME_HERO_IMAGE_OBJECT_POSITION, HOME_HERO_IMAGE_RATIO } from '@/lib/hero-image';
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

  const heroAspectRatio = `${HOME_HERO_IMAGE_RATIO} / 1`;

  return (
    <section
      className="w-full relative overflow-hidden"
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: heroAspectRatio }}
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

        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl">
            <Reveal as="h1" className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold mb-4 drop-shadow-lg">
              {defaultSettings.title}
            </Reveal>
            <Reveal
              as="p"
              className="text-base sm:text-lg lg:text-xl 2xl:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md"
              delay={160}
            >
              {defaultSettings.subtitle}
            </Reveal>
            <Reveal as="div" delay={300}>
              <Link
                href="/tours"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-base sm:text-lg font-bold transition-all transform hover:scale-105 inline-block"
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
