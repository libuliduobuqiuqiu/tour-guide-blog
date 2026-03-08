'use client';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';

interface HeroCarouselProps {
  defaultSettings: {
    title: string;
    subtitle: string;
    image?: string;
  };
}

export default function HeroCarousel({ defaultSettings }: HeroCarouselProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const normalizeImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_BASE_URL}${url}`;
    if (url.startsWith('uploads/')) return `${API_BASE_URL}/${url}`;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${normalizedPath}`;
  };

  const heroImage = defaultSettings.image
    ? normalizeImageUrl(defaultSettings.image)
    : 'https://images.unsplash.com/photo-1535598745644-bc791f07d6a5?auto=format&fit=crop&w=1800&q=80';

  return (
    <section
      className="w-full relative overflow-hidden"
    >
      <div className="w-full h-[66vh] max-h-[720px] min-h-[460px] md:min-h-[540px] relative">
        {heroImage && (
          <Image
            src={heroImage}
            alt={defaultSettings.title}
            fill
            unoptimized
            className="absolute inset-0 object-cover"
            priority
          />
        )}

        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl">
            <Reveal as="h1" className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {defaultSettings.title}
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
                href="/tours"
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
