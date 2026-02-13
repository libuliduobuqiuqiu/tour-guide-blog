'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Review {
  id: number;
  username: string;
  content: string;
  avatar: string;
  rating: number;
}

export default function ReviewsCarousel({ items }: { items: Review[] }) {
  const [current, setCurrent] = useState(0);

  // Auto-scroll for reviews too, but maybe slower
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const next = () => setCurrent((prev) => (prev + 1) % items.length);
  const prev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);

  if (items.length === 0) return null;

  // We can show maybe 3 cards on desktop, 1 on mobile
  // But for simplicity, let's just show 1 big card or a simple carousel of 1 item
  // Or better: show 3 items if possible.
  // Let's implement a simple 1-item carousel first to ensure it works, then expand if needed.
  
  const currentItem = items[current];

  return (
    <section className="w-full bg-blue-50 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">What Travelers Say</h2>
        
        <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <Quote size={48} className="text-blue-100 absolute top-8 left-8 -z-0" />
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-4 border-blue-50">
                {currentItem.avatar ? (
                  <img src={currentItem.avatar.startsWith('http') ? currentItem.avatar : `http://localhost:8080${currentItem.avatar}`} alt={currentItem.username} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400 bg-gray-100">
                     {currentItem.username.charAt(0)}
                   </div>
                )}
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-6 italic">"{currentItem.content}"</p>
            
            <div className="flex justify-center mb-4 text-yellow-500 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={24} fill={i < currentItem.rating ? "currentColor" : "none"} />
              ))}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">{currentItem.username}</h3>
          </div>

          {items.length > 1 && (
            <>
              <button 
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>
        
        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === current ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
