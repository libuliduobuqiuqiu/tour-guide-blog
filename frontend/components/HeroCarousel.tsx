'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [current, setCurrent] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);

  const normalizeImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return url;
    const trimmed = url.replace(/^\/?uploads\//, '');
    return `/uploads/${trimmed}`;
  };

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    let ticking = false;
    const onResize = () => setViewportHeight(window.innerHeight);
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    onResize();
    onScroll();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const carouselItems = items.length > 0 ? items : [{ id: 0, title: defaultSettings.title, image_url: '/hero.jpg', link_url: '/tours' }];
  const next = () => setCurrent((prev) => (prev + 1) % carouselItems.length);
  const prev = () => setCurrent((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  const activeIndex = carouselItems.length > 0 ? current % carouselItems.length : 0;

  const minHeroHeight = viewportHeight < 768 ? 84 : 108;
  const shrinkDistance = Math.max(360, viewportHeight * 0.7);
  const shrinkProgress = Math.min(1, Math.max(0, scrollY / shrinkDistance));
  const heroHeight = viewportHeight - (viewportHeight - minHeroHeight) * shrinkProgress;
  const heroScale = 1 - 0.08 * shrinkProgress;

  return (
    <section
      className="w-full relative overflow-hidden group"
      style={{
        height: `${heroHeight}px`,
        transition: 'height 80ms linear',
        willChange: 'height'
      }}
    >
      <div className="w-full h-full relative">
          {carouselItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="w-full h-full relative">
                {item.image_url && (
                  <Image
                    src={normalizeImageUrl(item.image_url)}
                    alt={item.title || defaultSettings.title}
                    fill
                    unoptimized
                    className="absolute inset-0 object-cover"
                    priority={index === 0}
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(6,18,42,0.6)_0%,rgba(5,25,55,0.35)_55%,rgba(4,10,30,0.55)_100%)]"></div>
              </div>
            </div>
          ))}

          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="text-center text-white max-w-4xl" style={{ transform: `scale(${heroScale})`, transition: 'transform 120ms linear' }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">{carouselItems[activeIndex]?.title || defaultSettings.title}</h1>
              <p className="text-base sm:text-lg md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md">{defaultSettings.subtitle}</p>
              <Link
                href={carouselItems[activeIndex]?.link_url || '/tours'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all transform hover:scale-105 inline-block"
              >
                Explore
              </Link>
            </div>
          </div>

          {carouselItems.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all opacity-90 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Previous slide"
              >
                <ChevronLeft size={30} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all opacity-90 md:opacity-0 md:group-hover:opacity-100"
                aria-label="Next slide"
              >
                <ChevronRight size={30} />
              </button>

              <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 md:gap-3">
                {carouselItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`h-2.5 md:h-3 rounded-full transition-all ${
                      idx === activeIndex ? 'bg-white w-8 md:w-10' : 'bg-white/50 hover:bg-white/80 w-2.5 md:w-3'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
      </div>
    </section>
  );
}
