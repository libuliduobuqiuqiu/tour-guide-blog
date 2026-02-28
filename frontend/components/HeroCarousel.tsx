'use client';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';

interface CarouselItem {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
}

interface HeroCarouselProps {
  items: CarouselItem[];
  defaultSettings: {
    title: string;
    subtitle: string;
  };
}

export default function HeroCarousel({ items, defaultSettings }: HeroCarouselProps) {
  const normalizeImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url;
    const trimmed = url.replace(/^\/?uploads\//, '');
    return `/uploads/${trimmed}`;
  };

  const heroItem = items.length > 0
    ? items[0]
    : { id: 0, title: defaultSettings.title, image_url: '/hero.jpg', link_url: '/tours' };

  return (
    <section
      className="w-full relative overflow-hidden"
    >
      <div className="w-full h-[66vh] max-h-[720px] min-h-[460px] md:min-h-[540px] relative">
        {heroItem.image_url && (
          <Image
            src={normalizeImageUrl(heroItem.image_url)}
            alt={heroItem.title || defaultSettings.title}
            fill
            unoptimized
            className="absolute inset-0 object-cover"
            priority
          />
        )}

        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl">
            <Reveal as="h1" className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {heroItem.title || defaultSettings.title}
            </Reveal>
            <Reveal
              as="p"
              className="text-base sm:text-lg md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md"
              delay={160}
            >
              {defaultSettings.subtitle}
            </Reveal>
            <Reveal as="div" delay={300}>
              <Link
                href={heroItem.link_url || '/tours'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all transform hover:scale-105 inline-block"
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
