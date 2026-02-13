'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const next = () => setCurrent((prev) => (prev + 1) % items.length);
  const prev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);

  // Fallback to default static hero if no carousel items
  if (items.length === 0) {
    return (
      <section className="w-full h-[70vh] bg-[url('/hero.jpg')] bg-cover bg-center flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">{defaultSettings.title}</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto">{defaultSettings.subtitle}</p>
          <Link href="/tours" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105">
            Start Your Journey
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full h-[70vh] relative group overflow-hidden">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: item.image_url ? `url(${item.image_url.startsWith('http') ? item.image_url : `http://localhost:8080${item.image_url}`})` : 'none' 
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">{item.title}</h1>
                {/* Use default subtitle or maybe we should have subtitle in carousel model? For now, use title only or default subtitle */}
                <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto drop-shadow-md">
                   {/* If we want to show the global subtitle, we can pass it, but maybe better to keep it clean */}
                </p>
                {item.link_url && (
                  <Link href={item.link_url} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 inline-block">
                    Explore
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {items.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
